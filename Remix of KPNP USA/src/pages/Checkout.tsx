import { useState, useEffect, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Loader2, ShieldCheck, Package, MapPin, CreditCard, AlertCircle, CheckCircle2, Pencil } from "lucide-react";
import kpnpLogo from "@/assets/kpnp-logo.png";

let stripePromise: ReturnType<typeof loadStripe> | null = null;

function getStripe(publishableKey: string) {
  if (!stripePromise) {
    stripePromise = loadStripe(publishableKey);
  }
  return stripePromise;
}

/* ── Single-step checkout form ── */
const CheckoutForm = ({
  amount,
  shippingCents,
  taxCents,
  contactInfo,
  shippingAddress,
  onSuccess,
  addressValid,
  addressErrors,
  onEditAddress,
  editingAddress,
  onAddressChange,
  items,
  discountApplied,
  discountCode,
  discountLoading,
  discountError,
  onDiscountCodeChange,
  onApplyDiscount,
  onRemoveDiscount,
}: {
  amount: number;
  shippingCents: number;
  taxCents: number;
  contactInfo: { name: string; email: string; phone: string };
  shippingAddress: { line1: string; line2: string; city: string; state: string; postal_code: string; country: string };
  onSuccess: () => void;
  addressValid: boolean;
  addressErrors: string[];
  onEditAddress: () => void;
  editingAddress: boolean;
  onAddressChange: (field: string, value: string) => void;
  items: any[];
  discountApplied: { code: string; percent_off?: number; amount_off?: number } | null;
  discountCode: string;
  discountLoading: boolean;
  discountError: string | null;
  onDiscountCodeChange: (v: string) => void;
  onApplyDiscount: () => void;
  onRemoveDiscount: () => void;
}) => {
  const stripe = useStripe();
  const elements = useElements();
  const { t } = useTranslation();
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const subtotalCents = amount - shippingCents - taxCents;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements || !addressValid) return;

    setProcessing(true);
    setError(null);

    const { error: submitError } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        receipt_email: contactInfo.email,
        shipping: {
          name: contactInfo.name,
          address: {
            line1: shippingAddress.line1,
            line2: shippingAddress.line2 || "",
            city: shippingAddress.city,
            state: shippingAddress.state,
            postal_code: shippingAddress.postal_code,
            country: shippingAddress.country,
          },
        },
      },
      redirect: "if_required",
    });

    if (submitError) {
      setError(submitError.message || t("checkout.paymentFailed"));
      toast({ title: t("checkout.paymentFailed"), description: submitError.message, variant: "destructive" });
      setProcessing(false);
    } else {
      toast({ title: t("checkout.paymentSuccess"), description: t("checkout.orderPlaced") });
      onSuccess();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Order items */}
      <div className="space-y-3">
        {items.map((item: any) => (
          <div key={item.cartKey} className="flex gap-3 p-3 rounded-xl bg-card border border-border">
            <img src={item.image} alt={item.name} className="w-14 h-14 object-cover rounded-lg" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">{item.name}</p>
              <div className="flex items-center gap-2 mt-0.5">
                {item.selectedSize && <span className="text-xs text-muted-foreground">{item.selectedSize}</span>}
                {item.selectedColor && <span className="text-xs text-muted-foreground">{item.selectedColor}</span>}
                <span className="text-xs text-muted-foreground">x{item.quantity}</span>
              </div>
            </div>
            <p className="text-sm font-bold text-foreground whitespace-nowrap">${(item.price * item.quantity).toFixed(2)}</p>
          </div>
        ))}
      </div>

      {/* Discount code */}
      <div className="bg-card border border-border rounded-xl p-4 space-y-3">
        <p className="text-sm font-medium text-foreground">{t("checkout.discountCode")}</p>
        {discountApplied ? (
          <div className="flex items-center justify-between bg-primary/10 border border-primary/30 rounded-lg px-3 py-2">
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-primary">{discountApplied.code}</span>
              <span className="text-xs text-muted-foreground">
                {discountApplied.percent_off
                  ? `(-${discountApplied.percent_off}%)`
                  : discountApplied.amount_off
                    ? `(-$${(discountApplied.amount_off / 100).toFixed(2)})`
                    : ""}
              </span>
            </div>
            <button
              type="button"
              onClick={onRemoveDiscount}
              disabled={discountLoading}
              className="text-xs text-destructive hover:underline disabled:opacity-50"
            >
              {t("checkout.remove")}
            </button>
          </div>
        ) : (
          <div className="flex gap-2">
            <input
              type="text"
              value={discountCode}
              onChange={(e) => onDiscountCodeChange(e.target.value.toUpperCase())}
              placeholder="AAU10"
              className="flex-1 px-3 py-2 rounded-lg bg-secondary/50 border border-border text-foreground placeholder:text-muted-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <button
              type="button"
              onClick={onApplyDiscount}
              disabled={discountLoading || !discountCode.trim()}
              className="px-4 py-2 bg-primary text-primary-foreground text-sm font-semibold rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center gap-1"
            >
              {discountLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : t("checkout.apply")}
            </button>
          </div>
        )}
        {discountError && <p className="text-xs text-destructive">{discountError}</p>}
      </div>

      {/* Shipping address confirmation */}
      <div className="bg-card border border-border rounded-xl p-4 space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-medium text-foreground flex items-center gap-2">
            <MapPin className="w-4 h-4 text-primary" />
            {t("checkout.shippingAddress")}
          </h2>
          <button
            type="button"
            onClick={onEditAddress}
            className="text-xs text-primary hover:underline flex items-center gap-1"
          >
            <Pencil className="w-3 h-3" />
            {editingAddress ? t("checkout.done") : t("checkout.edit")}
          </button>
        </div>

        {addressErrors.length > 0 && (
          <div className="flex items-start gap-2 p-2 bg-destructive/10 border border-destructive/30 rounded-lg">
            <AlertCircle className="w-4 h-4 text-destructive mt-0.5 shrink-0" />
            <div className="text-xs text-destructive space-y-0.5">
              {addressErrors.map((err, i) => <p key={i}>{err}</p>)}
            </div>
          </div>
        )}

        {editingAddress ? (
          <div className="space-y-2">
            <input
              type="text"
              value={shippingAddress.line1}
              onChange={(e) => onAddressChange("line1", e.target.value)}
              placeholder={t("checkout.addressLine1")}
              className="w-full px-3 py-2 rounded-lg bg-secondary/50 border border-border text-foreground placeholder:text-muted-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <input
              type="text"
              value={shippingAddress.line2}
              onChange={(e) => onAddressChange("line2", e.target.value)}
              placeholder={t("checkout.addressLine2")}
              className="w-full px-3 py-2 rounded-lg bg-secondary/50 border border-border text-foreground placeholder:text-muted-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <div className="grid grid-cols-2 gap-2">
              <input
                type="text"
                value={shippingAddress.city}
                onChange={(e) => onAddressChange("city", e.target.value)}
                placeholder={t("checkout.city")}
                className="w-full px-3 py-2 rounded-lg bg-secondary/50 border border-border text-foreground placeholder:text-muted-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <input
                type="text"
                value={shippingAddress.state}
                onChange={(e) => onAddressChange("state", e.target.value)}
                placeholder={t("checkout.state")}
                className="w-full px-3 py-2 rounded-lg bg-secondary/50 border border-border text-foreground placeholder:text-muted-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <input
                type="text"
                value={shippingAddress.postal_code}
                onChange={(e) => onAddressChange("postal_code", e.target.value)}
                placeholder={t("checkout.zip")}
                className="w-full px-3 py-2 rounded-lg bg-secondary/50 border border-border text-foreground placeholder:text-muted-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <input
                type="text"
                value="US"
                disabled
                className="w-full px-3 py-2 rounded-lg bg-secondary/30 border border-border text-muted-foreground text-sm"
              />
            </div>
          </div>
        ) : (
          <div className="text-sm text-muted-foreground space-y-0.5">
            {addressValid ? (
              <>
                <div className="flex items-center gap-1.5 text-green-500 text-xs mb-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  {t("checkout.addressConfirmed")}
                </div>
                <p>{shippingAddress.line1}</p>
                {shippingAddress.line2 && <p>{shippingAddress.line2}</p>}
                <p>{shippingAddress.city}, {shippingAddress.state} {shippingAddress.postal_code}</p>
              </>
            ) : (
              <p className="text-destructive text-xs">{t("checkout.pleaseCompleteAddress")}</p>
            )}
          </div>
        )}
      </div>

      {/* Totals */}
      <div className="space-y-2 text-sm px-1">
        <div className="flex justify-between text-muted-foreground">
          <span>{t("checkout.subtotal")}</span>
          <span>${(subtotalCents / 100).toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-muted-foreground">
          <span>{t("checkout.shipping")}</span>
          <span>${(shippingCents / 100).toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-muted-foreground">
          <span>{t("checkout.tax")}</span>
          <span>${(taxCents / 100).toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-foreground font-bold text-base pt-2 border-t border-border">
          <span>{t("checkout.total")}</span>
          <span>${(amount / 100).toFixed(2)}</span>
        </div>
      </div>

      {/* Payment */}
      <div className="bg-secondary/50 rounded-xl p-4">
        <PaymentElement options={{ layout: "tabs" }} />
      </div>

      {error && <p className="text-sm text-destructive text-center">{error}</p>}

      <button
        type="submit"
        disabled={!stripe || processing || !addressValid}
        className="w-full py-4 bg-primary text-primary-foreground font-semibold rounded-xl hover:bg-primary/90 transition-colors disabled:opacity-60 flex items-center justify-center gap-2 text-lg"
      >
        {processing ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            {t("checkout.processing")}
          </>
        ) : (
          <>
            <ShieldCheck className="w-5 h-5" />
            {t("checkout.pay")} ${(amount / 100).toFixed(2)}
          </>
        )}
      </button>

      <p className="text-xs text-muted-foreground text-center flex items-center justify-center gap-1">
        <ShieldCheck className="w-3 h-3" />
        {t("checkout.securedByStripe")}
      </p>
    </form>
  );
};

