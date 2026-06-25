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
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // --- Key validation ---
    const secretKey = (Deno.env.get("STRIPE_SECRET_KEY") || "").trim();
    const publishableKey = (Deno.env.get("STRIPE_PUBLISHABLE_KEY") || "").trim();

    if (!secretKey || !publishableKey) {
      console.error("Missing Stripe keys configuration");
      return new Response(
        JSON.stringify({ error: "Payment configuration error — contact support." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const validSecretPrefixes = ["sk_live_", "sk_test_", "rk_live_", "rk_test_"];
    const validPublishablePrefixes = ["pk_live_", "pk_test_"];

    if (!validSecretPrefixes.some((p) => secretKey.startsWith(p)) ||
        !validPublishablePrefixes.some((p) => publishableKey.startsWith(p))) {
      console.error("Invalid Stripe key prefix detected");
      return new Response(
        JSON.stringify({ error: "Payment configuration error — contact support." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check test/live mode mismatch
    const secretIsLive = secretKey.startsWith("sk_live_") || secretKey.startsWith("rk_live_");
    const publishableIsLive = publishableKey.startsWith("pk_live_");
    if (secretIsLive !== publishableIsLive) {
      return new Response(
        JSON.stringify({
          error: `Stripe key mode mismatch: secret key is ${secretIsLive ? "live" : "test"} but publishable key is ${publishableIsLive ? "live" : "test"}. Both must use the same mode.`,
        }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { items, customerEmail, customerName, shippingAddress, couponCode } = (await req.json()) as {
      items: CartItem[];
      customerEmail?: string;
      customerName?: string;
      couponCode?: string;
      shippingAddress?: {
        line1?: string;
        line2?: string;
        city?: string;
        state?: string;
        postal_code?: string;
        country?: string;
      };
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
    if (productNames.length > 0) {
      const { data: dbByName } = await supabaseAdmin
        .from("products")
        .select("id, name, price")
        .in("name", productNames);
      if (dbByName) {
        for (const p of dbByName) {
          if (!priceMap[p.id]) priceMap[p.id] = p.price;
          priceMap[`name:${p.name}`] = p.price;
        }
      }
    }

    // Use DB prices where available
    const validatedItems = items.map((item) => {
      const dbPrice = priceMap[item.id] ?? priceMap[`name:${item.name}`];
      if (dbPrice !== undefined && Math.abs(dbPrice - item.price) > 0.01) {
        console.warn(`Price mismatch for ${item.name}: client=${item.price}, db=${dbPrice}`);
      }
      return {
        ...item,
        price: dbPrice !== undefined ? dbPrice : item.price,
      };
    });

    const stripe = new Stripe(secretKey, {
      apiVersion: "2025-08-27.basil",
    });

    // Calculate subtotal with validated prices
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

    const shippingCents = tier.rate;

    // Apply coupon discount
    let discountPercentOff: number | undefined;
    let discountAmountOff: number | undefined;
    let discountedSubtotal = subtotal;

    if (couponCode) {
      try {
        const coupons = await stripe.coupons.list({ limit: 100 });
        const matchedCoupon = coupons.data.find(
          (c) => c.name?.toUpperCase() === couponCode.toUpperCase() && c.valid
        );

        if (!matchedCoupon) {
          return new Response(
            JSON.stringify({ error: "Invalid or expired discount code" }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        if (matchedCoupon.percent_off) {
          discountPercentOff = matchedCoupon.percent_off;
          discountedSubtotal = subtotal * (1 - matchedCoupon.percent_off / 100);
        } else if (matchedCoupon.amount_off) {
          discountAmountOff = matchedCoupon.amount_off;
          discountedSubtotal = Math.max(0, subtotal - matchedCoupon.amount_off / 100);
        }
      } catch (err) {
        console.error("Coupon lookup error:", err);
        return new Response(
          JSON.stringify({ error: "Invalid discount code" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

    // Sales tax 8.875%
    const taxableAmountCents = Math.round(discountedSubtotal * 100);
    const taxCents = Math.round(taxableAmountCents * 0.08875);
    const totalCents = taxableAmountCents + shippingCents + taxCents;

    // Build description from validated items
    const description = validatedItems
      .map((i) => {
        const parts = [i.name];
        if (i.selectedSize) parts.push(`Size: ${i.selectedSize}`);
        if (i.selectedColor) parts.push(`Color: ${i.selectedColor}`);
        return `${parts.join(" | ")} x${i.quantity}`;
      })
      .join("; ");

    // Check for existing Stripe customer
    let customerId: string | undefined;
    if (customerEmail) {
      const customers = await stripe.customers.list({ email: customerEmail, limit: 1 });
      if (customers.data.length > 0) {
        customerId = customers.data[0].id;
      } else {
        const customer = await stripe.customers.create({ email: customerEmail });
        customerId = customer.id;
      }
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount: totalCents,
      currency: "usd",
      ...(customerId ? { customer: customerId } : {}),
      description,
      ...(shippingAddress ? {
        shipping: {
          name: customerName || customerEmail || "Customer",
          address: {
            line1: shippingAddress.line1 || "",
            line2: shippingAddress.line2 || "",
            city: shippingAddress.city || "",
            state: shippingAddress.state || "",
            postal_code: shippingAddress.postal_code || "",
            country: shippingAddress.country || "US",
          },
        },
      } : {}),
      metadata: {
        items: JSON.stringify(validatedItems.map((i) => ({ name: i.name, qty: i.quantity, price: i.price }))),
        shipping_cents: String(shippingCents),
        customer_name: customerName || "",
        customer_email: customerEmail || "",
        shipping_line1: shippingAddress?.line1 || "",
        shipping_line2: shippingAddress?.line2 || "",
        shipping_city: shippingAddress?.city || "",
        shipping_state: shippingAddress?.state || "",
        shipping_zip: shippingAddress?.postal_code || "",
        shipping_country: shippingAddress?.country || "US",
      },
      automatic_payment_methods: { enabled: true },
    });

    return new Response(
      JSON.stringify({
        clientSecret: paymentIntent.client_secret,
        publishableKey,
        amount: totalCents,
        shippingCents,
        taxCents,
        discountPercentOff: discountPercentOff || null,
        discountAmountOff: discountAmountOff || null,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
    );
  } catch (error) {
    console.error("PaymentIntent error:", error);
    return new Response(
      JSON.stringify({ error: "An error occurred processing your payment. Please try again." }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
