import { useState, memo, useMemo } from "react";
import { motion } from "framer-motion";
import { ShoppingCart } from "lucide-react";
import { useTranslation } from "react-i18next";
import type { Product } from "@/data/products";
import { useCart } from "@/context/CartContext";
import { productVariants } from "@/data/variants";
import OptimizedImage from "./OptimizedImage";
import VariantModal from "./VariantModal";

const badgeClass: Record<string, string> = {
  sale: "badge-sale",
  bestseller: "badge-bestseller",
  preorder: "badge-preorder",
  "coming-soon": "badge-coming-soon",
  premium: "badge-bestseller",
  "sold-out": "badge-sale",
};

const ProductCard = memo(({ product }: { product: Product }) => {
  const { addItem } = useCart();
  const { t } = useTranslation();
  const [modalOpen, setModalOpen] = useState(false);

  const hasVariants = useMemo(() => {
    const dynamicVariants = product.availableVariants;
    const fallbackVariants = productVariants[product.id];
    return (
      !!dynamicVariants?.sizes?.length ||
      !!dynamicVariants?.colors?.length ||
      !!fallbackVariants?.sizes?.length ||
      !!fallbackVariants?.colors?.length
    );
  }, [product.id, product.availableVariants]);

  const isDisabled = useMemo(() =>
    product.badge === "coming-soon" ||
    product.badge === "sold-out" ||
    product.stockStatus === "out_of_stock" ||
    product.price === 0,
    [product.badge, product.stockStatus, product.price]
  );

  const handleCartClick = () => {
    if (isDisabled) return;
    setModalOpen(true);
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-50px" }}
        transition={{ duration: 0.4 }}
        className="group glass-card rounded-xl overflow-hidden flex flex-col"
      >
        <div className="relative aspect-[4/5] bg-secondary overflow-hidden">
          <OptimizedImage
            src={product.image}
            alt={product.name}
            className={`w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ${isDisabled ? "opacity-50 grayscale" : ""}`}
            width={400}
          />
          {isDisabled && (product.badge === "sold-out" || product.stockStatus === "out_of_stock") && (
            <div className="absolute inset-0 flex items-center justify-center bg-background/60">
              <span className="px-4 py-2 text-sm font-bold uppercase tracking-wider text-destructive bg-background/80 rounded-md border border-destructive/30">
                {t("products.outOfStock")}
              </span>
            </div>
          )}
          {product.badge && product.badgeText && !(product.badge === "sold-out" && (product.stockStatus === "out_of_stock" || product.badge === "sold-out")) && (
            <span className={`absolute top-3 left-3 ${badgeClass[product.badge]}`}>
              {product.badgeText}
            </span>
          )}
        </div>

        <div className="p-4 flex flex-col flex-1">
          <h3 className="text-sm font-medium text-foreground leading-snug mb-2 flex-1">
            {product.name}
          </h3>
          <div className="flex items-center justify-between mt-auto">
            <div className="flex items-center gap-2">
              {product.price > 0 ? (
                <>
                  <span className="text-lg font-bold text-foreground">
                    ${product.price.toFixed(2)}
                  </span>
                  {product.originalPrice && (
                    <span className="text-sm text-muted-foreground line-through">
                      ${product.originalPrice.toFixed(2)}
                    </span>
                  )}
                </>
              ) : (
                <span className="text-sm font-medium text-muted-foreground">
                  {t("products.priceTBD")}
                </span>
              )}
            </div>
            <button
              onClick={handleCartClick}
              disabled={isDisabled}
              className="p-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/80 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              aria-label={`${t("products.addToCart")} ${product.name}`}
            >
              <ShoppingCart className="w-4 h-4" />
            </button>
          </div>
        </div>
      </motion.div>

      <VariantModal
        product={product}
        open={modalOpen}
        onOpenChange={setModalOpen}
      />
    </>
  );
});

ProductCard.displayName = "ProductCard";

export default ProductCard;
