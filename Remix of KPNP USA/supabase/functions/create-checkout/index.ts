import Stripe from "https://esm.sh/stripe@14.21.0?target=denonext";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

type CartItem = {
  id: string;
  name: string;
  price: number;
  quantity: number;
  selectedSize?: string;
  selectedColor?: string;
  image?: string;
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { items, customerEmail } = (await req.json()) as {
      items: CartItem[];
      customerEmail?: string;
    };

    if (!items || items.length === 0) {
      return new Response(
        JSON.stringify({ error: "Cart is empty" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Server-side price validation against the products table
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const productIds = items.map((i) => i.id).filter(Boolean);
    const productNames = items.map((i) => i.name);

    // Look up products by ID first, fall back to name
    let priceMap: Record<string, number> = {};
    if (productIds.length > 0) {
      const { data: dbProducts } = await supabaseAdmin
        .from("products")
        .select("id, name, price")
        .in("id", productIds);
      if (dbProducts) {
        for (const p of dbProducts) {
          priceMap[p.id] = p.price;
        }
      }
    }
    // Also look up by name for items without IDs
    if (productNames.length > 0) {
      const { data: dbByName } = await supabaseAdmin
        .from("products")
        .select("id, name, price")
        .in("name", productNames);
      if (dbByName) {
        for (const p of dbByName) {
          if (!priceMap[p.id]) {
            priceMap[p.id] = p.price;
          }
          // Also map by name for fallback
          priceMap[`name:${p.name}`] = p.price;
        }
      }
    }

    // Validate each item's price against DB
    const validatedItems = items.map((item) => {
      const dbPrice = priceMap[item.id] ?? priceMap[`name:${item.name}`];
      if (dbPrice !== undefined && Math.abs(dbPrice - item.price) > 0.01) {
        console.warn(`Price mismatch for ${item.name}: client=${item.price}, db=${dbPrice}`);
      }
      // Use DB price if available, otherwise use client price (for items not in DB)
      return {
        ...item,
        price: dbPrice !== undefined ? dbPrice : item.price,
      };
    });

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2025-08-27.basil",
    });

    // Build line items with validated prices
    const lineItems = validatedItems.map((item) => {
      const variantParts: string[] = [];
      if (item.selectedSize) variantParts.push(`Size: ${item.selectedSize}`);
      if (item.selectedColor) variantParts.push(`Color: ${item.selectedColor}`);
      const description = variantParts.length > 0 ? variantParts.join(" | ") : undefined;

      return {
        price_data: {
          currency: "usd",
          product_data: {
            name: item.name,
            ...(description ? { description } : {}),
            ...(item.image ? { images: [item.image] } : {}),
          },
          unit_amount: Math.round(item.price * 100),
        },
        quantity: item.quantity,
      };
    });

    const origin = req.headers.get("origin") || "https://kpnpamerica.com";

    // Calculate cart subtotal with validated prices
    const subtotal = validatedItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

    // Shipping tiers
    const shippingTiers = [
      { min: 0, max: 150, rate: 1293 },
      { min: 150, max: 595, rate: 2395 },
      { min: 596, max: 800, rate: 3340 },
      { min: 800, max: 1200, rate: 6450 },
      { min: 1200, max: 2800, rate: 8850 },
      { min: 2800, max: 4000, rate: 12550 },
      { min: 4000, max: 99999, rate: 16500 },
    ];

    const tier = shippingTiers.find((t) => subtotal >= t.min && subtotal < t.max)
      || shippingTiers[shippingTiers.length - 1];

    const shippingRate = await stripe.shippingRates.create({
      display_name: "Shipping & Handling",
      type: "fixed_amount",
      fixed_amount: { amount: tier.rate, currency: "usd" },
    });

    const sessionParams: Stripe.Checkout.SessionCreateParams = {
      line_items: lineItems,
      mode: "payment",
      success_url: `${origin}/checkout-success`,
      cancel_url: `${origin}/`,
      shipping_address_collection: {
        allowed_countries: ["US"],
      },
      shipping_options: [
        { shipping_rate: shippingRate.id },
      ],
    };

    if (customerEmail) {
      sessionParams.customer_email = customerEmail;
    }

    const session = await stripe.checkout.sessions.create(sessionParams);

    return new Response(
      JSON.stringify({ url: session.url }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
    );
  } catch (error) {
    console.error("Checkout error:", error);
    return new Response(
      JSON.stringify({ error: "An error occurred during checkout. Please try again." }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
