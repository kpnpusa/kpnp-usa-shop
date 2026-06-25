import { useState, useEffect, useRef, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, X, ChevronLeft, ChevronRight, ZoomIn } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ChatBot from "@/components/ChatBot";
import CartDrawer from "@/components/CartDrawer";
import { useProducts } from "@/hooks/useProducts";
import { productGallery } from "@/data/productGallery";
import type { Product } from "@/data/products";

const categoryOrder: Product["category"][] = ["k1-pss", "k2-pss", "apparel", "uniforms", "training"];

const Equipment = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { data: products = [] } = useProducts();
  const [selectedCategory, setSelectedCategory] = useState<Product["category"] | "all">("all");
  const [lightboxProduct, setLightboxProduct] = useState<Product | null>(null);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [activeImageIdx, setActiveImageIdx] = useState(0);

  const filtered = selectedCategory === "all"
    ? products
    : products.filter((p) => p.category === selectedCategory);

  const grouped = categoryOrder
    .map((cat) => ({
      category: cat,
      label: t(`products.${cat}`),
      items: filtered.filter((p) => p.category === cat),
    }))
    .filter((g) => g.items.length > 0);

  const allFiltered = selectedCategory === "all"
    ? grouped
    : [{ category: selectedCategory as Product["category"], label: t(`products.${selectedCategory}`), items: filtered }];

  // Get all images for the current lightbox product
  const getLightboxImages = (product: Product | null): string[] => {
    if (!product) return [];
    const gallery = productGallery[product.id];
    if (gallery && gallery.images.length > 0) {
      return gallery.images;
    }
    // Fallback to the single product image
    return [product.image];
  };

  const getLightboxDescription = (product: Product | null): string | undefined => {
    if (!product) return undefined;
    return productGallery[product.id]?.description;
  };

  const openLightbox = (product: Product) => {
    setLightboxProduct(product);
    setActiveImageIdx(0);
    const idx = filtered.findIndex((p) => p.id === product.id);
    setLightboxIndex(idx >= 0 ? idx : 0);
  };

  const navigateLightbox = (dir: number) => {
    const newIdx = (lightboxIndex + dir + filtered.length) % filtered.length;
    setLightboxIndex(newIdx);
    setLightboxProduct(filtered[newIdx]);
    setActiveImageIdx(0);
  };

  // Reset active image when lightbox product changes
  useEffect(() => {
    setActiveImageIdx(0);
  }, [lightboxProduct?.id]);

  const currentImages = getLightboxImages(lightboxProduct);
  const currentDescription = getLightboxDescription(lightboxProduct);

  // Swipe support
  const touchStartX = useRef(0);
  const touchStartY = useRef(0);
  const isSwiping = useRef(false);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
    isSwiping.current = true;
  }, []);

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    if (!isSwiping.current) return;
    isSwiping.current = false;
    const deltaX = e.changedTouches[0].clientX - touchStartX.current;
    const deltaY = Math.abs(e.changedTouches[0].clientY - touchStartY.current);
    // Only swipe horizontally (ignore vertical scrolls)
    if (Math.abs(deltaX) > 50 && deltaY < 100) {
      if (deltaX < 0) {
        // Swipe left → next image
        setActiveImageIdx((prev) => (prev + 1) % currentImages.length);
      } else {
        // Swipe right → prev image
        setActiveImageIdx((prev) => (prev - 1 + currentImages.length) % currentImages.length);
      }
    }
  }, [currentImages.length]);


  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="flex items-center gap-4 mb-8">
            <button
              onClick={() => navigate("/")}
              className="p-2 rounded-lg border border-border text-muted-foreground hover:text-foreground hover:border-primary/50 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl text-foreground italic leading-none">
                {t("equipment.title_prefix")}{" "}
                <span className="text-primary font-extrabold">{t("equipment.title_suffix")}</span>
              </h1>
              <p className="text-muted-foreground mt-2 max-w-2xl">
                {t("equipment.description")}
              </p>
            </div>
          </div>

          {/* Category Filters */}
          <div className="flex flex-wrap gap-2 mb-10">
            <button
              onClick={() => setSelectedCategory("all")}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
                selectedCategory === "all"
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
              }`}
            >
              {t("products.all")}
            </button>
            {categoryOrder.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
                  selectedCategory === cat
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                }`}
              >
                {t(`products.${cat}`)}
              </button>
            ))}
          </div>

          {/* Gallery Grid */}
          {allFiltered.map((group) => (
            <section key={group.category} className="mb-12">
              {selectedCategory === "all" && (
                <h2 className="text-2xl font-bold text-foreground mb-6 border-l-4 border-primary pl-4">
                  {group.label}
                </h2>
              )}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {group.items.map((product, i) => {
                  const hasGallery = productGallery[product.id]?.images?.length > 1;
                  return (
                    <motion.div
                      key={product.id}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true, margin: "-30px" }}
                      transition={{ duration: 0.3, delay: i * 0.03 }}
                      className="group cursor-pointer"
                      onClick={() => openLightbox(product)}
                    >
                      <div className="relative aspect-square bg-secondary rounded-xl overflow-hidden border border-border/50 hover:border-primary/40 transition-all duration-300">
                        <img
                          src={product.image}
                          alt={product.name}
                          className={`w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 ${
                            product.stockStatus === "out_of_stock" || product.badge === "sold-out"
                              ? "opacity-50 grayscale"
                              : ""
                          }`}
                          loading="lazy"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-3">
                          <div className="flex items-center gap-2 text-foreground">
                            <ZoomIn className="w-4 h-4" />
                            <span className="text-xs font-medium">
                              {hasGallery
                                ? `${productGallery[product.id].images.length} ${t("equipment.photos")}`
                                : t("equipment.viewDetail")}
                            </span>
                          </div>
                        </div>
                        {product.badge && product.badgeText && (
                          <span className={`absolute top-2 left-2 text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                            product.badge === "sale" ? "bg-destructive text-destructive-foreground" :
                            product.badge === "bestseller" ? "bg-primary text-primary-foreground" :
                            product.badge === "preorder" ? "bg-blue-600 text-white" :
                            product.badge === "coming-soon" ? "bg-muted text-muted-foreground" :
                            product.badge === "sold-out" ? "bg-destructive/80 text-destructive-foreground" :
                            "bg-primary text-primary-foreground"
                          }`}>
                            {product.badgeText}
                          </span>
                        )}
                      </div>
                      <div className="mt-2 px-1">
                        <p className="text-xs sm:text-sm font-medium text-foreground leading-tight line-clamp-2">
                          {product.name}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {product.price > 0
                            ? `$${product.price.toFixed(2)}`
                            : t("products.priceTBD")}
                          {product.originalPrice && (
                            <span className="line-through ml-2">${product.originalPrice.toFixed(2)}</span>
                          )}
                        </p>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </section>
          ))}

          {filtered.length === 0 && (
            <div className="text-center py-20 text-muted-foreground">
              {t("equipment.noProducts")}
            </div>
          )}
        </div>
      </main>

      {/* Lightbox */}
      <AnimatePresence>
        {lightboxProduct && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-background/95 backdrop-blur-xl flex items-center justify-center p-4 overflow-y-auto"
            onClick={() => setLightboxProduct(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative max-w-5xl w-full flex flex-col md:flex-row gap-6 items-start my-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close */}
              <button
                onClick={() => setLightboxProduct(null)}
                className="absolute -top-10 right-0 md:right-0 p-2 text-muted-foreground hover:text-foreground transition-colors z-10"
              >
                <X className="w-6 h-6" />
              </button>

              {/* Nav Left (product-level) */}
              <button
                onClick={() => navigateLightbox(-1)}
                className="hidden md:flex absolute -left-14 top-1/2 -translate-y-1/2 p-2 rounded-full border border-border text-muted-foreground hover:text-foreground hover:border-primary/50 transition-colors"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>

              {/* Image Section */}
              <div className="flex-1 w-full md:w-auto flex flex-col items-center gap-3">
                {/* Main Image */}
                <div
                  className="relative w-full max-h-[60vh] flex items-center justify-center bg-secondary/30 rounded-xl overflow-hidden touch-pan-y"
                  onTouchStart={handleTouchStart}
                  onTouchEnd={handleTouchEnd}
                >
                  <AnimatePresence mode="wait">
                    <motion.img
                      key={currentImages[activeImageIdx]}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      src={currentImages[activeImageIdx]}
                      alt={lightboxProduct.name}
                      className="max-w-full max-h-[60vh] object-contain rounded-xl"
                    />
                  </AnimatePresence>

                  {/* Image nav arrows (within gallery) */}
                  {currentImages.length > 1 && (
                    <>
                      <button
                        onClick={() => setActiveImageIdx((prev) => (prev - 1 + currentImages.length) % currentImages.length)}
                        className="absolute left-2 top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-background/80 border border-border text-muted-foreground hover:text-foreground transition-colors"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setActiveImageIdx((prev) => (prev + 1) % currentImages.length)}
                        className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-background/80 border border-border text-muted-foreground hover:text-foreground transition-colors"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </>
                  )}
                </div>

                {/* Thumbnails */}
                {currentImages.length > 1 && (
                  <div className="flex gap-2 overflow-x-auto max-w-full pb-1">
                    {currentImages.map((img, idx) => (
                      <button
                        key={idx}
                        onClick={() => setActiveImageIdx(idx)}
                        className={`shrink-0 w-14 h-14 sm:w-16 sm:h-16 rounded-lg overflow-hidden border-2 transition-all ${
                          idx === activeImageIdx
                            ? "border-primary shadow-md"
                            : "border-border/50 hover:border-primary/40 opacity-60 hover:opacity-100"
                        }`}
                      >
                        <img
                          src={img}
                          alt={`${lightboxProduct.name} ${idx + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </button>
                    ))}
                  </div>
                )}

                {/* Image counter */}
                {currentImages.length > 1 && (
                  <p className="text-xs text-muted-foreground">
                    {activeImageIdx + 1} / {currentImages.length}
                  </p>
                )}
              </div>

              {/* Details */}
              <div className="flex-1 max-w-md w-full">
                <p className="text-xs uppercase tracking-widest text-primary font-semibold mb-2">
                  {t(`products.${lightboxProduct.category}`)}
                </p>
                <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-4">
                  {lightboxProduct.name}
                </h2>
                {lightboxProduct.badge && lightboxProduct.badgeText && (
                  <span className={`inline-block text-xs px-3 py-1 rounded-full font-bold uppercase tracking-wider mb-4 ${
                    lightboxProduct.badge === "sale" ? "bg-destructive text-destructive-foreground" :
                    lightboxProduct.badge === "bestseller" ? "bg-primary text-primary-foreground" :
                    lightboxProduct.badge === "preorder" ? "bg-blue-600 text-white" :
                    lightboxProduct.badge === "coming-soon" ? "bg-muted text-muted-foreground" :
                    lightboxProduct.badge === "sold-out" ? "bg-destructive/80 text-destructive-foreground" :
                    "bg-primary text-primary-foreground"
                  }`}>
                    {lightboxProduct.badgeText}
                  </span>
                )}
                <div className="flex items-baseline gap-3 mb-4">
                  {lightboxProduct.price > 0 ? (
                    <>
                      <span className="text-3xl font-bold text-foreground">
                        ${lightboxProduct.price.toFixed(2)}
                      </span>
                      {lightboxProduct.originalPrice && (
                        <span className="text-lg text-muted-foreground line-through">
                          ${lightboxProduct.originalPrice.toFixed(2)}
                        </span>
                      )}
                    </>
                  ) : (
                    <span className="text-lg text-muted-foreground">{t("products.priceTBD")}</span>
                  )}
                </div>

                {/* Description */}
                {currentDescription && (
                  <p className="text-sm text-muted-foreground leading-relaxed mb-6">
                    {currentDescription}
                  </p>
                )}

                <button
                  onClick={() => {
                    setLightboxProduct(null);
                    navigate("/#products");
                  }}
                  className="px-6 py-3 bg-primary text-primary-foreground font-semibold rounded-lg hover:bg-primary/90 transition-colors"
                >
                  {t("equipment.goToShop")}
                </button>
              </div>

              {/* Nav Right (product-level) */}
              <button
                onClick={() => navigateLightbox(1)}
                className="hidden md:flex absolute -right-14 top-1/2 -translate-y-1/2 p-2 rounded-full border border-border text-muted-foreground hover:text-foreground hover:border-primary/50 transition-colors"
              >
                <ChevronRight className="w-6 h-6" />
              </button>

              {/* Mobile product Nav */}
              <div className="flex md:hidden gap-4 mt-2 w-full justify-center">
                <button
                  onClick={() => navigateLightbox(-1)}
                  className="p-2 rounded-full border border-border text-muted-foreground"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <span className="text-sm text-muted-foreground self-center">
                  {lightboxIndex + 1} / {filtered.length}
                </span>
                <button
                  onClick={() => navigateLightbox(1)}
                  className="p-2 rounded-full border border-border text-muted-foreground"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <CartDrawer />
      <ChatBot />
      <Footer />
    </div>
  );
};

export default Equipment;
