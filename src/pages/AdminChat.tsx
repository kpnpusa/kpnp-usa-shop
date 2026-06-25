import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { playNotificationSound } from "@/lib/notificationSound";
import { Button } from "@/components/ui/button";
import { Send, LogOut, MessageCircle, Bot, User, UserCheck, X, Package, Bell } from "lucide-react";
import { toast } from "sonner";

type Conversation = {
  id: string;
  customer_name: string | null;
  status: string;
  created_at: string;
  updated_at: string;
};

type Message = {
  id: string;
  conversation_id: string;
  role: string;
  content: string;
  created_at: string;
};

const AdminChat = () => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConv, setSelectedConv] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [checking, setChecking] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);
  const typingTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const prevWaitingCount = useRef(-1);
  const navigate = useNavigate();

  // Verify admin access server-side
  useEffect(() => {
    const checkAdmin = async () => {
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session) {
        navigate("/admin");
        return;
      }
      // Verify admin via edge function
      const { data, error } = await supabase.functions.invoke("admin-orders");
      if (error || data?.error) {
        toast.error("Access denied. Not authorized as admin.");
        await supabase.auth.signOut();
        navigate("/admin");
        return;
      }
      setIsAdmin(true);
      setChecking(false);
    };
    checkAdmin();
  }, [navigate]);

  // Load conversations
  const loadConversations = useCallback(async () => {
    if (!isAdmin) return;
    const { data } = await supabase
      .from("conversations")
      .select("*")
      .in("status", ["waiting", "active", "ai"])
      .order("updated_at", { ascending: false });
    if (data) {
      const waitingCount = data.filter((c: any) => c.status === "waiting").length;
      if (waitingCount > prevWaitingCount.current && prevWaitingCount.current >= 0) {
        playNotificationSound();
      }
      prevWaitingCount.current = waitingCount;
      setConversations(data as Conversation[]);
    }
  }, [isAdmin]);

  useEffect(() => {
    loadConversations();
  }, [loadConversations]);

  // Realtime conversations
  useEffect(() => {
    if (!isAdmin) return;
    const channel = supabase
      .channel("admin-conversations")
      .on("postgres_changes", { event: "*", schema: "public", table: "conversations" }, () => {
        loadConversations();
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [loadConversations, isAdmin]);

  // Load messages for selected conversation
  useEffect(() => {
    if (!selectedConv) { setMessages([]); return; }
    const load = async () => {
      const { data } = await supabase
        .from("messages")
        .select("*")
        .eq("conversation_id", selectedConv)
        .order("created_at", { ascending: true });
      if (data) setMessages(data as Message[]);
    };
    load();
  }, [selectedConv]);

  // Realtime messages
  useEffect(() => {
    if (!selectedConv) return;
    const channel = supabase
      .channel(`admin-msgs-${selectedConv}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "messages", filter: `conversation_id=eq.${selectedConv}` },
        (payload) => {
          const newMsg = payload.new as Message;
          setMessages((prev) => {
            if (prev.some((m) => m.id === newMsg.id)) return prev;
            return [...prev, newMsg];
          });
        }
      )
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [selectedConv]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  const joinConversation = async (convId: string) => {
    setSelectedConv(convId);
    await supabase.from("conversations").update({ status: "active" }).eq("id", convId);
    loadConversations();
  };

  const closeConversation = async () => {
    if (!selectedConv) return;
    await supabase.from("conversations").update({ status: "closed" }).eq("id", selectedConv);
    setSelectedConv(null);
    loadConversations();
    toast.success("Conversation closed");
  };

  const sendMessage = async () => {
    const text = input.trim();
    if (!text || !selectedConv || sending) return;
    setSending(true);
    setInput("");
    await supabase.from("messages").insert({ conversation_id: selectedConv, role: "agent", content: text });
    setSending(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/admin");
  };

  const statusBadge = (status: string) => {
    if (status === "waiting") return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-amber-500/20 text-amber-400">Waiting</span>;
    if (status === "active") return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-emerald-500/20 text-emerald-400">Active</span>;
    return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-muted text-muted-foreground">AI</span>;
  };

  const roleIcon = (role: string) => {
    if (role === "agent") return <UserCheck className="w-3 h-3 text-emerald-400" />;
    if (role === "assistant") return <Bot className="w-3 h-3 text-primary" />;
    return <User className="w-3 h-3 text-muted-foreground" />;
  };

  if (checking) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Verifying admin access...</p>
      </div>
    );
  }

  const selectedConvData = conversations.find((c) => c.id === selectedConv);
  const waitingCount = conversations.filter((c) => c.status === "waiting").length;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Top bar */}
      <div className="flex items-center justify-between px-6 py-3 border-b border-border bg-card">
        <div className="flex items-center gap-4">
          <MessageCircle className="w-5 h-5 text-primary" />
          <h1 className="text-xl text-foreground" style={{ fontFamily: "'Bebas Neue', sans-serif", letterSpacing: "0.04em" }}>
            Admin Panel
          </h1>
          <div className="flex items-center gap-1 ml-4">
            <Button variant="default" size="sm" className="text-xs relative">
              <MessageCircle className="w-3 h-3 mr-1" /> Chat
              {waitingCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] flex items-center justify-center rounded-full bg-destructive text-destructive-foreground text-[10px] font-bold px-1 animate-pulse">
                  {waitingCount}
                </span>
              )}
            </Button>
            <Button variant="ghost" size="sm" className="text-xs" onClick={() => navigate("/admin/orders")}>
              <Package className="w-3 h-3 mr-1" /> Orders
            </Button>
            <Button variant="ghost" size="sm" className="text-xs" onClick={() => navigate("/admin/notifications")}>
              <Bell className="w-3 h-3 mr-1" /> Notifications
            </Button>
          </div>
        </div>
        <Button variant="ghost" size="sm" onClick={handleLogout}>
          <LogOut className="w-4 h-4 mr-1" /> Logout
        </Button>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar - Conversations */}
        <div className="w-80 border-r border-border bg-card/50 flex flex-col overflow-hidden">
          <div className="p-3 border-b border-border flex items-center justify-between">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Conversations</p>
            {waitingCount > 0 && (
              <span className="min-w-[20px] h-5 flex items-center justify-center rounded-full bg-amber-500/20 text-amber-400 text-[10px] font-bold px-1.5">
                {waitingCount} waiting
              </span>
            )}
          </div>
          <div className="flex-1 overflow-y-auto">
            {conversations.length === 0 && (
              <p className="p-4 text-sm text-muted-foreground text-center">No conversations yet</p>
            )}
            {conversations.map((conv, index) => (
              <button
                key={conv.id}
                onClick={() => joinConversation(conv.id)}
                className={`w-full text-left px-4 py-3 border-b border-border/50 hover:bg-secondary/50 transition-colors ${selectedConv === conv.id ? "bg-secondary" : ""}`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-foreground">
                    #{conversations.length - index} — {conv.customer_name || `Customer`}
                  </span>
                  {statusBadge(conv.status)}
                </div>
                <p className="text-xs text-muted-foreground">
                  {new Date(conv.updated_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </p>
              </button>
            ))}
          </div>
        </div>

        {/* Chat area */}
        <div className="flex-1 flex flex-col">
          {!selectedConv ? (
            <div className="flex-1 flex items-center justify-center text-muted-foreground">
              <div className="text-center">
                <MessageCircle className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p className="text-sm">Select a conversation to start chatting</p>
              </div>
            </div>
          ) : (
            <>
              {/* Chat header */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-card/50">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                    <User className="w-4 h-4 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">{selectedConvData?.customer_name || "Customer"}</p>
                    <p className="text-xs text-muted-foreground">{selectedConvData?.status === "active" ? "You're chatting" : "Viewing"}</p>
                  </div>
                </div>
                <Button variant="ghost" size="sm" onClick={closeConversation} className="text-destructive hover:text-destructive">
                  <X className="w-4 h-4 mr-1" /> Close
                </Button>
              </div>

              {/* Messages */}
              <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3">
                {messages.map((msg) => (
                  <div key={msg.id} className={`flex gap-2 ${msg.role === "agent" ? "justify-end" : "justify-start"}`}>
                    {msg.role !== "agent" && (
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-1 ${msg.role === "assistant" ? "bg-primary/20" : "bg-muted"}`}>
                        {roleIcon(msg.role)}
                      </div>
                    )}
                    <div className={`max-w-[70%] px-3 py-2 rounded-xl text-sm leading-relaxed ${
                      msg.role === "agent"
                        ? "bg-emerald-900/50 text-emerald-100 rounded-br-sm"
                        : msg.role === "assistant"
                        ? "bg-secondary text-secondary-foreground rounded-bl-sm"
                        : "bg-muted text-foreground rounded-bl-sm"
                    }`}>
                      <p className="text-[10px] font-semibold uppercase tracking-wider mb-0.5 opacity-60">
                        {msg.role === "agent" ? "You" : msg.role === "assistant" ? "AI Bot" : "Customer"}
                      </p>
                      {msg.content}
                    </div>
                    {msg.role === "agent" && (
                      <div className="w-6 h-6 rounded-full bg-emerald-900/30 flex items-center justify-center flex-shrink-0 mt-1">
                        {roleIcon("agent")}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Input */}
              <div className="p-3 border-t border-border">
                <form onSubmit={(e) => { e.preventDefault(); sendMessage(); }} className="flex gap-2">
                  <input
                    value={input}
                    onChange={(e) => {
                      setInput(e.target.value);
                      if (selectedConv && e.target.value.trim()) {
                        if (typingTimeout.current) clearTimeout(typingTimeout.current);
                        typingTimeout.current = setTimeout(() => {
                          supabase.rpc("set_agent_typing", { p_conversation_id: selectedConv });
                        }, 300);
                      }
                    }}
                    placeholder="Type your reply..."
                    className="form-input flex-1"
                    disabled={sending}
                  />
                  <Button type="submit" disabled={sending || !input.trim()}>
                    <Send className="w-4 h-4" />
                  </Button>
                </form>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminChat;
