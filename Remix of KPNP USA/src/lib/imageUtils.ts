/**
 * Optimize Shopify CDN image URLs with width and webp format.
 * Only transforms cdn.shopify.com URLs; leaves other URLs untouched.
 */
export function optimizeShopifyImage(url: string, width = 400): string {
  if (!url || !url.includes("cdn.shopify.com")) return url;
  const separator = url.includes("?") ? "&" : "?";
  return `${url}${separator}width=${width}&format=webp`;
}