/* ── Main Checkout page ── */
const Checkout = () => {
  const { items, totalPrice, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t } = useTranslation();

  const [contactName, setContactName] = useState("");
  const [contactEmail, setContactEmail] = useState(user?.email || "");
  const [contactPhone, setContactPhone] = useState("");
  const [shippingAddress, setShippingAddress] = useState({
    line1: "", line2: "", city: "", state: "", postal_code: "", country: "US",
  });
  const [editingAddress, setEditingAddress] = useState(false);

  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [publishableKey, setPublishableKey] = useState<string | null>(null);
  const [amount, setAmount] = useState(0);
  const [shippingCents, setShippingCents] = useState(0);
  const [taxCents, setTaxCents] = useState(0);
  const [loading, setLoading] = useState(true);
  const [discountCode, setDiscountCode] = useState("");
  const [discountApplied, setDiscountApplied] = useState<{ code: string; percent_off?: number; amount_off?: number } | null>(null);
  const [discountLoading, setDiscountLoading] = useState(false);
  const [discountError, setDiscountError] = useState<string | null>(null);

  // Load profile data
  useEffect(() => {
    const loadProfile = async () => {
      if (!user) return;
      const { data } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();
      if (data) {
        if (data.full_name) setContactName(data.full_name);
        if (data.phone) setContactPhone(data.phone);
        if (data.shipping_address_line1) {
          setShippingAddress({
            line1: data.shipping_address_line1 || "",
            line2: data.shipping_address_line2 || "",
            city: data.shipping_city || "",
            state: data.shipping_state || "",
            postal_code: data.shipping_zip || "",
            country: data.shipping_country || "US",
          });
        }
      }
    };
    loadProfile();
  }, [user]);

  useEffect(() => {
    if (user?.email) setContactEmail(user.email);
  }, [user]);

  // Create payment intent
  useEffect(() => {
    if (items.length === 0) {
      navigate("/");
      return;
    }

    const createIntent = async () => {
      try {
        const { data, error } = await supabase.functions.invoke("create-payment-intent", {
          body: {
            items: items.map((i) => ({
              name: i.name, price: i.price, quantity: i.quantity,
              selectedSize: i.selectedSize, selectedColor: i.selectedColor,
            })),
            customerEmail: user?.email,
          },
        });

        if (error) throw error;
        if (!data?.clientSecret || !data?.publishableKey) throw new Error("Missing payment data");

        setClientSecret(data.clientSecret);
        setPublishableKey(data.publishableKey);
        setAmount(data.amount);
        setShippingCents(data.shippingCents);
        setTaxCents(data.taxCents || 0);
      } catch (err: any) {
        console.error("Payment setup error:", err);
        toast({ title: "Error", description: err.message || "Could not set up payment", variant: "destructive" });
        navigate("/");
      } finally {
        setLoading(false);
      }
    };

    createIntent();
  }, []);

  // Address validation
  const addressErrors = useMemo(() => {
    const errs: string[] = [];
    if (!shippingAddress.line1.trim()) errs.push(t("checkout.errorLine1"));
    if (!shippingAddress.city.trim()) errs.push(t("checkout.errorCity"));
    if (!shippingAddress.state.trim()) errs.push(t("checkout.errorState"));
    if (!shippingAddress.postal_code.trim()) errs.push(t("checkout.errorZip"));
    return errs;
  }, [shippingAddress, t]);

  const addressValid = addressErrors.length === 0;

  // Auto-open edit if address is incomplete
  useEffect(() => {
    if (!loading && !addressValid) {
      setEditingAddress(true);
    }
  }, [loading, addressValid]);

  const handleAddressChange = useCallback((field: string, value: string) => {
    setShippingAddress((prev) => ({ ...prev, [field]: value }));
  }, []);

  const handleSuccess = async () => {
    const subtotalValue = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
    const shippingValue = shippingCents / 100;
    const taxValue = taxCents / 100;
    const totalValue = amount / 100;
    const orderNumber = `KPNP-${Date.now()}`;

    // Save order
    try {
      const orderItems = items.map((i) => ({
        name: i.name, quantity: i.quantity, price: i.price,
        variant: [i.selectedSize, i.selectedColor].filter(Boolean).join(" / ") || "",
      }));
      if (user) {
        await supabase.from("orders").insert({
          user_id: user.id,
          total_amount: totalValue,
          items: orderItems as any,
          shipping_address: shippingAddress as any,
          status: "confirmed",
        });
      }
    } catch (err) {
      console.error("Failed to save order:", err);
    }

    // Send order confirmation email
    try {
      await supabase.functions.invoke("send-transactional-email", {
        body: {
          templateName: "order-confirmation",
          recipientEmail: contactEmail,
          idempotencyKey: `order-confirm-${orderNumber}`,
          templateData: {
            userName: contactName,
            orderNumber,
            orderDate: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
            items: items.map((i) => ({
              name: i.name,
              sku: [i.selectedSize, i.selectedColor].filter(Boolean).join(" / ") || undefined,
              qty: i.quantity,
              price: `$${(i.price * i.quantity).toFixed(2)}`,
            })),
            subtotal: `$${subtotalValue.toFixed(2)}`,
            shippingMethod: "Standard",
            shippingCost: `$${shippingValue.toFixed(2)}`,
            taxRate: taxValue > 0 ? `${((taxValue / subtotalValue) * 100).toFixed(1)}%` : "0%",
            taxAmount: `$${taxValue.toFixed(2)}`,
            orderTotal: `$${totalValue.toFixed(2)}`,
            shippingName: contactName,
            shippingAddressLine1: shippingAddress.line1,
            shippingCity: shippingAddress.city,
            shippingState: shippingAddress.state,
            shippingZip: shippingAddress.postal_code,
            shippingCountry: shippingAddress.country || "US",
            paymentMethod: "Card",
            paymentLast4: "••••",
            orderUrl: `${window.location.origin}/account`,
          },
        },
      });
    } catch (err) {
      console.error("Failed to send order confirmation email:", err);
    }

    // Legacy email
    try {
      const basePayload = {
        orderNumber,
        customerName: contactName,
        customerPhone: contactPhone,
        shippingAddress: {
          line1: shippingAddress.line1,
          city: shippingAddress.city,
          state: shippingAddress.state,
          zip: shippingAddress.postal_code,
        },
        items: items.map((i) => ({
          name: i.name, quantity: i.quantity, price: i.price,
          variant: [i.selectedSize, i.selectedColor].filter(Boolean).join(" / ") || "",
        })),
        subtotal: subtotalValue,
        shipping: shippingValue,
        tax: taxValue,
        total: totalValue,
      };

      const recipients = [contactEmail, "info@kpnpamerica.com"];
      await Promise.all(
        recipients.map((email) =>
          fetch("https://kpnp-sync-v2.vercel.app/api/send-order-email", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ ...basePayload, customerEmail: email }),
          })
        )
      );
    } catch (err) {
      console.error("Failed to send order email:", err);
    }

    clearCart();
    navigate("/checkout-success");
  };

  const handleApplyDiscount = async () => {
    if (!discountCode.trim()) return;
    setDiscountLoading(true);
    setDiscountError(null);
    try {
      const { data, error } = await supabase.functions.invoke("create-payment-intent", {
        body: {
          items: items.map((i) => ({
            name: i.name, price: i.price, quantity: i.quantity,
            selectedSize: i.selectedSize, selectedColor: i.selectedColor,
          })),
          customerEmail: user?.email,
          couponCode: discountCode.trim().toUpperCase(),
        },
      });
      if (error) {
        let errorMsg = "Invalid code";
        try {
          const ctx = (error as any).context;
          if (ctx && typeof ctx.json === "function") {
            const body = await ctx.json();
            if (body?.error) errorMsg = body.error;
          }
        } catch {}
        setDiscountError(errorMsg);
        setDiscountLoading(false);
        return;
      }
      if (data?.error) {
        setDiscountError(data.error);
        setDiscountLoading(false);
        return;
      }
      if (!data?.clientSecret || !data?.publishableKey) throw new Error("Missing payment data");

      setClientSecret(data.clientSecret);
      setPublishableKey(data.publishableKey);
      setAmount(data.amount);
      setShippingCents(data.shippingCents);
      setTaxCents(data.taxCents || 0);
      setDiscountApplied({
        code: discountCode.trim().toUpperCase(),
        percent_off: data.discountPercentOff,
        amount_off: data.discountAmountOff,
      });
      toast({ title: t("checkout.discountApplied"), description: `${discountCode.trim().toUpperCase()}` });
    } catch (err: any) {
      setDiscountError(err?.message || "Invalid code");
    } finally {
      setDiscountLoading(false);
    }
  };

  const handleRemoveDiscount = async () => {
    setDiscountLoading(true);
    setDiscountError(null);
    try {
      const { data, error } = await supabase.functions.invoke("create-payment-intent", {
        body: {
          items: items.map((i) => ({
            name: i.name, price: i.price, quantity: i.quantity,
            selectedSize: i.selectedSize, selectedColor: i.selectedColor,
          })),
          customerEmail: user?.email,
        },
      });
      if (error) throw error;
      setClientSecret(data.clientSecret);
      setPublishableKey(data.publishableKey);
      setAmount(data.amount);
      setShippingCents(data.shippingCents);
      setTaxCents(data.taxCents || 0);
      setDiscountApplied(null);
      setDiscountCode("");
    } catch (err: any) {
      console.error(err);
    } finally {
      setDiscountLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="w-10 h-10 animate-spin text-primary mx-auto" />
          <p className="text-muted-foreground">{t("checkout.settingUp")}</p>
        </div>
      </div>
    );
  }

  if (!clientSecret || !publishableKey) return null;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-background/95 backdrop-blur border-b border-border px-4 py-3">
        <div className="flex items-center justify-between max-w-lg mx-auto">
          <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="w-5 h-5" />
            <span className="text-sm">{t("checkout.back")}</span>
          </button>
          <img src={kpnpLogo} alt="KPNP" className="h-6" />
          <div className="w-16" />
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 py-6 space-y-6">
        <h1 className="text-2xl font-display text-foreground tracking-wide flex items-center gap-2">
          <CreditCard className="w-6 h-6 text-primary" />
          {t("checkout.title")}
        </h1>

        <Elements
          stripe={getStripe(publishableKey)}
          options={{ clientSecret, appearance: STRIPE_APPEARANCE }}
        >
          <CheckoutForm
            amount={amount}
            shippingCents={shippingCents}
            taxCents={taxCents}
            contactInfo={{ name: contactName, email: contactEmail, phone: contactPhone }}
            shippingAddress={shippingAddress}
            onSuccess={handleSuccess}
            addressValid={addressValid}
            addressErrors={addressErrors}
            onEditAddress={() => setEditingAddress(!editingAddress)}
            editingAddress={editingAddress}
            onAddressChange={handleAddressChange}
            items={items}
            discountApplied={discountApplied}
            discountCode={discountCode}
            discountLoading={discountLoading}
            discountError={discountError}
            onDiscountCodeChange={(v) => { setDiscountCode(v); setDiscountError(null); }}
            onApplyDiscount={handleApplyDiscount}
            onRemoveDiscount={handleRemoveDiscount}
          />
        </Elements>

        <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground pb-8">
          <Package className="w-3 h-3" />
          {t("checkout.shipsToUS")}
        </div>
      </div>
    </div>
  );
};

/* ── Shared Stripe appearance ── */
const STRIPE_APPEARANCE = {
  theme: "night" as const,
  variables: {
    colorPrimary: "hsl(0, 76%, 55%)",
    colorBackground: "hsl(0, 0%, 7%)",
    colorText: "hsl(0, 0%, 95%)",
    colorDanger: "hsl(0, 84%, 60%)",
    fontFamily: "Inter, sans-serif",
    borderRadius: "12px",
    spacingUnit: "4px",
  },
  rules: {
    ".Input": { border: "1px solid hsl(0, 0%, 16%)", backgroundColor: "hsl(0, 0%, 7%)" },
    ".Input:focus": { border: "1px solid hsl(0, 76%, 55%)", boxShadow: "0 0 0 1px hsl(0, 76%, 55%)" },
    ".Label": { color: "hsl(0, 0%, 55%)" },
  },
};

export default Checkout;
