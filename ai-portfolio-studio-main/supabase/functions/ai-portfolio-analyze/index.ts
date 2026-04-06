import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { fullName, bio, skills, education, projects, email, linkedin, github } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const prompt = `Analyze this portfolio and provide detailed scoring and feedback.

Portfolio data:
- Name: ${fullName || "Not provided"}
- Bio: ${bio || "Not provided"}
- Skills: ${(skills || []).join(", ") || "None"}
- Education: ${(education || []).map((e: any) => `${e.degree} at ${e.institution} (${e.year})`).join("; ") || "None"}
- Projects: ${(projects || []).map((p: any) => `${p.title}: ${p.description} [${(p.tech || []).join(", ")}]`).join("; ") || "None"}
- Email: ${email ? "Provided" : "Missing"}
- LinkedIn: ${linkedin ? "Provided" : "Missing"}
- GitHub: ${github ? "Provided" : "Missing"}

Score each aspect honestly from 1-10. Be specific and actionable in feedback.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: "You are an expert career advisor and ATS specialist who analyzes portfolios." },
          { role: "user", content: prompt },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "portfolio_analysis",
              description: "Return a structured portfolio analysis with scores and feedback.",
              parameters: {
                type: "object",
                properties: {
                  overallScore: { type: "number", description: "Overall portfolio score 1-10" },
                  atsScore: { type: "number", description: "ATS compatibility score 1-10" },
                  strengths: {
                    type: "array",
                    items: { type: "string" },
                    description: "3-5 specific strengths of the portfolio",
                  },
                  weaknesses: {
                    type: "array",
                    items: { type: "string" },
                    description: "3-5 specific weaknesses or gaps",
                  },
                  improvements: {
                    type: "array",
                    items: { type: "string" },
                    description: "4-6 actionable improvement suggestions",
                  },
                  categories: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        name: { type: "string" },
                        score: { type: "number" },
                      },
                      required: ["name", "score"],
                      additionalProperties: false,
                    },
                    description: "Scores for: Content Quality, Technical Skills, Project Showcase, Professional Presence, Completeness, Visual Appeal",
                  },
                },
                required: ["overallScore", "atsScore", "strengths", "weaknesses", "improvements", "categories"],
                additionalProperties: false,
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "portfolio_analysis" } },
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
    console.error("portfolio-analyze error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
