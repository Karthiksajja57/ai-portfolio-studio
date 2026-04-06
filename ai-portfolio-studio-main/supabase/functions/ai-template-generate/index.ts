import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { description } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const prompt = `The user wants a custom portfolio template with this description:

"${description}"

Based on their description, generate a unique portfolio template configuration. Include:
1. A creative template name
2. A short description of the template style
3. The primary color theme (as an HSL string like "210 80% 55%")
4. 3 relevant tags that describe the template's use case
5. 4 key sections/features that would appear in this template
6. A recommended font pairing (display + body)`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: "You are a world-class UI/UX designer who creates portfolio template configurations. Be creative and specific." },
          { role: "user", content: prompt },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "generate_template",
              description: "Generate a custom portfolio template based on user description.",
              parameters: {
                type: "object",
                properties: {
                  name: { type: "string", description: "Creative template name (1-3 words)" },
                  description: { type: "string", description: "One sentence describing the template aesthetic" },
                  color: { type: "string", description: "Primary HSL color e.g. '210 80% 55%'" },
                  tags: { type: "array", items: { type: "string" }, description: "3 relevant tags" },
                  sections: { type: "array", items: { type: "string" }, description: "4 key sections/features" },
                  fonts: {
                    type: "object",
                    properties: {
                      display: { type: "string", description: "Display/heading font name" },
                      body: { type: "string", description: "Body text font name" },
                    },
                    required: ["display", "body"],
                    additionalProperties: false,
                  },
                },
                required: ["name", "description", "color", "tags", "sections", "fonts"],
                additionalProperties: false,
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "generate_template" } },
      }),
    });

    if (response.status === 429) {
      return new Response(JSON.stringify({ error: "Rate limited. Please try again shortly." }), {
        status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (response.status === 402) {
      return new Response(JSON.stringify({ error: "AI credits exhausted. Please add funds." }), {
        status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (!response.ok) {
      const t = await response.text();
      console.error("AI error:", response.status, t);
      throw new Error("AI gateway error");
    }

    const data = await response.json();
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall) throw new Error("No tool call returned");

    const result = JSON.parse(toolCall.function.arguments);
    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("template-generate error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
