import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft } from "lucide-react";
import kpnpLogo from "@/assets/kpnp-logo.png";

const ResetPassword = () => {
  const { t } = useTranslation();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [isRecovery, setIsRecovery] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    // Check hash fragment (implicit flow)
    const hash = window.location.hash;
    if (hash.includes("type=recovery")) {
      setIsRecovery(true);
    }

    // Check URL params (PKCE code flow)
    const params = new URLSearchParams(window.location.search);
    const code = params.get("code");
    const type = params.get("type");
    
    if (code) {
      // Exchange the code for a session
      supabase.auth.exchangeCodeForSession(code).then(({ error }) => {
        if (!error) {
          setIsRecovery(true);
        }
      });
    }
    
    if (type === "recovery") {
      setIsRecovery(true);
    }

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") {
        setIsRecovery(true);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast({ title: t("resetPassword.error"), description: t("resetPassword.mismatch"), variant: "destructive" });
      return;
    }
    if (password.length < 6) {
      toast({ title: t("resetPassword.error"), description: t("resetPassword.tooShort"), variant: "destructive" });
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    setLoading(false);
    if (error) {
      toast({ title: t("resetPassword.error"), description: error.message, variant: "destructive" });
    } else {
      toast({ title: t("resetPassword.success"), description: t("resetPassword.successDesc") });
      navigate("/");
    }
  };

  if (!isRecovery) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="w-full max-w-sm text-center">
          <div className="glass-card rounded-2xl p-8">
            <div className="flex justify-center mb-6">
              <img src={kpnpLogo} alt="KPNP" className="h-8" />
            </div>
            <p className="text-muted-foreground">{t("resetPassword.invalidLink")}</p>
            <Button onClick={() => navigate("/auth")} className="mt-4">
              {t("auth.signIn")}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="glass-card rounded-2xl p-8">
          <div className="flex justify-center mb-6">
            <img src={kpnpLogo} alt="KPNP" className="h-8" />
          </div>
          <h1 className="text-3xl text-center mb-2 text-gradient-red">
            {t("resetPassword.title")}
          </h1>
          <p className="text-sm text-muted-foreground text-center mb-6">
            {t("resetPassword.subtitle")}
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="password"
              placeholder={t("resetPassword.newPassword")}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="form-input"
              required
              minLength={6}
            />
            <input
              type="password"
              placeholder={t("resetPassword.confirmPassword")}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="form-input"
              required
              minLength={6}
            />
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? t("auth.pleaseWait") : t("resetPassword.updatePassword")}
            </Button>
          </form>
        </div>

        <button
          onClick={() => navigate("/")}
          className="w-full mt-6 flex items-center justify-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          {t("auth.backToShop")}
        </button>
      </div>
    </div>
  );
};

export default ResetPassword;
