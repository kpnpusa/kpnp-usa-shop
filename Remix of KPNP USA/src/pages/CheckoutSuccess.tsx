import { useEffect } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { CheckCircle } from "lucide-react";
import { useCart } from "@/context/CartContext";

const CheckoutSuccess = () => {
  const { clearCart } = useCart();
  const { t } = useTranslation();

  useEffect(() => {
    clearCart();
  }, []);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <CheckCircle className="w-20 h-20 text-green-500 mx-auto mb-6" />
        <h1 className="text-3xl font-display text-foreground mb-3 tracking-wide">
          {t("checkoutSuccess.title")}
        </h1>
        <p className="text-muted-foreground mb-8">
          {t("checkoutSuccess.message")}
        </p>
        <Link
          to="/"
          className="inline-block px-8 py-3 bg-primary text-primary-foreground font-semibold rounded-lg hover:bg-primary/90 transition-colors"
        >
          {t("checkoutSuccess.continueShopping")}
        </Link>
      </div>
    </div>
  );
};

export default CheckoutSuccess;
