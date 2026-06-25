import { useState, useRef, useEffect, useCallback } from "react";
import { MessageCircle, X, Send, Bot, User, UserCheck } from "lucide-react";
import { useTranslation } from "react-i18next";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { playNotificationSound } from "@/lib/notificationSound";

type Message = { role: "customer" | "assistant" | "agent"; content: string };

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/chat`;

const ChatBot = () => {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [sessionToken, setSessionToken] = useState<string | null>(null);
  const [mode, setMode] = useState<"ai" | "waiting" | "active">("ai");
  const [agentTyping, setAgentTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const initialized = useRef(false);

  useEffect(() => {
    if (!initialized.current) {
      setMessages([{ role: "assistant", content: t("chat.greeting") }]);
      initialized.current = true;
    }
  }, [t]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  // Realtime: listen for agent messages and status changes
  // Note: realtime postgres_changes won't work for public users since SELECT is denied.
  // Instead, we poll for new messages when in waiting/active mode.
  useEffect(() => {
    if (!conversationId || !sessionToken || mode === "ai") return;

    const interval = setInterval(async () => {
      // Check conversation status to detect if admin closed the chat
      const { data: convData } = await supabase
        .from("conversations")
        .select("status")
        .eq("id", conversationId)
        .single();

      if (convData?.status === "closed") {
        setMode("ai");
        setMessages((prev) => [...prev, { role: "assistant", content: t("chat.agentEnded") }]);
        setConversationId(null);
        setSessionToken(null);
        return;
      }

      const [msgsResult, typingResult] = await Promise.all([
        supabase.rpc("get_conversation_messages", {
          p_conversation_id: conversationId,
          p_session_token: sessionToken,
        }),
        supabase.rpc("check_agent_typing", {
          p_conversation_id: conversationId,
          p_session_token: sessionToken,
        }),
      ]);

      if (typingResult.data !== null) {
        setAgentTyping(!!typingResult.data);
      }

      const { data } = msgsResult;
      if (data && Array.isArray(data)) {
        const agentMsgs = data.filter((m: any) => m.role === "agent");
        const currentAgentCount = messages.filter((m) => m.role === "agent").length;
        if (agentMsgs.length > currentAgentCount) {
          playNotificationSound();
          const dbMessages: Message[] = data.map((m: any) => ({
            role: m.role as Message["role"],
            content: m.content,
          }));
          setMessages([
            { role: "assistant", content: t("chat.greeting") },
            ...dbMessages,
          ]);
          if (mode !== "active") setMode("active");
          setAgentTyping(false);
        }
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [conversationId, sessionToken, mode, messages, t]);

  const ensureConversation = useCallback(async () => {
    if (conversationId && sessionToken) return { id: conversationId, token: sessionToken };
    const { data, error } = await supabase
      .from("conversations")
      .insert({ status: "ai" })
      .select("id, session_token")
      .single();
    if (error || !data) throw new Error("Failed to create conversation");
    setConversationId(data.id);
    setSessionToken(data.session_token);
    return { id: data.id, token: data.session_token };
  }, [conversationId, sessionToken]);

  const saveCustomerMessage = async (convId: string, token: string, content: string) => {
    const { error } = await supabase.rpc("send_customer_message", {
      p_conversation_id: convId,
      p_session_token: token,
      p_content: content,
    });
    if (error) console.error("saveCustomerMessage error:", error);
  };

  const requestHuman = async () => {
    try {
      const conv = await ensureConversation();
      // Request human agent via SECURITY DEFINER RPC
      const { error } = await supabase.rpc("request_human_agent", {
        p_conversation_id: conv.id,
        p_session_token: conv.token,
      });
      if (error) {
        console.error("request_human_agent error:", error);
        setMessages((prev) => [...prev, { role: "assistant", content: t("chat.errorMessage") }]);
        return;
      }
      setMode("waiting");
      setMessages((prev) => [...prev, { role: "assistant", content: t("chat.agentNotified") }]);
    } catch (e) {
      console.error("requestHuman error:", e);
      setMessages((prev) => [...prev, { role: "assistant", content: t("chat.errorMessage") }]);
    }
  };

  const endChat = async () => {
    if (!conversationId || !sessionToken) return;
    await (supabase.rpc as any)("end_customer_chat", {
      p_conversation_id: conversationId,
      p_session_token: sessionToken,
    });
    setMode("ai");
    setMessages([{ role: "assistant", content: t("chat.greeting") }]);
    setConversationId(null);
    setSessionToken(null);
  };

  const send = async () => {
    const text = input.trim();
    if (!text || isLoading) return;

    const userMsg: Message = { role: "customer", content: text };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");

    // Ensure conversation exists so ALL messages are saved to DB
    const conv = await ensureConversation();
    await saveCustomerMessage(conv.id, conv.token, text);

    // Don't trigger AI when waiting for or chatting with a human
    if (mode === "waiting" || mode === "active") return;

    setIsLoading(true);
    let assistantSoFar = "";

    try {
      const aiMessages = messages
        .filter((m) => m.role !== "agent")
        .map((m) => ({ role: m.role === "customer" ? "user" as const : "assistant" as const, content: m.content }));
      aiMessages.push({ role: "user", content: text });

      const resp = await fetch(CHAT_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({ messages: aiMessages, conversationId: conv.id, sessionToken: conv.token }),
      });

      if (!resp.ok || !resp.body) {
        const errData = await resp.json().catch(() => ({}));
        throw new Error(errData.error || "Failed to get response");
      }

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let textBuffer = "";
      let streamDone = false;

      while (!streamDone) {
        const { done, value } = await reader.read();
        if (done) break;
        textBuffer += decoder.decode(value, { stream: true });

        let newlineIndex: number;
        while ((newlineIndex = textBuffer.indexOf("\n")) !== -1) {
          let line = textBuffer.slice(0, newlineIndex);
          textBuffer = textBuffer.slice(newlineIndex + 1);
          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (line.startsWith(":") || line.trim() === "") continue;
          if (!line.startsWith("data: ")) continue;

          const jsonStr = line.slice(6).trim();
          if (jsonStr === "[DONE]") { streamDone = true; break; }

          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content as string | undefined;
            if (content) {
              assistantSoFar += content;
              const current = assistantSoFar;
              setMessages((prev) => {
                const last = prev[prev.length - 1];
                if (last?.role === "assistant" && prev.length > 1 && prev[prev.length - 2]?.role === "customer") {
                  return prev.map((m, i) => (i === prev.length - 1 ? { ...m, content: current } : m));
                }
                return [...prev, { role: "assistant", content: current }];
              });
            }
          } catch {
            textBuffer = line + "\n" + textBuffer;
            break;
          }
        }
      }

      // Assistant message is saved server-side by the chat edge function
    } catch (e) {
      console.error(e);
      setMessages((prev) => [...prev, { role: "assistant", content: t("chat.errorMessage") }]);
    } finally {
      setIsLoading(false);
    }
  };

  const roleIcon = (role: string) => {
    if (role === "agent") return <UserCheck className="w-3 h-3 text-emerald-400" />;
    if (role === "assistant") return <Bot className="w-3 h-3 text-primary" />;
    return <User className="w-3 h-3 text-muted-foreground" />;
  };

  const roleBubbleBg = (role: string) => {
    if (role === "agent") return "bg-emerald-900/50 text-emerald-100 rounded-bl-sm";
    if (role === "assistant") return "bg-secondary text-secondary-foreground rounded-bl-sm";
    return "bg-primary text-primary-foreground rounded-br-sm";
  };

  return (
    <>
      <AnimatePresence>
        {!open && (
          <motion.button
            initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}
            onClick={() => setOpen(true)}
            className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-primary text-primary-foreground shadow-lg hover:bg-primary/90 transition-colors flex items-center justify-center"
            aria-label="Open chat"
          >
            <MessageCircle className="w-6 h-6" />
          </motion.button>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-6 right-6 z-50 w-[360px] h-[500px] max-h-[80vh] bg-card border border-border rounded-2xl shadow-2xl flex flex-col overflow-hidden"
          >
            <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-secondary/50">
              <div className="flex items-center gap-2">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${mode === "active" ? "bg-emerald-600" : "bg-primary"}`}>
                  {mode === "active" ? <UserCheck className="w-4 h-4 text-primary-foreground" /> : <Bot className="w-4 h-4 text-primary-foreground" />}
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">
                    {mode === "active" ? t("chat.liveAgent") : t("chat.assistant")}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {mode === "active" ? t("chat.connectedToAgent") : mode === "waiting" ? t("chat.waitingForAgent") : t("chat.aiOnline")}
                  </p>
                </div>
              </div>
              <button onClick={() => setOpen(false)} className="p-1 text-muted-foreground hover:text-foreground">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="px-4 py-1.5 bg-secondary/50 border-b border-border text-xs text-muted-foreground text-center">
              {t("chat.businessHours")}
            </div>

            <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.map((msg, i) => (
                <div key={i} className={`flex gap-2 ${msg.role === "customer" ? "justify-end" : "justify-start"}`}>
                  {msg.role !== "customer" && (
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-1 ${msg.role === "agent" ? "bg-emerald-900/30" : "bg-primary/20"}`}>
                      {roleIcon(msg.role)}
                    </div>
                  )}
                  <div className={`max-w-[80%] px-3 py-2 rounded-xl text-sm leading-relaxed ${roleBubbleBg(msg.role)}`}>
                    {msg.content}
                  </div>
                  {msg.role === "customer" && (
                    <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center flex-shrink-0 mt-1">
                      {roleIcon("customer")}
                    </div>
                  )}
                </div>
              ))}
              {isLoading && messages[messages.length - 1]?.role === "customer" && (
                <div className="flex gap-2">
                  <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                    <Bot className="w-3 h-3 text-primary" />
                  </div>
                  <div className="bg-secondary text-secondary-foreground px-3 py-2 rounded-xl rounded-bl-sm text-sm">
                    <span className="animate-pulse">{t("chat.thinking")}</span>
                  </div>
                </div>
              )}
              {agentTyping && !isLoading && (
                <div className="flex gap-2">
                  <div className="w-6 h-6 rounded-full bg-emerald-900/30 flex items-center justify-center flex-shrink-0">
                    <UserCheck className="w-3 h-3 text-emerald-400" />
                  </div>
                  <div className="bg-secondary text-secondary-foreground px-3 py-2 rounded-xl rounded-bl-sm text-sm">
                    <span className="flex items-center gap-1">
                      <span className="inline-flex gap-0.5">
                        <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                        <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                        <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                      </span>
                    </span>
                  </div>
                </div>
              )}
            </div>

            {mode === "ai" && (
              <div className="px-3 pb-1">
                <button
                  onClick={requestHuman}
                  className="w-full text-xs text-muted-foreground hover:text-foreground py-1.5 rounded-lg border border-border hover:bg-secondary/50 transition-colors flex items-center justify-center gap-1.5"
                >
                  <UserCheck className="w-3 h-3" />
                  {t("chat.talkToHuman")}
                </button>
              </div>
            )}

            {(mode === "waiting" || mode === "active") && (
              <div className="px-3 pb-1">
                <button
                  onClick={endChat}
                  className="w-full text-xs text-destructive hover:text-destructive/80 py-1.5 rounded-lg border border-destructive/30 hover:bg-destructive/10 transition-colors flex items-center justify-center gap-1.5"
                >
                  <X className="w-3 h-3" />
                  {t("chat.endChat")}
                </button>
              </div>
            )}

            <div className="p-3 border-t border-border">
              <form onSubmit={(e) => { e.preventDefault(); send(); }} className="flex gap-2">
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder={mode === "active" ? t("chat.messageAgent") : mode === "waiting" ? t("chat.waitingForAgent") : t("chat.askAbout")}
                  className="flex-1 bg-secondary text-foreground placeholder:text-muted-foreground text-sm px-3 py-2 rounded-lg border border-border focus:outline-none focus:ring-1 focus:ring-primary"
                  disabled={isLoading}
                />
                <button
                  type="submit"
                  disabled={isLoading || !input.trim()}
                  className="p-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-40 transition-colors"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default ChatBot;
