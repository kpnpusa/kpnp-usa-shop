import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const MAX_MESSAGES = 20;
const MAX_CONTENT_LENGTH = 2000;

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { messages, conversationId, sessionToken } = await req.json();

    if (!Array.isArray(messages) || messages.length === 0) {
      return new Response(JSON.stringify({ error: "Invalid messages" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const cappedMessages = messages.slice(-MAX_MESSAGES);
    const sanitizedMessages = cappedMessages
      .filter((m: any) => m.role === "user" || m.role === "assistant")
      .map((m: any) => ({
        role: m.role,
        content: typeof m.content === "string" ? m.content.slice(0, MAX_CONTENT_LENGTH) : "",
      }));

    if (sanitizedMessages.length === 0) {
      return new Response(JSON.stringify({ error: "No valid messages" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          {
            role: "system",
            content: `You are the KPNP USA customer support assistant. You help customers with questions about KPNP taekwondo equipment, scoring systems, rentals, apparel, and orders.

Key info about KPNP USA:
- Official KPNP USA distributor for taekwondo electronic scoring systems and equipment
- Contact: info@kpnpamerica.com | 1-585-570-KPNP (5767)
- Products: Electronic scoring systems, chest protectors, head protectors, electronic socks, receivers, uniforms, tracksuits, target mitts, shoes
- Equipment rental available for tournaments - direct customers to the Rental page at /rental
- Pre-owned equipment available at discounted prices
- Social: Facebook, Instagram, TikTok, Twitter

Be friendly, professional, and concise. If someone asks about rentals, tell them about the rental inquiry form on the Rental page. If they ask about products, help them find what they need from the catalog.`
          },
          ...sanitizedMessages,
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Too many requests. Please try again in a moment." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Service temporarily unavailable." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(JSON.stringify({ error: "AI service error" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // If conversationId provided, intercept the stream to collect full response and save it
    if (conversationId && sessionToken && response.body) {
      // Validate ownership before setting up stream that saves messages
      const adminClient = createClient(
        Deno.env.get("SUPABASE_URL") ?? "",
        Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
      );
      const { data: conv } = await adminClient
        .from("conversations")
        .select("session_token")
        .eq("id", conversationId)
        .single();

      const ownsConversation = conv && conv.session_token === sessionToken;

      const reader = response.body.getReader();
      const encoder = new TextEncoder();
      const decoder = new TextDecoder();
      let fullContent = "";

      const stream = new ReadableStream({
        async pull(controller) {
          const { done, value } = await reader.read();
          if (done) {
            controller.close();
            // Save the complete assistant message only if ownership validated
            if (fullContent.trim() && ownsConversation) {
              try {
                await adminClient.from("messages").insert({
                  conversation_id: conversationId,
                  role: "assistant",
                  content: fullContent.trim(),
                });
              } catch (e) {
                console.error("Failed to save assistant message:", e);
              }
            }
            return;
          }

          // Pass through to client
          controller.enqueue(value);

          // Parse SSE to collect content
          const text = decoder.decode(value, { stream: true });
          const lines = text.split("\n");
          for (const line of lines) {
            if (!line.startsWith("data: ")) continue;
            const jsonStr = line.slice(6).trim();
            if (jsonStr === "[DONE]") continue;
            try {
              const parsed = JSON.parse(jsonStr);
              const content = parsed.choices?.[0]?.delta?.content;
              if (content) fullContent += content;
            } catch { /* ignore parse errors in partial chunks */ }
          }
        },
      });

      return new Response(stream, {
        headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
      });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("chat error:", e);
    return new Response(JSON.stringify({ error: "An error occurred. Please try again." }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
