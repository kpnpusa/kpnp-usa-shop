import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface ParsedProduct {
  id: string;
  name: string;
  price: number;
  original_price: number | null;
  image_url: string;
  category: string;
  badge: string | null;
  badge_text: string | null;
  source_url: string;
  stock_status: string;
  available_variants: { sizes?: string[]; colors?: string[] } | null;
}

function slugify(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

function classifyProduct(name: string): string {
  const n = name.toLowerCase();
  if (n.includes("k2")) return "k2-pss";
  if (n.includes("electronic") || n.includes("receiver") || n.includes("judge scoring") ||
      n.includes("head protector") || n.includes("chest protector") || n.includes("e-socks tester"))
    return "k1-pss";
  if (n.includes("dobok") || n.includes("uniform") || n.includes("black belt") || n.includes("poomsae") ||
      n.includes("ribbed") || n.includes("jacquard") || n.includes("victor"))
    return "uniforms";
  if (n.includes("tracksuit") || n.includes("polo") || n.includes("dri-fit") || n.includes("drifit") ||
      n.includes("shirt") || n.includes("shorts") || n.includes("jacket"))
    return "apparel";
  return "training";
}

function determineBadge(badgeText: string | null, hasSalePrice: boolean): { badge: string | null; badge_text: string | null } {
  if (!badgeText && !hasSalePrice) return { badge: null, badge_text: null };
  const bt = (badgeText || "").toLowerCase().trim();
  if (bt.includes("best seller")) return { badge: "bestseller", badge_text: "Best Seller!" };
  if (bt.includes("preorder") || bt.includes("pre-order")) return { badge: "preorder", badge_text: badgeText };
  if (bt.includes("pre-owned")) return { badge: "sale", badge_text: "Pre-Owned" };
  if (bt.includes("premium")) return { badge: "premium", badge_text: "Premium" };
  if (bt.includes("coming soon")) return { badge: "coming-soon", badge_text: "Coming Soon" };
  if (bt.includes("sold out")) return { badge: "sold-out", badge_text: "Sold Out" };
  if (hasSalePrice || bt.includes("off")) return { badge: "sale", badge_text: badgeText || "Sale" };
  return { badge: null, badge_text: null };
}

function parseProductsFromMarkdown(markdown: string): ParsedProduct[] {
  const products: ParsedProduct[] = [];
  const seen = new Set<string>();

  const productRegex = /\[([^\]]*?!\[[^\]]*?\]\([^)]+\)[^\]]*?)\]\((https:\/\/kpnpamerica\.com\/[^)\s]+)\)/gs;

  let match;
  while ((match = productRegex.exec(markdown)) !== null) {
    const block = match[1];
    const sourceUrl = match[2];

    if (sourceUrl.includes("/shop") || sourceUrl.includes("/contact") || sourceUrl.includes("/rental"))
      continue;

    const nameMatch = block.match(/\*\*([^*]+)\*\*/);
    if (!nameMatch) continue;
    const name = nameMatch[1].trim();
    const id = slugify(name);
    if (seen.has(id)) continue;
    seen.add(id);

    const imgMatch = block.match(/!\[[^\]]*\]\(([^)]+)\)/);
    const imageUrl = imgMatch ? imgMatch[1] : "";

    const beforeImg = block.substring(0, block.indexOf("!")).replace(/\\/g, "").trim();
    let badgeText = beforeImg || null;

    const priceMatches = [...block.matchAll(/\$([0-9]+(?:\.[0-9]{2})?)/g)];
    let price = 0;
    let originalPrice: number | null = null;

    if (priceMatches.length >= 2) {
      originalPrice = parseFloat(priceMatches[0][1]);
      price = parseFloat(priceMatches[1][1]);
    } else if (priceMatches.length === 1) {
      price = parseFloat(priceMatches[0][1]);
    }

    const lowerBlock = block.toLowerCase();

    const isSoldOutOnCatalog = lowerBlock.includes("sold out");

    if (isSoldOutOnCatalog && !badgeText) {
      badgeText = "Sold Out";
    }

    const { badge, badge_text } = determineBadge(badgeText, !!originalPrice && originalPrice > price);

    products.push({
      id,
      name,
      price,
      original_price: originalPrice,
      image_url: imageUrl,
      category: classifyProduct(name),
      badge,
      badge_text,
      source_url: sourceUrl,
      // Catalog baseline; detail parser can override when strong in-stock signals exist.
      stock_status: isSoldOutOnCatalog ? "out_of_stock" : "in_stock",
      available_variants: null,
    });
  }

  return products;
}

