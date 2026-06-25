import { useState, memo, useMemo } from "react";
import { ShoppingCart, Minus, Plus } from "lucide-react";
import { useTranslation } from "react-i18next";
import type { Product } from "@/data/products";
import { useCart } from "@/context/CartContext";
import { productVariants } from "@/data/variants";
import { getShopifyProductByHandle, buildVariantAvailability } from "@/hooks/useProducts";
import OptimizedImage from "./OptimizedImage";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

type Props = {
  product: Product;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

type VariantOption = {
  label: string;
  value: string;
};

const formatSizeLabel = (value: string) => {
  const eSock = value.match(/^#(\d+)-US(\d+)$/i);
  if (eSock) return `#${eSock[1]} - US ${eSock[2]}`;
  return value;
};

const formatColorLabel = (value: string) => value.charAt(0).toUpperCase() + value.slice(1);

const VariantModal = memo(({ product, open, onOpenChange }: Props) => {
  const { addItem } = useCart();
  const { t } = useTranslation();

  const fallbackVariants = productVariants[product.id];
  const fallbackSizeOptions: VariantOption[] = fallbackVariants?.sizes ?? [];
  const fallbackColorOptions: VariantOption[] = fallbackVariants?.colors ?? [];

  // Get Shopify variant availability
  const shopifyProduct = getShopifyProductByHandle(product.id);
  const shopifyAvailability = useMemo(
    () => shopifyProduct ? buildVariantAvailability(shopifyProduct) : null,
    [shopifyProduct]
  );

  const dynamicSizeOptions: VariantOption[] =
    product.availableVariants?.sizes?.map((value) => ({ value, label: formatSizeLabel(value) })) ?? [];
  const dynamicColorOptions: VariantOption[] =
    product.availableVariants?.colors?.map((value) => ({ value, label: formatColorLabel(value) })) ?? [];

  const hasDynamicVariants = dynamicSizeOptions.length > 0 || dynamicColorOptions.length > 0;
  const requiresValidatedStock = false;

  const sizeOptions = hasDynamicVariants ? dynamicSizeOptions : fallbackSizeOptions;
  const colorOptions = hasDynamicVariants ? dynamicColorOptions : fallbackColorOptions;

  const hasSizes = sizeOptions.length > 0;
  const hasColors = colorOptions.length > 0;

  const [selectedSize, setSelectedSize] = useState<string | undefined>(undefined);
  const [selectedColor, setSelectedColor] = useState<string | undefined>(undefined);
  const [quantity, setQuantity] = useState(1);

  const isSizeDisabled = (value: string) => {
    if (shopifyAvailability) {
      return shopifyAvailability.sizes[value] === false;
    }
    if (hasDynamicVariants && product.availableVariants?.sizes) {
      return !product.availableVariants.sizes.includes(value);
    }
    return requiresValidatedStock;
  };

  const isColorDisabled = (value: string) => {
    if (shopifyAvailability) {
      return shopifyAvailability.colors[value] === false;
    }
    if (hasDynamicVariants && product.availableVariants?.colors) {
      return !product.availableVariants.colors.includes(value);
    }
    return requiresValidatedStock;
  };

  const needsSelection =
    requiresValidatedStock ||
    (hasSizes && !selectedSize) ||
    (hasColors && !selectedColor);

  // If no variants at all, auto-add immediately when modal opens
  const hasNoVariants = !hasSizes && !hasColors;

  const handleAdd = () => {
    if (requiresValidatedStock) return;
    addItem(product, selectedSize, selectedColor, quantity);
    setSelectedSize(undefined);
    setSelectedColor(undefined);
    setQuantity(1);
    onOpenChange(false);
  };

  const handleOpenChange = (val: boolean) => {
    if (!val) {
      setSelectedSize(undefined);
      setSelectedColor(undefined);
      setQuantity(1);
    }
    onOpenChange(val);
  };

  const getSelectLabel = () => {
    if (requiresValidatedStock) {
      return t("variant.syncPending", "Sincronizando estoque de tamanhos");
    }

    const parts: string[] = [];
    if (hasSizes && !selectedSize) parts.push(t("variant.selectSize"));
    if (hasColors && !selectedColor) parts.push(t("variant.selectColor"));
    return `${t("variant.select")} ${parts.join(` ${t("variant.and")} `)}`;
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md bg-card border-border">
        <DialogHeader>
          <DialogTitle className="text-foreground text-lg pr-6">
            {product.name}
          </DialogTitle>
          <DialogDescription className="sr-only">
            {t("variant.selectOptions", "Select options for {{name}}", { name: product.name })}
          </DialogDescription>
        </DialogHeader>

        <div className="flex gap-4 mt-2">
          <OptimizedImage src={product.image} alt={product.name} className="w-28 h-36 object-cover rounded-lg bg-secondary flex-shrink-0" width={200} />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-4">
              {product.price > 0 ? (
                <>
                  <span className="text-2xl font-bold text-foreground">${product.price.toFixed(2)}</span>
                  {product.originalPrice && (
                    <span className="text-sm text-muted-foreground line-through">${product.originalPrice.toFixed(2)}</span>
                  )}
                </>
              ) : (
                <span className="text-lg font-medium text-muted-foreground">{t("variant.priceTBD")}</span>
              )}
            </div>

            {hasSizes && (
              <div className="mb-4">
                <p className="text-sm text-muted-foreground mb-2 font-medium">
                  {t("variant.size")} {selectedSize && <span className="text-foreground">— {formatSizeLabel(selectedSize)}</span>}
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {sizeOptions.map((size) => {
                    const isDisabledSize = isSizeDisabled(size.value);
                    const isSelected = selectedSize === size.value;
                    return (
                      <button
                        key={size.value}
                        onClick={() => !isDisabledSize && setSelectedSize(isSelected ? undefined : size.value)}
                        disabled={isDisabledSize}
                        className={`relative min-w-[2.25rem] px-2 py-1.5 text-xs font-medium rounded-md border transition-all ${
                          isDisabledSize
                            ? "border-border/50 text-muted-foreground/30 cursor-not-allowed line-through bg-muted/30"
                            : isSelected
                              ? "bg-primary text-primary-foreground border-primary scale-105"
                              : "border-border text-muted-foreground hover:border-foreground hover:text-foreground"
                        }`}
                        title={isDisabledSize ? t("variant.outOfStock") : size.label}
                      >
                        {size.label}
                        {isDisabledSize && (
                          <span className="absolute inset-0 flex items-center justify-center">
                            <span className="w-full h-px bg-muted-foreground/40 rotate-[-20deg] absolute" />
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {hasColors && (
              <div className="mb-4">
                <p className="text-sm text-muted-foreground mb-2 font-medium">
                  {t("variant.color")} {selectedColor && <span className="text-foreground">— {formatColorLabel(selectedColor)}</span>}
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {colorOptions.map((color) => {
                    const isDisabledColor = isColorDisabled(color.value);
                    const isSelected = selectedColor === color.value;
                    return (
                      <button
                        key={color.value}
                        onClick={() => !isDisabledColor && setSelectedColor(isSelected ? undefined : color.value)}
                        disabled={isDisabledColor}
                        className={`relative px-3 py-1.5 text-xs font-medium rounded-md border transition-all ${
                          isDisabledColor
                            ? "border-border/50 text-muted-foreground/30 cursor-not-allowed line-through bg-muted/30"
                            : isSelected
                              ? "bg-primary text-primary-foreground border-primary scale-105"
                              : "border-border text-muted-foreground hover:border-foreground hover:text-foreground"
                        }`}
                        title={isDisabledColor ? t("variant.outOfStock") : color.label}
                      >
                        {color.label}
                        {isDisabledColor && (
                          <span className="absolute inset-0 flex items-center justify-center">
                            <span className="w-full h-px bg-muted-foreground/40 rotate-[-20deg] absolute" />
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {requiresValidatedStock && (
              <p className="text-xs text-muted-foreground">
                {t("variant.syncWarning", "Estamos sincronizando o estoque por tamanho deste produto.")}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3 mt-4">
          <div className="flex items-center border border-border rounded-lg overflow-hidden">
            <button
              type="button"
              onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              className="px-3 py-2.5 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              aria-label="Decrease quantity"
            >
              <Minus className="w-4 h-4" />
            </button>
            <span className="px-4 py-2.5 text-sm font-semibold text-foreground min-w-[2.5rem] text-center tabular-nums">
              {quantity}
            </span>
            <button
              type="button"
              onClick={() => setQuantity((q) => Math.min(99, q + 1))}
              className="px-3 py-2.5 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              aria-label="Increase quantity"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={handleAdd}
            disabled={needsSelection}
            className="flex-1 py-3 bg-primary text-primary-foreground font-semibold rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <ShoppingCart className="w-4 h-4" />
            {needsSelection ? getSelectLabel() : t("variant.addToCart")}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
});

VariantModal.displayName = "VariantModal";

export default VariantModal;
