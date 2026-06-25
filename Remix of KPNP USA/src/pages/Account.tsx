import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Bell, User, Package, LogOut, Check, ChevronDown, ChevronUp, Trash2 } from "lucide-react";

import { motion, AnimatePresence } from "framer-motion";
import kpnpLogo from "@/assets/kpnp-logo.png";

type Profile = {
  full_name: string;
  phone: string;
  shipping_address_line1: string;
  shipping_address_line2: string;
  shipping_city: string;
  shipping_state: string;
  shipping_zip: string;
  shipping_country: string;
};

type Notification = {
  id: string;
  title: string;
  message: string;
  type: string;
  read: boolean;
  created_at: string;
  order_id: string | null;
};

type Order = {
  id: string;
  total_amount: number;
  status: string;
  created_at: string;
  items: any;
  tracking_number: string | null;
  carrier: string | null;
};


const Account = () => {
  const { t } = useTranslation();
  const { user, loading: authLoading, signOut } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { toast } = useToast();
  const initialTab = (searchParams.get("tab") as "profile" | "orders" | "notifications") || "profile";
  const [tab, setTab] = useState<"profile" | "orders" | "notifications">(initialTab);
  const initialOrderId = searchParams.get("orderId");
  const [expandedOrder, setExpandedOrder] = useState<string | null>(initialOrderId);
  const [profile, setProfile] = useState<Profile>({
    full_name: "", phone: "",
    shipping_address_line1: "", shipping_address_line2: "",
    shipping_city: "", shipping_state: "", shipping_zip: "", shipping_country: "US",
  });
  const [saving, setSaving] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    if (!authLoading && !user) navigate("/auth");
  }, [authLoading, user, navigate]);

  useEffect(() => {
    if (!user) return;
    supabase.from("profiles").select("*").eq("user_id", user.id).maybeSingle().then(({ data }) => {
      if (data) {
        setProfile({
          full_name: data.full_name || "", phone: data.phone || "",
          shipping_address_line1: data.shipping_address_line1 || "",
          shipping_address_line2: data.shipping_address_line2 || "",
          shipping_city: data.shipping_city || "", shipping_state: data.shipping_state || "",
          shipping_zip: data.shipping_zip || "", shipping_country: data.shipping_country || "US",
        });
      }
    });
    supabase.from("notifications").select("*").eq("user_id", user.id).order("created_at", { ascending: false }).then(({ data }) => {
      if (data) setNotifications(data);
    });
    supabase.from("orders").select("*").eq("user_id", user.id).order("created_at", { ascending: false }).then(({ data }) => {
      if (data) setOrders(data as Order[]);
    });
  }, [user]);

  const handleSaveProfile = async () => {
    if (!user) return;
    setSaving(true);
    const { error } = await supabase.from("profiles").update({
      full_name: profile.full_name, phone: profile.phone,
      shipping_address_line1: profile.shipping_address_line1,
      shipping_address_line2: profile.shipping_address_line2,
      shipping_city: profile.shipping_city, shipping_state: profile.shipping_state,
      shipping_zip: profile.shipping_zip, shipping_country: profile.shipping_country,
    }).eq("user_id", user.id);
    setSaving(false);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: t("account.profileSaved"), description: t("account.profileSavedDesc") });
    }
  };

  const markNotificationRead = async (id: string) => {
    await supabase.from("notifications").update({ read: true }).eq("id", id);
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  };

  const deleteNotification = async (id: string) => {
    const { error } = await supabase.from("notifications").delete().eq("id", id);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
      return;
    }
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const clearReadNotifications = async () => {
    if (!user) return;
    const { error } = await supabase.from("notifications").delete().eq("user_id", user.id).eq("read", true);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
      return;
    }
    setNotifications((prev) => prev.filter((n) => !n.read));
  };

  const handleNotificationClick = (n: Notification) => {
    markNotificationRead(n.id);
    if (n.order_id) {
      setTab("orders");
      setExpandedOrder(n.order_id);
      setSearchParams({ tab: "orders", orderId: n.order_id });
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  if (authLoading || !user) return null;

  const unreadCount = notifications.filter((n) => !n.read).length;

  const tabs = [
    { key: "profile" as const, label: t("account.profile"), icon: User },
    { key: "orders" as const, label: t("account.orders"), icon: Package },
    { key: "notifications" as const, label: t("account.notifications"), icon: Bell, badge: unreadCount },
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto max-w-2xl px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <button onClick={() => navigate("/")} className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="w-4 h-4" />
            {t("account.backToShop")}
          </button>
          <img src={kpnpLogo} alt="KPNP" className="h-6" />
        </div>

        <h1 className="text-4xl text-gradient-red mb-2">{t("account.title")}</h1>
        <p className="text-muted-foreground mb-6">{user.email}</p>

        <div className="flex gap-2 mb-6">
          {tabs.map((tabItem) => (
            <button
              key={tabItem.key}
              onClick={() => setTab(tabItem.key)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors relative ${
                tab === tabItem.key ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground hover:text-foreground"
              }`}
            >
              <tabItem.icon className="w-4 h-4" />
              {tabItem.label}
              {tabItem.badge && tabItem.badge > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-destructive text-destructive-foreground text-xs font-bold rounded-full flex items-center justify-center">
                  {tabItem.badge}
                </span>
              )}
            </button>
          ))}
        </div>

        <div className="glass-card rounded-2xl p-6">
          <AnimatePresence mode="wait">
            {tab === "profile" && (
              <motion.div key="profile" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-4">
                <h2 className="text-2xl text-foreground mb-4">{t("account.personalInfo")}</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-muted-foreground uppercase tracking-wider">{t("account.fullName")}</label>
                    <input className="form-input mt-1" value={profile.full_name} onChange={(e) => setProfile({ ...profile, full_name: e.target.value })} />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground uppercase tracking-wider">{t("account.phone")}</label>
                    <input className="form-input mt-1" value={profile.phone} onChange={(e) => setProfile({ ...profile, phone: e.target.value })} />
                  </div>
                </div>

                <h3 className="text-xl text-foreground mt-6 mb-2">{t("account.shippingAddress")}</h3>
                <input className="form-input" placeholder={t("account.addressLine1")} value={profile.shipping_address_line1} onChange={(e) => setProfile({ ...profile, shipping_address_line1: e.target.value })} />
                <input className="form-input" placeholder={t("account.addressLine2")} value={profile.shipping_address_line2} onChange={(e) => setProfile({ ...profile, shipping_address_line2: e.target.value })} />
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  <input className="form-input" placeholder={t("account.city")} value={profile.shipping_city} onChange={(e) => setProfile({ ...profile, shipping_city: e.target.value })} />
                  <input className="form-input" placeholder={t("account.state")} value={profile.shipping_state} onChange={(e) => setProfile({ ...profile, shipping_state: e.target.value })} />
                  <input className="form-input" placeholder={t("account.zip")} value={profile.shipping_zip} onChange={(e) => setProfile({ ...profile, shipping_zip: e.target.value })} />
                </div>

                <Button onClick={handleSaveProfile} disabled={saving} className="mt-4">
                  {saving ? t("account.saving") : t("account.saveProfile")}
                </Button>
              </motion.div>
            )}

            {tab === "orders" && (
              <motion.div key="orders" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                <h2 className="text-2xl text-foreground mb-4">{t("account.orderHistory")}</h2>
                {orders.length === 0 ? (
                  <p className="text-muted-foreground">{t("account.noOrders")}</p>
                ) : (
                  <div className="space-y-3">
                    {orders.map((order) => (
                      <div key={order.id} className="bg-secondary/50 rounded-lg overflow-hidden">
                        <button
                          className="w-full p-4 flex justify-between items-start text-left"
                          onClick={() => setExpandedOrder(expandedOrder === order.id ? null : order.id)}
                        >
                          <div>
                            <p className="text-sm font-medium text-foreground">{t("account.order")} #{order.id.slice(0, 8)}</p>
                            <p className="text-xs text-muted-foreground">{new Date(order.created_at).toLocaleDateString()}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="text-right">
                              <p className="text-sm font-bold text-primary">${order.total_amount.toFixed(2)}</p>
                              <span className="text-xs px-2 py-0.5 rounded bg-muted text-muted-foreground capitalize">{t(`orderStatus.${order.status}`)}</span>
                            </div>
                            {expandedOrder === order.id ? (
                              <ChevronUp className="w-4 h-4 text-muted-foreground" />
                            ) : (
                              <ChevronDown className="w-4 h-4 text-muted-foreground" />
                            )}
                          </div>
                        </button>
                        <AnimatePresence>
                          {expandedOrder === order.id && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.2 }}
                              className="overflow-hidden"
                            >
                              <div className="px-4 pb-4">
                                
                                {order.tracking_number && (
                                  <div className="mt-3 px-3 py-2 rounded-lg bg-primary/10">
                                    <p className="text-xs text-muted-foreground">{t("account.trackingNumber", "Tracking Number")}</p>
                                    <a
                                      href={`https://tools.usps.com/go/TrackConfirmAction?tLabels=${order.tracking_number}`}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-sm font-medium text-primary underline hover:text-primary/80 transition-colors"
                                    >
                                      {order.tracking_number}
                                    </a>
                                  </div>
                                )}
                                {Array.isArray(order.items) && order.items.length > 0 && (
                                  <div className="mt-3 pt-3 border-t border-border">
                                    <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">{t("account.items")}</p>
                                    {order.items.map((item: any, i: number) => (
                                      <div key={i} className="flex justify-between text-sm">
                                        <span className="text-foreground">{item.name} <span className="text-muted-foreground">×{item.quantity || 1}</span></span>
                                        <span className="text-foreground">${((item.price || 0) * (item.quantity || 1)).toFixed(2)}</span>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            )}

            {tab === "notifications" && (
              <motion.div key="notifications" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-2xl text-foreground">{t("account.notifications")}</h2>
                  {notifications.some((n) => n.read) && (
                    <button
                      onClick={clearReadNotifications}
                      className="text-xs text-muted-foreground hover:text-destructive transition-colors flex items-center gap-1"
                    >
                      <Trash2 className="w-3 h-3" />
                      {t("account.clearRead", "Clear read")}
                    </button>
                  )}
                </div>
                {notifications.length === 0 ? (
                  <p className="text-muted-foreground">{t("account.noNotifications")}</p>
                ) : (
                  <div className="space-y-3">
                    {notifications.map((n) => (
                      <div
                        key={n.id}
                        onClick={() => handleNotificationClick(n)}
                        className={`rounded-lg p-4 transition-colors cursor-pointer hover:bg-secondary/60 ${n.read ? "bg-secondary/30" : "bg-secondary/70 border border-primary/20"}`}
                      >
                        <div className="flex justify-between items-start gap-2">
                          <div className="flex-1">
                            <p className={`text-sm font-medium ${n.read ? "text-muted-foreground" : "text-foreground"}`}>{n.title}</p>
                            <p className="text-xs text-muted-foreground mt-1">{n.message}</p>
                            <p className="text-xs text-muted-foreground mt-2">{new Date(n.created_at).toLocaleString()}</p>
                            {n.order_id && (
                              <p className="text-xs text-primary mt-1">{t("account.viewOrder", "View order →")}</p>
                            )}
                          </div>
                          <div className="flex items-center gap-1">
                            {!n.read && (
                              <button onClick={(e) => { e.stopPropagation(); markNotificationRead(n.id); }} className="p-1.5 rounded bg-primary/10 text-primary hover:bg-primary/20 transition-colors" title={t("account.markAsRead")}>
                                <Check className="w-3 h-3" />
                              </button>
                            )}
                            <button onClick={(e) => { e.stopPropagation(); deleteNotification(n.id); }} className="p-1.5 rounded bg-destructive/10 text-destructive hover:bg-destructive/20 transition-colors" title={t("account.deleteNotification", "Delete")}>
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <button onClick={handleSignOut} className="flex items-center gap-2 mt-6 text-sm text-muted-foreground hover:text-destructive transition-colors">
          <LogOut className="w-4 h-4" />
          {t("account.signOut")}
        </button>
      </div>
    </div>
  );
};

export default Account;
