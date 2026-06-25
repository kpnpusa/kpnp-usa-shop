const SHOPIFY_DOMAIN = "kpnp-usa.myshopify.com";
const STOREFRONT_TOKEN = "18fc9c5beda10f6aacf18e8564b65d57";
const STOREFRONT_API_URL = `https://${SHOPIFY_DOMAIN}/api/2024-01/graphql.json`;

export type ShopifyVariant = {
  id: string;
  title: string;
  availableForSale: boolean;
  price: { amount: string; currencyCode: string };
  compareAtPrice: { amount: string; currencyCode: string } | null;
  selectedOptions: { name: string; value: string }[];
};

export type ShopifyProduct = {
  id: string;
  handle: string;
  title: string;
  productType: string;
  tags: string[];
  featuredImage: { url: string; altText: string | null } | null;
  variants: { edges: { node: ShopifyVariant }[] };
};

const PRODUCTS_QUERY = `
  query AllProducts($cursor: String) {
    products(first: 100, after: $cursor) {
      pageInfo { hasNextPage endCursor }
      edges {
        node {
          id
          handle
          title
          productType
          tags
          featuredImage { url altText }
          variants(first: 100) {
            edges {
              node {
                id
                title
                availableForSale
                price { amount currencyCode }
                compareAtPrice { amount currencyCode }
                selectedOptions { name value }
              }
            }
          }
        }
      }
    }
  }
`;

export async function fetchAllShopifyProducts(): Promise<ShopifyProduct[]> {
  const allProducts: ShopifyProduct[] = [];
  let cursor: string | null = null;
  let hasNextPage = true;

  while (hasNextPage) {
    const res = await fetch(STOREFRONT_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Storefront-Access-Token": STOREFRONT_TOKEN,
      },
      body: JSON.stringify({ query: PRODUCTS_QUERY, variables: { cursor } }),
    });

    if (!res.ok) throw new Error(`Shopify API error: ${res.status}`);
    const json = await res.json();
    const data = json.data?.products;
    if (!data) throw new Error("No product data from Shopify");

    for (const edge of data.edges) {
      allProducts.push(edge.node);
    }

    hasNextPage = data.pageInfo.hasNextPage;
    cursor = data.pageInfo.endCursor;
  }

  return allProducts;
}
