import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft } from "lucide-react";
import kpnpLogo from "@/assets/kpnp-logo.png";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const US_STATES = [
  "AL","AK","AZ","AR","CA","CO","CT","DE","FL","GA",
  "HI","ID","IL","IN","IA","KS","KY","LA","ME","MD",
  "MA","MI","MN","MS","MO","MT","NE","NV","NH","NJ",
  "NM","NY","NC","ND","OH","OK","OR","PA","RI","SC",
  "SD","TN","TX","UT","VT","VA","WA","WV","WI","WY",
  "DC","PR","GU","VI","AS","MP",
];

const Auth = () => {
  const { t } = useTranslation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [addressLine1, setAddressLine1] = useState("");
  const [addressLine2, setAddressLine2] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [zip, setZip] = useState("");
  const [loading, setLoading] = useState(false);
  const [isSignup, setIsSignup] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const [forgotMode, setForgotMode] = useState(false);

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    setLoading(false);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({
        title: t("auth.resetEmailSent"),
        description: t("auth.resetEmailSentDesc"),
      });
      setForgotMode(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (isSignup) {
      // Validate ZIP and state
      const zipRegex = /^\d{5}(-\d{4})?$/;
      if (!zipRegex.test(zip)) {
        setLoading(false);
        toast({ title: "Error", description: t("auth.invalidZip"), variant: "destructive" });
        return;
      }
      if (!state) {
        setLoading(false);
        toast({ title: "Error", description: t("auth.selectState"), variant: "destructive" });
        return;
      }

      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            phone,
            shipping_address_line1: addressLine1,
            shipping_address_line2: addressLine2,
            shipping_city: city,
            shipping_state: state,
            shipping_zip: zip,
            shipping_country: "US",
          },
          emailRedirectTo: window.location.origin,
        },
      });
      if (error) {
        setLoading(false);
        toast({ title: "Error", description: error.message, variant: "destructive" });
        return;
      }
      setLoading(false);
      toast({
        title: t("auth.accountCreated"),
        description: t("auth.checkEmail"),
      });
      setIsSignup(false);
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      setLoading(false);
      if (error) {
        toast({ title: "Error", description: error.message, variant: "destructive" });
      } else {
        navigate("/");
      }
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="glass-card rounded-2xl p-8">
          <div className="flex justify-center mb-6">
            <img src={kpnpLogo} alt="KPNP" className="h-8" />
          </div>
          <h1 className="text-3xl text-center mb-2 text-gradient-red">
            {forgotMode ? t("auth.forgotPassword") : isSignup ? t("auth.createAccount") : t("auth.signIn")}
          </h1>
          <p className="text-sm text-muted-foreground text-center mb-6">
            {forgotMode ? t("auth.forgotSubtitle") : isSignup ? t("auth.signupSubtitle") : t("auth.signinSubtitle")}
          </p>

          {forgotMode ? (
            <form onSubmit={handleForgotPassword} className="space-y-4">
              <input type="email" placeholder={t("auth.email")} value={email} onChange={(e) => setEmail(e.target.value)} className="form-input" required />
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? t("auth.pleaseWait") : t("auth.sendResetLink")}
              </Button>
            </form>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {isSignup && (
                <>
                  <input type="text" placeholder={t("auth.fullName")} value={fullName} onChange={(e) => setFullName(e.target.value)} className="form-input" required />
                  <input type="tel" placeholder={t("auth.phoneNumber")} value={phone} onChange={(e) => setPhone(e.target.value)} className="form-input" required />
                  <p className="text-xs text-muted-foreground uppercase tracking-wider pt-2">{t("auth.shippingAddress")}</p>
                  <input type="text" placeholder={t("auth.addressLine1")} value={addressLine1} onChange={(e) => setAddressLine1(e.target.value)} className="form-input" required />
                  <input type="text" placeholder={t("auth.addressLine2")} value={addressLine2} onChange={(e) => setAddressLine2(e.target.value)} className="form-input" />
                  <div className="grid grid-cols-3 gap-2">
                    <input type="text" placeholder={t("auth.city")} value={city} onChange={(e) => setCity(e.target.value)} className="form-input" required />
                    <Select value={state} onValueChange={setState} required>
                      <SelectTrigger className="form-input h-auto min-h-[2.5rem]">
                        <SelectValue placeholder={t("auth.state")} />
                      </SelectTrigger>
                      <SelectContent className="max-h-60">
                        {US_STATES.map((s) => (
                          <SelectItem key={s} value={s}>{s}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <input
                      type="text"
                      placeholder={t("auth.zip")}
                      value={zip}
                      onChange={(e) => {
                        const val = e.target.value.replace(/[^\d-]/g, "").slice(0, 10);
                        setZip(val);
                      }}
                      className="form-input"
                      required
                      pattern="^\d{5}(-\d{4})?$"
                      title="ZIP code (e.g. 12345 or 12345-6789)"
                    />
                  </div>
                </>
              )}
              <input type="email" placeholder={t("auth.email")} value={email} onChange={(e) => setEmail(e.target.value)} className="form-input" required />
              <input type="password" placeholder={t("auth.password")} value={password} onChange={(e) => setPassword(e.target.value)} className="form-input" required minLength={6} />
              {!isSignup && (
                <button
                  type="button"
                  onClick={() => setForgotMode(true)}
                  className="text-xs text-muted-foreground hover:text-primary transition-colors"
                >
                  {t("auth.forgotPassword")}
                </button>
              )}
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? t("auth.pleaseWait") : isSignup ? t("auth.createAccount") : t("auth.signIn")}
              </Button>
            </form>
          )}

          <button
            onClick={() => { setForgotMode(false); setIsSignup(!isSignup); }}
            className="w-full mt-4 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            {forgotMode ? t("auth.backToSignIn") : isSignup ? t("auth.alreadyHaveAccount") : t("auth.noAccount")}
          </button>
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

export default Auth;
