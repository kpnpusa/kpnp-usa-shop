import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import {
  ArrowLeft,
  Package,
  Search,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  MessageCircle,
  LogOut,
  Bell,
} from "lucide-react";
import { toast } from "sonner";
import type { Json } from "@/integrations/supabase/types";

type Order = {
  id: string;
  user_id: string;
  total_amount: number;
  status: string;
  items: Json;
  shipping_address: Json | null;
  stripe_payment_intent_id: string | null;
  tracking_number: string | null;
  created_at: string;
  updated_at: string;
};

const STATUS_OPTIONS = ["pending", "confirmed", "processing", "shipped", "delivered", "cancelled"];


const statusColor: Record<string, string> = {
  pending: "bg-yellow-500/20 text-yellow-400",
  confirmed: "bg-blue-500/20 text-blue-400",
  processing: "bg-purple-500/20 text-purple-400",
  shipped: "bg-cyan-500/20 text-cyan-400",
  delivered: "bg-green-500/20 text-green-400",
  cancelled: "bg-destructive/20 text-destructive",
};

const AdminOrders = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [profiles, setProfiles] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);
  const [trackingInputs, setTrackingInputs] = useState<Record<string, string>>({});
  
  const [savingTracking, setSavingTracking] = useState<string | null>(null);

  useEffect(() => {
    const checkAdmin = async () => {
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session) { navigate("/admin"); return; }
      const { data, error } = await supabase.functions.invoke("admin-orders");
      if (error || data?.error) {
        toast.error("Access denied.");
        await supabase.auth.signOut();
        navigate("/admin");
        return;
      }
      // Store initial data
      if (data?.orders) {
        setOrders(data.orders);
        setProfiles(data.profiles || {});
        setLoading(false);
      }
    };
    checkAdmin();
  }, [navigate]);

  const fetchOrders = async () => {
    setLoading(true);
    const { data, error } = await supabase.functions.invoke("admin-orders");

    if (error || data?.error) {
      const message = data?.error === "Forbidden"
        ? "Acesso negado: entre com o email admin@kpnpamerica.com no /admin."
        : data?.error || "Failed to load orders";
      toast.error(message);
      setLoading(false);
      return;
    }

    setOrders(data.orders || []);
    setProfiles(data.profiles || {});
    setLoading(false);
  };

  useEffect(() => {
    fetchOrders();

    // Realtime subscription for new orders
    const channel = supabase
      .channel("admin-orders-realtime")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "orders" },
        (payload) => {
          console.log("New order received:", payload.new);
          const newOrder = payload.new as Order;
          setOrders((prev) => {
            // Avoid duplicates
            if (prev.some((o) => o.id === newOrder.id)) return prev;
            return [newOrder, ...prev];
          });
          // Play notification sound
          try {
            const audio = new Audio("data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fZWtyd3yBgoODg4KBf3x4dXFtaWVhXltaWVlaW11fYmVobHBzdnl7fX5/f39+fHp3dHFuamdhXltYVlVUVFVWV1ldYGRnbHB0d3p8fn+AgICAfnx5dnNwbGhkYF1bWFZVVFRUVVdZXGBkZ2tvc3d6fX+AgICAgH99e3h1cm5rZ2RhXltZV1ZVVVVWWFpd");
            audio.volume = 0.5;
            audio.play().catch(() => {});
          } catch {}
          toast.success("🛒 Novo pedido recebido!", {
            description: `Pedido #${newOrder.id.slice(0, 8)} — $${newOrder.total_amount?.toFixed(2) || "0.00"}`,
            duration: 8000,
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    setUpdatingStatus(orderId);
    const { data, error } = await supabase.functions.invoke("admin-orders?action=update-status", {
      body: { orderId, status: newStatus },
    });

    if (error || data?.error) {
      toast.error(data?.error || "Failed to update status");
    } else {
      toast.success(`Order status updated to ${newStatus}`);
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
      );
    }
    setUpdatingStatus(null);
  };

  const saveTrackingNumber = async (orderId: string) => {
    const trackingNumber = trackingInputs[orderId]?.trim() || "";
    setSavingTracking(orderId);
    const { data, error } = await supabase.functions.invoke("admin-orders?action=update-tracking", {
      body: { orderId, trackingNumber: trackingNumber || null, carrier: null },
    });
    if (error || data?.error) {
      toast.error(data?.error || "Failed to save tracking number");
    } else {
      toast.success("Tracking number saved");
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, tracking_number: trackingNumber || null } : o))
      );
    }
    setSavingTracking(null);
  };

  const filtered = orders.filter((o) => {
    const matchesStatus = statusFilter === "all" || o.status === statusFilter;
    const name = profiles[o.user_id]?.toLowerCase() || "";
    const matchesSearch =
      !search ||
      o.id.toLowerCase().includes(search.toLowerCase()) ||
      name.includes(search.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const formatItems = (items: Json): { name: string; qty: number; price: number }[] => {
    if (!Array.isArray(items)) return [];
    return items.map((item: any) => ({
      name: item.name || "Item",
      qty: item.quantity || 1,
      price: item.price || 0,
    }));
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
          <Package className="w-5 h-5 text-primary" />
          <h1 className="text-xl text-foreground" style={{ fontFamily: "'Bebas Neue', sans-serif", letterSpacing: "0.04em" }}>
            Admin Panel
          </h1>
          <div className="flex items-center gap-1 ml-4">
            <Button variant="ghost" size="sm" className="text-xs" onClick={() => navigate("/admin/chat")}>
              <MessageCircle className="w-3 h-3 mr-1" /> Chat
            </Button>
            <Button variant="default" size="sm" className="text-xs">
              <Package className="w-3 h-3 mr-1" /> Orders
            </Button>
            <Button variant="ghost" size="sm" className="text-xs" onClick={() => navigate("/admin/notifications")}>
              <Bell className="w-3 h-3 mr-1" /> Notifications
            </Button>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="ghost" size="sm" onClick={fetchOrders} disabled={loading}>
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </Button>
          <Button variant="ghost" size="sm" onClick={handleLogout}>
            <LogOut className="w-4 h-4 mr-1" /> Logout
          </Button>
        </div>
      </div>

      <div className="container mx-auto max-w-6xl px-4 py-6">
        <p className="text-muted-foreground text-sm mb-4">{orders.length} total orders</p>

        {/* Filters */}
        <div className="glass-card rounded-xl p-4 mb-6 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              className="form-input pl-10"
              placeholder="Search by order ID or customer name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <select
            className="form-input w-full sm:w-44"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">All statuses</option>
            {STATUS_OPTIONS.map((s) => (
              <option key={s} value={s}>
                {s.charAt(0).toUpperCase() + s.slice(1)}
              </option>
            ))}
          </select>
        </div>

        {/* Orders Table */}
        <div className="glass-card rounded-xl overflow-hidden">
          {loading ? (
            <div className="p-12 text-center text-muted-foreground">Loading orders...</div>
          ) : filtered.length === 0 ? (
            <div className="p-12 text-center text-muted-foreground">No orders found.</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="border-border hover:bg-transparent">
                  <TableHead className="text-muted-foreground">Order</TableHead>
                  <TableHead className="text-muted-foreground">Customer</TableHead>
                  <TableHead className="text-muted-foreground">Date</TableHead>
                  <TableHead className="text-muted-foreground">Total</TableHead>
                  <TableHead className="text-muted-foreground">Status</TableHead>
                  <TableHead className="text-muted-foreground w-8"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((order) => (
                  <>
                    <TableRow
                      key={order.id}
                      className="border-border cursor-pointer hover:bg-secondary/50"
                      onClick={() =>
                        setExpandedOrder(expandedOrder === order.id ? null : order.id)
                      }
                    >
                      <TableCell className="font-mono text-xs text-foreground">
                        #{order.id.slice(0, 8)}
                      </TableCell>
                      <TableCell className="text-foreground">
                        {profiles[order.user_id] || "—"}
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        {new Date(order.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="font-semibold text-foreground">
                        ${order.total_amount.toFixed(2)}
                      </TableCell>
                      <TableCell>
                        <span
                          className={`text-xs font-semibold px-2.5 py-1 rounded capitalize ${
                            statusColor[order.status] || "bg-muted text-muted-foreground"
                          }`}
                        >
                          {order.status}
                        </span>
                      </TableCell>
                      <TableCell>
                        {expandedOrder === order.id ? (
                          <ChevronUp className="w-4 h-4 text-muted-foreground" />
                        ) : (
                          <ChevronDown className="w-4 h-4 text-muted-foreground" />
                        )}
                      </TableCell>
                    </TableRow>

                    {expandedOrder === order.id && (
                      <TableRow key={`${order.id}-detail`} className="border-border bg-secondary/20">
                        <TableCell colSpan={6} className="p-6">
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {/* Items */}
                            <div>
                              <h4 className="text-xs uppercase tracking-wider text-muted-foreground mb-2">
                                Items
                              </h4>
                              <div className="space-y-1.5">
                                {formatItems(order.items).map((item, i) => (
                                  <div key={i} className="flex justify-between text-sm">
                                    <span className="text-foreground">
                                      {item.name}{" "}
                                      <span className="text-muted-foreground">×{item.qty}</span>
                                    </span>
                                    <span className="text-foreground">
                                      ${(item.price * item.qty).toFixed(2)}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            </div>

                            {/* Shipping */}
                            <div>
                              <h4 className="text-xs uppercase tracking-wider text-muted-foreground mb-2">
                                Shipping Address
                              </h4>
                              {order.shipping_address &&
                              typeof order.shipping_address === "object" &&
                              !Array.isArray(order.shipping_address) ? (
                                <div className="text-sm text-foreground space-y-0.5">
                                  <p>{(order.shipping_address as any).line1}</p>
                                  {(order.shipping_address as any).line2 && (
                                    <p>{(order.shipping_address as any).line2}</p>
                                  )}
                                  <p>
                                    {(order.shipping_address as any).city},{" "}
                                    {(order.shipping_address as any).state}{" "}
                                    {(order.shipping_address as any).postal_code}
                                  </p>
                                  <p>{(order.shipping_address as any).country}</p>
                                </div>
                              ) : (
                                <p className="text-sm text-muted-foreground">No address</p>
                              )}
                            </div>

                            <div>

                              {/* Tracking Number */}
                              <div className="mt-4">
                                <h4 className="text-xs uppercase tracking-wider text-muted-foreground mb-2">
                                  Tracking Number
                                </h4>
                                <div className="flex flex-col gap-2">
                                  <input
                                    className="form-input text-sm w-full"
                                    placeholder="Enter tracking number..."
                                    value={trackingInputs[order.id] ?? order.tracking_number ?? ""}
                                    onChange={(e) => {
                                      e.stopPropagation();
                                      setTrackingInputs((prev) => ({ ...prev, [order.id]: e.target.value }));
                                    }}
                                    onClick={(e) => e.stopPropagation()}
                                  />
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="self-end"
                                    disabled={savingTracking === order.id}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      saveTrackingNumber(order.id);
                                    }}
                                  >
                                    {savingTracking === order.id ? "Saving..." : "Save"}
                                  </Button>
                                </div>
                                {order.tracking_number && (
                                  <p className="text-xs text-muted-foreground mt-1">
                                    Current: {order.tracking_number}
                                  </p>
                                )}
                              </div>

                              {order.stripe_payment_intent_id && (
                                <p className="text-xs text-muted-foreground mt-3">
                                  Stripe: {order.stripe_payment_intent_id.slice(0, 20)}…
                                </p>
                              )}
                            </div>
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminOrders;
