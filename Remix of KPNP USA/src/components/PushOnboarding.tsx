import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Capacitor } from "@capacitor/core";
import { PushNotifications } from "@capacitor/push-notifications";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, Package, Tag, X } from "lucide-react";
import { Button } from "@/components/ui/button";

const ONBOARDING_KEY = "push_onboarding_seen";

export const PushOnboarding = () => {
  const { t } = useTranslation();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return;

    const check = async () => {
      try {
        const perm = await PushNotifications.checkPermissions();
        // Show onboarding if permission not yet granted
        // Even if user previously skipped, re-show if not granted
        if (perm.receive !== "granted") {
          setVisible(true);
        }
      } catch {
        // Not native or plugin unavailable
      }
    };

    // Small delay so the app renders first
    const timer = setTimeout(check, 800);
    return () => clearTimeout(timer);
  }, []);

  const handleEnable = async () => {
    localStorage.setItem(ONBOARDING_KEY, "true");
    setVisible(false);
    try {
      await PushNotifications.requestPermissions();
    } catch (err) {
      console.error("Permission request error:", err);
    }
  };

  const handleSkip = () => {
    localStorage.setItem(ONBOARDING_KEY, "true");
    setVisible(false);
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-4"
        >
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="w-full max-w-sm bg-card border border-border rounded-2xl overflow-hidden shadow-2xl"
          >
            {/* Header */}
            <div className="relative bg-gradient-to-br from-primary/20 to-primary/5 p-6 pb-8 text-center">
              <button
                onClick={handleSkip}
                className="absolute top-3 right-3 p-1.5 rounded-full text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="mx-auto w-16 h-16 rounded-full bg-primary/15 flex items-center justify-center mb-4">
                <Bell className="w-8 h-8 text-primary" />
              </div>

              <h2 className="text-xl font-bold text-foreground">
                {t("pushOnboarding.title", "Stay in the Loop")}
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                {t("pushOnboarding.subtitle", "Never miss an important update")}
              </p>
            </div>

            {/* Benefits */}
            <div className="px-6 py-5 space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                  <Package className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">
                    {t("pushOnboarding.benefit1Title", "Order Tracking")}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {t("pushOnboarding.benefit1Desc", "Get real-time updates on shipping and delivery status")}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                  <Tag className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">
                    {t("pushOnboarding.benefit2Title", "Exclusive Deals")}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {t("pushOnboarding.benefit2Desc", "Be the first to know about promotions and new products")}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                  <Bell className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">
                    {t("pushOnboarding.benefit3Title", "Tournament Alerts")}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {t("pushOnboarding.benefit3Desc", "Stay updated on events and competition announcements")}
                  </p>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="px-6 pb-6 space-y-2">
              <Button onClick={handleEnable} className="w-full" size="lg">
                {t("pushOnboarding.enable", "Enable Notifications")}
              </Button>
              <button
                onClick={handleSkip}
                className="w-full text-sm text-muted-foreground hover:text-foreground transition-colors py-2"
              >
                {t("pushOnboarding.skip", "Maybe Later")}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
