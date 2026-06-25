import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback } from "react";
import type { Product } from "@/data/products";
import { products as staticProducts } from "@/data/products";
import { fetchAllShopifyProducts, type ShopifyProduct } from "@/lib/shopify";

// Map Shopify productType / tags to our categories
function mapCategory(sp: ShopifyProduct): Product["category"] {
  const type = sp.productType.toLowerCase();
  const tags = sp.tags.map((t) => t.toLowerCase());

  if (tags.includes("k1-pss") || type.includes("k1")) return "k1-pss";
  if (tags.includes("k2-pss") || type.includes("k2")) return "k2-pss";
  if (tags.includes("apparel") || type.includes("apparel") || type.includes("tracksuit") || type.includes("shirt")) return "apparel";
  if (tags.includes("uniforms") || type.includes("uniform") || type.includes("dobok")) return "uniforms";
  if (tags.includes("training") || type.includes("training") || type.includes("guard") || type.includes("mitt") || type.includes("pad")) return "training";

  // Fallback heuristic based on title
  const title = sp.title.toLowerCase();
  if (title.includes("sock") || title.includes("receiver") || title.includes("judge") || title.includes("head protector") || title.includes("chest protector")) {
    if (title.includes("k2")) return "k2-pss";
    return "k1-pss";
  }
  if (title.includes("dobok") || title.includes("uniform") || title.includes("belt") || title.includes("poomsae")) return "uniforms";
  if (title.includes("tracksuit") || title.includes("jacket") || title.includes("shirt") || title.includes("shorts") || title.includes("polo")) return "apparel";
  return "training";
}

function mapShopifyToProduct(sp: ShopifyProduct): Product & { variantDetails: ShopifyProduct["variants"] } {
  const variants = sp.variants.edges.map((e) => e.node);
  const anyAvailable = variants.some((v) => v.availableForSale);
  const firstAvailable = variants.find((v) => v.availableForSale) || variants[0];

  const price = parseFloat(firstAvailable.price.amount);
  const compareAt = firstAvailable.compareAtPrice
    ? parseFloat(firstAvailable.compareAtPrice.amount)
    : undefined;

  // Collect available sizes and colors
  const availableSizes: string[] = [];
  const availableColors: string[] = [];
  const allSizes: string[] = [];
  const allColors: string[] = [];

  for (const v of variants) {
    for (const opt of v.selectedOptions) {
      const name = opt.name.toLowerCase();
      const val = opt.value.toLowerCase();
      // Skip default/placeholder variants — they aren't real selectable options
      if (name === "title" || val === "default title" || val === "default") continue;
      if (name === "size") {
        if (!allSizes.includes(opt.value)) allSizes.push(opt.value);
        if (v.availableForSale && !availableSizes.includes(opt.value)) {
          availableSizes.push(opt.value);
        }
      }
      if (name === "color" || name === "colour") {
        if (!allColors.includes(opt.value)) allColors.push(opt.value);
        if (v.availableForSale && !availableColors.includes(opt.value)) {
          availableColors.push(opt.value);
        }
      }
    }
  }

  const stockStatus: Product["stockStatus"] = anyAvailable ? "in_stock" : "out_of_stock";
  const badge: Product["badge"] = anyAvailable ? undefined : "sold-out";
  const badgeText = anyAvailable ? undefined : "Sold Out";

  // If compareAt is higher, show sale badge
  const hasSale = compareAt && compareAt > price && anyAvailable;

  return {
    id: sp.handle,
    name: sp.title,
    price: anyAvailable ? price : 0,
    originalPrice: hasSale ? compareAt : undefined,
    image: sp.featuredImage?.url || "",
    category: mapCategory(sp),
    badge: hasSale ? "sale" : badge,
    badgeText: hasSale ? `${Math.round((1 - price / compareAt!) * 100)}% Off` : badgeText,
    stockStatus,
    availableVariants: {
      sizes: allSizes.length > 0 ? allSizes : undefined,
      colors: allColors.length > 0 ? allColors : undefined,
    },
    // Extra field for variant-level availability
    variantDetails: sp.variants,
  };
}

// Export availability map so VariantModal can check per-option availability
export type VariantAvailability = {
  sizes: Record<string, boolean>; // value -> availableForSale
  colors: Record<string, boolean>;
  // Combined: size+color combo availability
  combos: Record<string, boolean>; // "size::color" -> available
};

export function buildVariantAvailability(sp: ShopifyProduct): VariantAvailability {
  const sizes: Record<string, boolean> = {};
  const colors: Record<string, boolean> = {};
  const combos: Record<string, boolean> = {};

  for (const edge of sp.variants.edges) {
    const v = edge.node;
    let size = "";
    let color = "";
    for (const opt of v.selectedOptions) {
      const name = opt.name.toLowerCase();
      const val = opt.value.toLowerCase();
      if (name === "title" || val === "default title" || val === "default") continue;
      if (name === "size") {
        size = opt.value;
        sizes[opt.value] = sizes[opt.value] || v.availableForSale;
      }
      if (name === "color" || name === "colour") {
        color = opt.value;
        colors[opt.value] = colors[opt.value] || v.availableForSale;
      }
    }
    if (size || color) {
      combos[`${size}::${color}`] = v.availableForSale;
    }
  }

  return { sizes, colors, combos };
}

// Store the raw Shopify products for variant availability lookups
let _shopifyProductsCache: ShopifyProduct[] = [];

export function getShopifyProductByHandle(handle: string): ShopifyProduct | undefined {
  return _shopifyProductsCache.find((p) => p.handle === handle);
}

const QUERY_KEY = ["products-shopify"];

async function fetchProducts(): Promise<Product[]> {
  try {
    const shopifyProducts = await fetchAllShopifyProducts();
    _shopifyProductsCache = shopifyProducts;
    console.log(`Fetched ${shopifyProducts.length} products from Shopify`);
    return shopifyProducts.map((sp) => {
      const { variantDetails, ...product } = mapShopifyToProduct(sp);
      return product;
    });
  } catch (err) {
    console.error("Shopify fetch failed, using static fallback:", err);
    return staticProducts;
  }
}

export function useProducts() {
  return useQuery({
    queryKey: QUERY_KEY,
    queryFn: fetchProducts,
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
    refetchInterval: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
}

/**
 * Hook to prefetch products on hover.
 * If data is already cached, this is a no-op.
 */
export function usePrefetchProducts() {
  const queryClient = useQueryClient();
  return useCallback(() => {
    queryClient.prefetchQuery({
      queryKey: QUERY_KEY,
      queryFn: fetchProducts,
      staleTime: 5 * 60 * 1000,
    });
  }, [queryClient]);
}
