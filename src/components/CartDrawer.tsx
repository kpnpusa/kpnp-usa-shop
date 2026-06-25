import { Minus, Plus, Trash2 } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

const CartDrawer = () => {
  const { items, removeItem, updateQuantity, totalPrice, isOpen, setIsOpen } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const handleCheckout = () => {
    setIsOpen(false);
    navigate("/checkout");
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetContent className="bg-card border-border w-full sm:max-w-md flex flex-col">
        <SheetHeader>
          <SheetTitle className="text-foreground font-display text-2xl tracking-wide">
            {t("cart.title")}
          </SheetTitle>
        </SheetHeader>

        {items.length === 0 ? (
          <div className="flex-1 flex items-center justify-center">
            <p className="text-muted-foreground">{t("cart.empty")}</p>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto space-y-4 mt-4 pr-1">
              <AnimatePresence mode="popLayout">
                {items.map((item) => (
                  <motion.div
                    key={item.cartKey}
                    layout
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="flex gap-4 p-3 rounded-lg bg-secondary/50"
                  >
                    <img src={item.image} alt={item.name} className="w-16 h-20 object-cover rounded-md" />
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-medium text-foreground truncate">{item.name}</h4>
                      {(item.selectedSize || item.selectedColor) && (
                        <div className="flex gap-2 mt-0.5">
                          {item.selectedSize && (
                            <span className="text-xs text-muted-foreground">
                              {t("cart.size")}: <span className="text-foreground font-medium">{item.selectedSize}</span>
                            </span>
                          )}
                          {item.selectedColor && (
                            <span className="text-xs text-muted-foreground">
                              {t("cart.color")}: <span className="text-foreground font-medium">{item.selectedColor}</span>
                            </span>
                          )}
                        </div>
                      )}
                      <p className="text-primary font-bold mt-1">${item.price.toFixed(2)}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <button onClick={() => updateQuantity(item.cartKey, item.quantity - 1)} className="p-1 rounded bg-muted text-foreground hover:bg-muted/80">
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="text-sm font-medium text-foreground w-6 text-center">{item.quantity}</span>
                        <button onClick={() => updateQuantity(item.cartKey, item.quantity + 1)} className="p-1 rounded bg-muted text-foreground hover:bg-muted/80">
                          <Plus className="w-3 h-3" />
                        </button>
                        <button onClick={() => removeItem(item.cartKey)} className="ml-auto p-1 text-muted-foreground hover:text-destructive">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            <div className="border-t border-border pt-4 mt-4 space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground font-medium">{t("cart.total")}</span>
                <span className="text-xl font-bold text-foreground">${totalPrice.toFixed(2)}</span>
              </div>
              <button onClick={handleCheckout} className="w-full py-3 bg-primary text-primary-foreground font-semibold rounded-lg hover:bg-primary/90 transition-colors flex items-center justify-center gap-2">
                {t("cart.checkout")}
              </button>
              <button onClick={() => { setIsOpen(false); navigate("/"); }} className="w-full py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2">
                {t("cart.continueShopping")}
              </button>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
};

export default CartDrawer;
