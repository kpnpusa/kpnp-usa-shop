import { ShoppingCart, Menu, X, User, Bell } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import kpnpLogo from "@/assets/kpnp-logo.png";
import LanguageSwitcher from "./LanguageSwitcher";

const Navbar = () => {
  const { totalItems, setIsOpen } = useCart();
  const { user } = useAuth();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!user) {
      setUnreadCount(0);
      return;
    }
    supabase
      .from("notifications")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id)
      .eq("read", false)
      .then(({ count }) => {
        setUnreadCount(count || 0);
      });
  }, [user]);

  const scrollTo = (id: string) => {
    setMobileOpen(false);
    setTimeout(() => {
      const el = document.getElementById(id);
      if (el) {
        el.scrollIntoView({ behavior: "smooth" });
      } else {
        window.location.href = `/#${id}`;
      }
    }, 350);
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 p-3">
      <div className="container mx-auto bg-red-900/40 backdrop-blur-2xl border border-red-500/20 rounded-xl px-2 sm:px-6 h-14 flex items-center justify-between shadow-lg shadow-black/25">
        <button onClick={() => scrollTo("hero")} className="flex items-center gap-1 shrink-0">
          <img src={kpnpLogo} alt="KPNP" className="h-5 sm:h-6" />
          <span className="text-foreground text-xl sm:text-3xl tracking-tight" style={{ fontFamily: "Arial Black, sans-serif", fontWeight: 900, transform: "skewX(-8deg)" }}>USA</span>
        </button>

        <div className="hidden md:flex items-center gap-4 lg:gap-7">
          {[
            { label: t("nav.shop"), target: "products" },
            { label: t("nav.rental"), target: "rental" },
            { label: "FAQ", target: "faq" },
          ].map((item) => (
            <button
              key={item.target}
              onClick={() => scrollTo(item.target)}
              className="text-[0.7rem] lg:text-[0.8rem] font-semibold text-white/90 hover:text-white tracking-wider uppercase transition-colors"
            >
              {item.label}
            </button>
          ))}
          <a
            href="https://www.kpnpamerica.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[0.7rem] lg:text-[0.8rem] font-semibold text-white/90 hover:text-white tracking-wider uppercase transition-colors"
          >
            {t("nav.website")}
          </a>
          <a
            href="tel:5855705767"
            className="text-[0.7rem] lg:text-[0.8rem] font-semibold text-white/90 hover:text-white tracking-wider uppercase transition-colors"
          >
            {t("nav.contact")}
          </a>
        </div>

        <div className="flex items-center gap-0.5 sm:gap-2">
          <span className="hidden md:block"><LanguageSwitcher /></span>

          {user && (
            <button
              onClick={() => navigate("/account?tab=notifications")}
              className="relative p-1 sm:p-2 text-foreground hover:text-primary transition-colors"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-1 -right-1 w-5 h-5 bg-destructive text-destructive-foreground text-xs font-bold rounded-full flex items-center justify-center"
                >
                  {unreadCount}
                </motion.span>
              )}
            </button>
          )}

          <button
            onClick={() => navigate(user ? "/account" : "/auth")}
            className="p-1 sm:p-2 text-foreground hover:text-primary transition-colors"
            aria-label={user ? t("nav.myAccount") : t("nav.signIn")}
          >
            <User className="w-5 h-5" />
          </button>

          <button
            onClick={() => setIsOpen(true)}
            className="relative p-1 sm:p-2 text-foreground hover:text-primary transition-colors"
            aria-label="Open cart"
          >
            <ShoppingCart className="w-5 h-5" />
            {totalItems > 0 && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute -top-1 -right-1 w-5 h-5 bg-primary text-primary-foreground text-xs font-bold rounded-full flex items-center justify-center"
              >
                {totalItems}
              </motion.span>
            )}
          </button>

          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden p-1 sm:p-2 text-foreground flex flex-col items-center gap-0.5"
            aria-label="Toggle menu"
          >
            <span className="text-[9px] font-bold uppercase tracking-wider leading-none">{t("nav.menu")}</span>
            {mobileOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="md:hidden bg-background border-b border-border overflow-hidden"
          >
            <div className="px-4 py-4 flex flex-col gap-3">
              {[
                { label: t("nav.shop"), target: "products" },
                { label: t("nav.rental"), target: "rental" },
                { label: "FAQ", target: "faq" },
              ].map((item) => (
                <button
                  key={item.target}
                  onClick={() => scrollTo(item.target)}
                  className="text-left text-sm font-medium text-muted-foreground hover:text-foreground transition-colors py-2"
                >
                  {item.label}
                </button>
              ))}
              <a
                href="https://www.kpnpamerica.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-left text-sm font-medium text-muted-foreground hover:text-foreground transition-colors py-2"
              >
                {t("nav.visitWebsite")}
              </a>
              <a
                href="tel:5855705767"
                className="text-left text-sm font-medium text-muted-foreground hover:text-foreground transition-colors py-2"
              >
                {t("nav.contactUs")}
              </a>
              <button
                onClick={() => { setMobileOpen(false); navigate(user ? "/account" : "/auth"); }}
                className="text-left text-sm font-medium text-muted-foreground hover:text-foreground transition-colors py-2"
              >
                {user ? t("nav.myAccount") : t("nav.signInCreate")}
              </button>
              <div className="md:hidden py-2">
                <LanguageSwitcher />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