const CATEGORY_URLS: Record<string, string> = {
  "k1-pss": "https://kpnpamerica.com/shop?category=pcol_01KJFWZDQQZ1H19V7F2J8HG2EY",
  "k2-pss": "https://kpnpamerica.com/shop?category=pcol_01KJD7HVE45PPRC1D2QBZ0DD5A",
  "apparel": "https://kpnpamerica.com/shop?category=pcol_01KJFX4DG8K033HCW7NYWPVPPB",
  "uniforms": "https://kpnpamerica.com/shop?category=pcol_01KJD7GR1PTGEF00MV9WTMZ31E",
  "training": "https://kpnpamerica.com/shop?category=pcol_01KJFX32331BTXYSCQ9WW450VZ",
};

async function scrapeWithFirecrawl(url: string): Promise<string> {
  const apiKey = Deno.env.get("FIRECRAWL_API_KEY");
  if (!apiKey) throw new Error("FIRECRAWL_API_KEY not configured");

  const response = await fetch("https://api.firecrawl.dev/v1/scrape", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      url,
      formats: ["markdown"],
      onlyMainContent: false,
    }),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(`Firecrawl error: ${data.error || response.status}`);
  }

  return data.data?.markdown || data.markdown || "";
}

function normalizeVariantValue(value: unknown): string {
  const raw = String(value ?? "").trim();
  if (!raw) return "";

  const eSock = raw.match(/#\s*(\d+)\s*[-–]?\s*US\s*Size\s*(\d+)/i);
  if (eSock) return `#${eSock[1]}-US${eSock[2]}`;

  const compactESock = raw.match(/^#(\d+)-US(\d+)$/i);
  if (compactESock) return `#${compactESock[1]}-US${compactESock[2]}`;

  const numeric = raw.match(/^\d+(?:\.\d+)?$/);
  if (numeric) return numeric[0];

  const xsxl = raw.match(/^(XS|S|M|L|XL|2XL|3XL|XXL)$/i);
  if (xsxl) return xsxl[1].toUpperCase();

  return raw;
}

async function scrapeVerifiedInStockVariants(url: string): Promise<{ sizes?: string[]; colors?: string[] } | null> {
  const apiKey = Deno.env.get("FIRECRAWL_API_KEY");
  if (!apiKey) return null;

  const response = await fetch("https://api.firecrawl.dev/v1/scrape", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      url,
      formats: [
        {
          type: "json",
          prompt:
            "Extract ONLY currently selectable (in-stock) variant values from this product page. Return JSON with keys: sizes (array of strings), colors (array of strings), has_variant_stock_data (boolean). Exclude out-of-stock/disabled options. If unknown, return has_variant_stock_data=false and empty arrays.",
        },
      ],
      onlyMainContent: false,
    }),
  });

  const data = await response.json();
  if (!response.ok) return null;

  const parsed = data.data?.json || data.json;
  if (!parsed || parsed.has_variant_stock_data !== true) return null;

  const rawSizes = Array.isArray(parsed.sizes) ? parsed.sizes : [];
  const rawColors = Array.isArray(parsed.colors) ? parsed.colors : [];

  const sizes = [...new Set(rawSizes.map(normalizeVariantValue).filter(Boolean))];
  const colors = [...new Set(rawColors.map(normalizeVariantValue).filter(Boolean))];

  if (sizes.length === 0 && colors.length === 0) return null;

  return {
    sizes: sizes.length > 0 ? sizes : undefined,
    colors: colors.length > 0 ? colors : undefined,
  };
}

