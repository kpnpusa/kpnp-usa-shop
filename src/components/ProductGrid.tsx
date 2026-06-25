import { useState, useMemo, memo } from "react";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { useProducts, usePrefetchProducts } from "@/hooks/useProducts";
import kpnpLogo from "@/assets/kpnp-logo.png";
import ProductCard from "./ProductCard";

const categoryKeys = ["all", "k1-pss", "k2-pss", "apparel", "uniforms", "training"] as const;

const ProductGridSkeleton = () => (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
    {Array.from({ length: 8 }).map((_, i) => (
      <div key={i} className="glass-card rounded-xl overflow-hidden">
        <div className="aspect-[4/5] bg-secondary animate-pulse" />
        <div className="p-4 space-y-3">
          <div className="h-4 bg-secondary animate-pulse rounded w-3/4" />
          <div className="h-4 bg-secondary animate-pulse rounded w-1/2" />
          <div className="flex justify-between items-center mt-2">
            <div className="h-6 bg-secondary animate-pulse rounded w-20" />
            <div className="h-8 w-8 bg-secondary animate-pulse rounded-lg" />
          </div>
        </div>
      </div>
    ))}
  </div>
);

const ProductGrid = memo(() => {
  const [active, setActive] = useState<string>("all");
  const { data: products = [], isLoading } = useProducts();
  const prefetchProducts = usePrefetchProducts();
  const { t } = useTranslation();

  const filtered = useMemo(() =>
    (active === "all"
      ? products
      : products.filter((p) => p.category === active)
    ).sort((a, b) => {
      const aOut = a.stockStatus === "out_of_stock" || a.badge === "sold-out" || a.badge === "coming-soon" || a.price === 0 ? 1 : 0;
      const bOut = b.stockStatus === "out_of_stock" || b.badge === "sold-out" || b.badge === "coming-soon" || b.price === 0 ? 1 : 0;
      return aOut - bOut;
    }),
    [active, products]
  );

  return (
    <section id="products" className="py-20 bg-gradient-dark" onMouseEnter={prefetchProducts}>
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="font-display text-3xl sm:text-4xl text-foreground mb-4 italic font-extrabold">
            {t("products.title_prefix")} <img src={kpnpLogo} alt="KPNP" className="inline-block h-[0.7em] mx-1 align-baseline" /> {t("products.title_suffix")}
          </h2>
          <p className="text-foreground/75 font-medium max-w-md mx-auto">
            {t("products.description")}
          </p>
        </motion.div>

        <div className="flex justify-center gap-2 mb-10 flex-wrap">
          {categoryKeys.map((key) => (
            <button
              key={key}
              onClick={() => setActive(key)}
              className={`px-5 py-2.5 text-[0.9rem] font-semibold tracking-wide rounded-full transition-all ${
                active === key
                  ? "bg-primary/80 backdrop-blur-sm text-primary-foreground shadow-md"
                  : "bg-secondary/70 text-secondary-foreground hover:bg-secondary/90"
              }`}
            >
              {t(`products.${key}`)}
            </button>
          ))}
        </div>

        {isLoading ? (
          <ProductGridSkeleton />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filtered.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
});

ProductGrid.displayName = "ProductGrid";

export default ProductGrid;
