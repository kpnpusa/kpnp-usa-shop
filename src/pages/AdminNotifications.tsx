import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Bell, ArrowLeft, LogOut, MessageCircle, Package, Send } from "lucide-react";
import { toast } from "sonner";

const AdminNotifications = () => {
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [history, setHistory] = useState<any[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (!data.session) navigate("/admin");
    });
    fetchHistory();
  }, [navigate]);

  const fetchHistory = async () => {
    setLoadingHistory(true);
    const { data, error } = await supabase
      .from("notifications")
      .select("*")
      .eq("type", "announcement")
      .order("created_at", { ascending: false })
      .limit(50);
    
    if (!error && data) {
      // Deduplicate by title+message+created_at (within 1 min window)
      const unique: any[] = [];
      const seen = new Set<string>();
      for (const n of data) {
        const key = `${n.title}|${n.message}|${n.created_at.slice(0, 16)}`;
        if (!seen.has(key)) {
          seen.add(key);
          unique.push(n);
        }
      }
      setHistory(unique);
    }
    setLoadingHistory(false);
  };

  const handleSend = async () => {
    if (!title.trim() || !message.trim()) {
      toast.error("Preencha o título e a mensagem");
      return;
    }

    setSending(true);
    try {
      const { data, error } = await supabase.functions.invoke("admin-broadcast-notification", {
        body: { title: title.trim(), message: message.trim(), type: "announcement" },
      });

      if (error || data?.error) {
        toast.error(data?.error || "Falha ao enviar notificações");
      } else {
        toast.success(`Notificação enviada para ${data.sent} usuários!`);
        setTitle("");
        setMessage("");
        fetchHistory();
      }
    } catch {
      toast.error("Erro ao enviar notificações");
    }
    setSending(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/admin");
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Top bar */}
      <div className="flex items-center justify-between px-6 py-3 border-b border-border bg-card">
        <div className="flex items-center gap-4">
          <Bell className="w-5 h-5 text-primary" />
          <h1 className="text-xl text-foreground" style={{ fontFamily: "'Bebas Neue', sans-serif", letterSpacing: "0.04em" }}>
            Admin Panel
          </h1>
          <div className="flex items-center gap-1 ml-4">
            <Button variant="ghost" size="sm" className="text-xs" onClick={() => navigate("/admin/chat")}>
              <MessageCircle className="w-3 h-3 mr-1" /> Chat
            </Button>
            <Button variant="ghost" size="sm" className="text-xs" onClick={() => navigate("/admin/orders")}>
              <Package className="w-3 h-3 mr-1" /> Orders
            </Button>
            <Button variant="default" size="sm" className="text-xs">
              <Bell className="w-3 h-3 mr-1" /> Notifications
            </Button>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="ghost" size="sm" onClick={handleLogout}>
            <LogOut className="w-4 h-4 mr-1" /> Logout
          </Button>
        </div>
      </div>

      <div className="container mx-auto max-w-2xl px-4 py-6">
        {/* Compose */}
        <div className="glass-card rounded-xl p-6 mb-6">
          <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
            <Send className="w-4 h-4" />
            Enviar Notificação para Todos
          </h2>
          <div className="space-y-4">
            <div>
              <label className="text-sm text-muted-foreground mb-1 block">Título</label>
              <Input
                placeholder="Ex: Promoção de Verão 🔥"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                maxLength={100}
              />
            </div>
            <div>
              <label className="text-sm text-muted-foreground mb-1 block">Mensagem</label>
              <Textarea
                placeholder="Descreva a novidade ou promoção..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={4}
                maxLength={500}
              />
              <p className="text-xs text-muted-foreground mt-1 text-right">{message.length}/500</p>
            </div>
            <Button
              onClick={handleSend}
              disabled={sending || !title.trim() || !message.trim()}
              className="w-full"
            >
              {sending ? "Enviando..." : "Enviar para todos os usuários"}
            </Button>
          </div>
        </div>

        {/* History */}
        <div className="glass-card rounded-xl p-6">
          <h2 className="text-lg font-semibold text-foreground mb-4">Histórico de Notificações</h2>
          {loadingHistory ? (
            <p className="text-sm text-muted-foreground">Carregando...</p>
          ) : history.length === 0 ? (
            <p className="text-sm text-muted-foreground">Nenhuma notificação enviada ainda.</p>
          ) : (
            <div className="space-y-3">
              {history.map((n) => (
                <div key={n.id} className="border border-border rounded-lg p-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium text-sm text-foreground">{n.title}</span>
                    <span className="text-xs text-muted-foreground">
                      {new Date(n.created_at).toLocaleDateString("pt-BR", {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">{n.message}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminNotifications;