// Parse available variants from product page markdown
function parseVariantsFromProductPage(markdown: string): { sizes?: string[]; colors?: string[] } | null {
  const lower = markdown.toLowerCase();
  const cutoffMarkers = ["you may also like", "### customer feedback", "##### connect"];
  let mainContent = markdown;
  let mainLower = lower;
  for (const marker of cutoffMarkers) {
    const idx = mainLower.indexOf(marker);
    if (idx > 0) {
      mainContent = mainContent.substring(0, idx);
      mainLower = mainLower.substring(0, idx);
    }
  }

  // Look for "Size" or "Sizes" header followed by variant options
  // Pattern: "Size\n\n#1 - US Size 4#2 - US Size 5..." or "Sizes\n\n140150160170180190"
  const sizeHeaderMatch = mainContent.match(/(?:^|\n)\s*Sizes?\s*\n+([^\n]+)/i);
  if (!sizeHeaderMatch) return null;

  const variantLine = sizeHeaderMatch[1].trim();
  if (!variantLine) return null;

  // Detect combined size+color variants like "Size #0 - BlueSize #0 - RedSize #1 - Blue..."
  const combinedMatches = [...variantLine.matchAll(/Size\s*#?(\d+)\s*-\s*(\w+)/gi)];
  if (combinedMatches.length > 0) {
    const sizes = new Set<string>();
    const colors = new Set<string>();
    for (const m of combinedMatches) {
      sizes.add(m[1]);
      colors.add(m[2]);
    }
    return {
      sizes: [...sizes].sort((a, b) => parseInt(a) - parseInt(b)),
      colors: [...colors],
    };
  }

  // Detect "#N - US Size X" format (electronic socks)
  const eSockMatches = [...variantLine.matchAll(/#(\d+)\s*-\s*US\s*Size\s*(\d+)/gi)];
  if (eSockMatches.length > 0) {
    return {
      sizes: eSockMatches.map((m) => `#${m[1]}-US${m[2]}`),
    };
  }

  // Detect XS/S/M/L/XL style sizes, even when embedded in descriptive text
  const sizeOrder = ["XS", "S", "M", "L", "XL", "2XL", "XXL", "3XL"];
  const xsxlTokens = [...variantLine.matchAll(/\b(3XL|2XL|XXL|XL|XS|S|M|L)\b/gi)]
    .map((m) => m[1].toUpperCase());
  if (xsxlTokens.length > 0) {
    const uniqueOrdered = [...new Set(xsxlTokens)]
      .sort((a, b) => sizeOrder.indexOf(a) - sizeOrder.indexOf(b));
    if (uniqueOrdered.length > 0) return { sizes: uniqueOrdered };
  }

  // Detect tightly-concatenated XS/S/M/L/XL strings (legacy formatting)
  const xsxlMatch = variantLine.match(/^((?:(?:XS|S|M|L|XL|2XL|3XL|XXL))+)$/i);
  if (xsxlMatch) {
    const raw = xsxlMatch[1];
    const found: string[] = [];
    let remaining = raw;
    for (const s of ["3XL", "XXL", "2XL", "XL", "XS", "S", "M", "L"]) {
      while (remaining.toUpperCase().includes(s)) {
        found.push(s);
        const idx = remaining.toUpperCase().indexOf(s);
        remaining = remaining.substring(0, idx) + remaining.substring(idx + s.length);
      }
    }
    const uniqueOrdered = [...new Set(found)]
      .sort((a, b) => sizeOrder.indexOf(a) - sizeOrder.indexOf(b));
    if (uniqueOrdered.length > 0) return { sizes: uniqueOrdered };
  }

  // Detect numeric sizes (e.g. "140150160170180190" or "12345")
  const numericMatch = variantLine.match(/^(\d+)$/);
  if (numericMatch) {
    const raw = numericMatch[1];
    const threeDigit = raw.match(/\d{3}/g);
    if (threeDigit && threeDigit.length > 1) {
      return { sizes: threeDigit };
    }
    const oneDigit = raw.split("").filter((c) => c >= "1" && c <= "9");
    if (oneDigit.length > 0) {
      return { sizes: oneDigit };
    }
  }

  // Detect belt sizes (e.g. "180cm200cm220cm...")
  const beltMatches = [...variantLine.matchAll(/(\d{3})cm/gi)];
  if (beltMatches.length > 0) {
    return { sizes: beltMatches.map((m) => m[1]) };
  }

  // Detect shoe sizes only when line looks like a list of numeric sizes
  const likelyShoeLine = /^(?:\s*\d+(?:\.\d)?\s*){3,}$/.test(variantLine.replace(/[,/]/g, " "));
  if (likelyShoeLine) {
    const shoeMatches = [...variantLine.matchAll(/(\d+(?:\.\d)?)/g)];
    if (shoeMatches.length >= 3) {
      return { sizes: shoeMatches.map((m) => m[1]) };
    }
  }

  return null;
}

// Parse stock status from individual product page markdown
function parseStockFromProductPage(markdown: string): string | null {
  const lower = markdown.toLowerCase();

  const cutoffMarkers = ["you may also like", "### customer feedback", "##### connect"];
  let mainContent = lower;
  for (const marker of cutoffMarkers) {
    const idx = mainContent.indexOf(marker);
    if (idx > 0) {
      mainContent = mainContent.substring(0, idx);
    }
  }

  const hasProductContent =
    mainContent.includes("add to bag") ||
    mainContent.includes("add to cart") ||
    mainContent.includes("in stock") ||
    mainContent.includes("out of stock") ||
    mainContent.includes("sold out") ||
    mainContent.includes("unavailable");
  if (!hasProductContent) return null;

  const hasStockCount = /(\d+)(\+?)\s+in stock/.test(mainContent);
  const hasAddToBag = /\badd to bag\b|\badd to cart\b/.test(mainContent);
  const hasInStockText = /\bin stock\b/.test(mainContent);

  const hasHardOutOfStock =
    /currently\s+out\s+of\s+stock/.test(mainContent) ||
    /this\s+product\s+is\s+out\s+of\s+stock/.test(mainContent) ||
    /\bsold out\b/.test(mainContent) ||
    /\bunavailable\b/.test(mainContent) ||
    /notify me when available/.test(mainContent);

  // Strong positive signals always win.
  if (hasStockCount) return "in_stock";
  if (hasAddToBag) return "in_stock";

  if (hasHardOutOfStock) return "out_of_stock";
  if (hasInStockText) return "in_stock";

  return null;
}

function parseStockCountFromProductPage(markdown: string): { count: number; hasPlus: boolean } | null {
  const lower = markdown.toLowerCase();
  const cutoffMarkers = ["you may also like", "### customer feedback", "##### connect"];

  let mainContent = lower;
  for (const marker of cutoffMarkers) {
    const idx = mainContent.indexOf(marker);
    if (idx > 0) {
      mainContent = mainContent.substring(0, idx);
    }
  }

  const stockMatch = mainContent.match(/(\d+)(\+?)\s+in stock/);
  if (!stockMatch) return null;

  return {
    count: parseInt(stockMatch[1], 10),
    hasPlus: stockMatch[2] === "+",
  };
}

function countVariantOptions(variants: { sizes?: string[]; colors?: string[] } | null | undefined): number {
  if (!variants) return 0;
  const sizesCount = variants.sizes?.length ?? 0;
  const colorsCount = variants.colors?.length ?? 0;
  return Math.max(sizesCount, colorsCount);
}

function chooseSafestInStockVariants(
  parsedVariants: { sizes?: string[]; colors?: string[] } | null,
  verifiedVariants: { sizes?: string[]; colors?: string[] } | null,
  stockCount: { count: number; hasPlus: boolean } | null,
): { sizes?: string[]; colors?: string[] } | null {
  if (!parsedVariants) return verifiedVariants;
  if (!verifiedVariants) return parsedVariants;

  const parsedCount = countVariantOptions(parsedVariants);
  const verifiedCount = countVariantOptions(verifiedVariants);

  if (parsedCount === 0) return verifiedVariants;
  if (verifiedCount === 0) return parsedVariants;

  // Avoid shrinking available sizes/colors unless we have hard stock evidence.
  if (verifiedCount < parsedCount) {
    if (!stockCount) return parsedVariants;
    if (stockCount.hasPlus) return parsedVariants;
    if (stockCount.count >= parsedCount) return parsedVariants;
    if (verifiedCount > stockCount.count) return parsedVariants;
  }

  return verifiedCount >= parsedCount ? verifiedVariants : parsedVariants;
}

async function scrapeProductDetails(
  products: ParsedProduct[]
): Promise<Map<string, { status: string | null; variants: { sizes?: string[]; colors?: string[] } | null }>> {
  const resultMap = new Map<string, { status: string | null; variants: { sizes?: string[]; colors?: string[] } | null }>();
  const productsWithUrls = products.filter((p) => p.source_url);

  console.log(`Scraping details for ${productsWithUrls.length} products...`);

  const BATCH_SIZE = 3;
  for (let i = 0; i < productsWithUrls.length; i += BATCH_SIZE) {
    const batch = productsWithUrls.slice(i, i + BATCH_SIZE);

    const results = await Promise.allSettled(
      batch.map(async (product) => {
        try {
          console.log(`Scraping: ${product.name} (${product.source_url})`);
          const markdown = await scrapeWithFirecrawl(product.source_url);
          const status = parseStockFromProductPage(markdown);
          const stockCount = parseStockCountFromProductPage(markdown);
          const parsedVariants = parseVariantsFromProductPage(markdown);

          let variants = parsedVariants;

          if (status === "out_of_stock") {
            variants = null;
          } else if (status === "in_stock") {
            const verifiedVariants = await scrapeVerifiedInStockVariants(product.source_url);
            variants = chooseSafestInStockVariants(parsedVariants, verifiedVariants, stockCount);
          } else {
            // If status is uncertain, preserve parsed variants instead of dropping options.
            variants = parsedVariants ?? null;
          }

          console.log(`  → ${product.name}: stock=${status ?? "no data"}, variants=${variants ? JSON.stringify(variants) : "none"}`);
          return { id: product.id, status, variants };
        } catch (error) {
          console.error(`  → ${product.name}: scrape failed`);
          return { id: product.id, status: null, variants: null };
        }
      })
    );

    for (const result of results) {
      if (result.status === "fulfilled") {
        resultMap.set(result.value.id, { status: result.value.status, variants: result.value.variants });
      }
    }

    if (i + BATCH_SIZE < productsWithUrls.length) {
      await new Promise((r) => setTimeout(r, 1000));
    }
  }

  return resultMap;
}

async function scrapeAllProducts(): Promise<ParsedProduct[]> {
  const productMap = new Map<string, ParsedProduct>();

  // Scrape main shop page
  console.log("Scraping main shop page...");
  const mainMarkdown = await scrapeWithFirecrawl("https://kpnpamerica.com/shop");
  const mainProducts = parseProductsFromMarkdown(mainMarkdown);
  console.log(`Found ${mainProducts.length} products on main page`);

  for (const p of mainProducts) {
    productMap.set(p.id, p);
  }

  // Scrape each category page for better classification
  for (const [category, url] of Object.entries(CATEGORY_URLS)) {
    try {
      console.log(`Scraping category: ${category}...`);
      const catMarkdown = await scrapeWithFirecrawl(url);
      const catProducts = parseProductsFromMarkdown(catMarkdown);
      console.log(`Found ${catProducts.length} products in ${category}`);

      for (const p of catProducts) {
        if (productMap.has(p.id)) {
          productMap.get(p.id)!.category = category;
        } else {
          p.category = category;
          productMap.set(p.id, p);
        }
      }
    } catch (error) {
      console.error(`Error scraping category ${category}:`, error);
    }
  }

  const allProducts = [...productMap.values()];

  // Now scrape individual product pages for stock status + variants
  const detailsMap = await scrapeProductDetails(allProducts);

  // Apply stock status and variants
  for (const product of allProducts) {
    const details = detailsMap.get(product.id);
    if (details?.status) {
      product.stock_status = details.status;
    }
    if (details?.variants) {
      product.available_variants = details.variants;
    }

    if (product.stock_status === "out_of_stock") {
      if (!product.badge || product.badge === "bestseller") {
        product.badge = "sold-out";
        product.badge_text = "Sold Out";
      }
    } else if (product.stock_status === "in_stock") {
      // Keep UI consistent: in-stock items must not carry sold-out state.
      if (product.badge === "sold-out") {
        product.badge = null;
        product.badge_text = null;
      }
      // Paid items should be purchasable when in stock.
      if (product.price > 0 && product.badge === "coming-soon") {
        product.badge = null;
        product.badge_text = null;
      }
    }
  }

  return allProducts;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  // Authenticate: require admin JWT or shared secret
  const syncSecret = Deno.env.get("SYNC_SECRET");
  const headerSecret = req.headers.get("x-sync-secret");
  const authHeader = req.headers.get("Authorization");

  let isAuthorized = false;

  // Check shared secret
  if (syncSecret && headerSecret === syncSecret) {
    isAuthorized = true;
  }

  // Check admin JWT
  if (!isAuthorized && authHeader) {
    try {
      const supabaseAuth = createClient(
        Deno.env.get("SUPABASE_URL") ?? "",
        Deno.env.get("SUPABASE_ANON_KEY") ?? ""
      );
      const token = authHeader.replace("Bearer ", "");
      const { data: { user }, error } = await supabaseAuth.auth.getUser(token);
      if (!error && user?.email === "admin@kpnpamerica.com") {
        isAuthorized = true;
      }
    } catch { /* not authorized */ }
  }

  if (!isAuthorized) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    console.log("Starting product sync from KPNPAmerica.com via Firecrawl...");
    const products = await scrapeAllProducts();
    console.log(`Scraped ${products.length} total products`);

    if (products.length === 0) {
      return new Response(
        JSON.stringify({ success: false, error: "No products found", count: 0 }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const nowIso = new Date().toISOString();

    const sourceUrls = [...new Set(products.map((p) => p.source_url).filter(Boolean))] as string[];
    let existingRows: { id: string; source_url: string | null; created_at: string }[] = [];

    if (sourceUrls.length > 0) {
      const { data, error: existingRowsError } = await supabase
        .from("products")
        .select("id, source_url, created_at")
        .in("source_url", sourceUrls)
        .order("created_at", { ascending: true });

      if (existingRowsError) {
        console.error("Failed to load existing products for ID reconciliation:", existingRowsError);
        return new Response(
          JSON.stringify({ success: false, error: existingRowsError.message }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      existingRows = (data ?? []) as { id: string; source_url: string | null; created_at: string }[];
    }

    const canonicalIdByUrl = new Map<string, string>();
    for (const row of existingRows) {
      if (!row.source_url) continue;
      if (!canonicalIdByUrl.has(row.source_url)) {
        canonicalIdByUrl.set(row.source_url, row.id);
      }
    }

    for (const product of products) {
      if (!product.source_url) continue;
      const canonicalId = canonicalIdByUrl.get(product.source_url);
      if (canonicalId && canonicalId !== product.id) {
        product.id = canonicalId;
      }
    }

    const duplicateIdsToDelete = existingRows
      .filter((row) => row.source_url && canonicalIdByUrl.get(row.source_url) !== row.id)
      .map((row) => row.id);

    const { error } = await supabase.from("products").upsert(
      products.map((p) => ({
        ...p,
        updated_at: nowIso,
        last_synced_at: nowIso,
      })),
      { onConflict: "id" }
    );

    if (error) {
      console.error("DB upsert error:", error);
      return new Response(
        JSON.stringify({ success: false, error: error.message }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (duplicateIdsToDelete.length > 0) {
      const { error: deleteError } = await supabase.from("products").delete().in("id", duplicateIdsToDelete);
      if (deleteError) {
        console.error("Failed to delete duplicate product IDs:", deleteError);
      } else {
        console.log(`Deleted ${duplicateIdsToDelete.length} duplicate product rows after ID reconciliation`);
      }
    }

    // Intentionally skip force-marking unsynced products as out_of_stock.
    // Parser misses on source pages can otherwise incorrectly zero the whole catalog.
    console.log("Skipped stale auto-out_of_stock safeguard to prevent false negatives");

    const outOfStock = products.filter((p) => p.stock_status === "out_of_stock");
    console.log(`Successfully synced ${products.length} products (${outOfStock.length} out of stock)`);

    return new Response(
      JSON.stringify({
        success: true,
        count: products.length,
        out_of_stock_count: outOfStock.length,
        products: products.map((p) => ({
          id: p.id,
          name: p.name,
          category: p.category,
          price: p.price,
          stock_status: p.stock_status,
        })),
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Sync error:", error);
    return new Response(
      JSON.stringify({ success: false, error: "Sync failed. Please try again." }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
