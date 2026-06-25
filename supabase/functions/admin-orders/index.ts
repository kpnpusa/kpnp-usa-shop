import { createClient } from "npm:@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// List of admin emails — add yours here
const ADMIN_EMAILS = ["admin@kpnpamerica.com"];

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? ""
    );

    const authHeader = req.headers.get("Authorization")!;
    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(token);

    if (authError || !user?.email) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!ADMIN_EMAILS.includes(user.email)) {
      return new Response(JSON.stringify({ error: "Forbidden" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Use service role to bypass RLS
    const adminClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const url = new URL(req.url);
    const action = url.searchParams.get("action");

    if (action === "update-status") {
      const { orderId, status } = await req.json();
      const { error } = await adminClient
        .from("orders")
        .update({ status })
        .eq("id", orderId);

      if (error) throw error;

      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (action === "update-tracking") {
      const { orderId, trackingNumber, carrier } = await req.json();
      const { error } = await adminClient
        .from("orders")
        .update({ tracking_number: trackingNumber, carrier: carrier })
        .eq("id", orderId);

      if (error) throw error;

      // Get order to find user_id and send notification
      if (trackingNumber) {
        const { data: order } = await adminClient
          .from("orders")
          .select("user_id, id")
          .eq("id", orderId)
          .single();

        if (order?.user_id) {
          await adminClient.from("notifications").insert({
            user_id: order.user_id,
            order_id: order.id,
            title: "Tracking number added",
            message: `Your order #${order.id.slice(0, 8)} now has a tracking number: ${trackingNumber}`,
            type: "shipping",
          });
        }
      }

      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Default: fetch all orders + profiles
    const [ordersRes, profilesRes] = await Promise.all([
      adminClient.from("orders").select("*").order("created_at", { ascending: false }),
      adminClient.from("profiles").select("user_id, full_name"),
    ]);

    if (ordersRes.error) throw ordersRes.error;

    const profiles: Record<string, string> = {};
    (profilesRes.data || []).forEach((p: any) => {
      profiles[p.user_id] = p.full_name || "Unknown";
    });

    return new Response(
      JSON.stringify({ orders: ordersRes.data, profiles }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Admin orders error:", error);
    return new Response(
      JSON.stringify({ error: "An error occurred. Please try again." }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
