import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const { fullName, bio, skills, education, projects, email, linkedin, github } = await req.json();

    const portfolioSummary = `
Candidate: ${fullName || "Not provided"}
Bio: ${bio || "Not provided"}
Skills: ${(skills || []).join(", ") || "None listed"}
Education: ${(education || []).map((e: any) => `${e.degree} at ${e.institution} (${e.year})`).join("; ") || "None listed"}
Projects: ${(projects || []).map((p: any) => `${p.title}: ${p.description} [Tech: ${(p.tech || []).join(", ")}]`).join("; ") || "None listed"}
Email: ${email || "Not provided"}
LinkedIn: ${linkedin || "Not provided"}
GitHub: ${github || "Not provided"}
    `.trim();

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
            content: "You are a professional technical recruiter at a top tech company. You evaluate developer portfolios with a realistic, industry-focused perspective. Be honest, constructive, and specific.",
          },
          {
            role: "user",
            content: `Analyze the following developer portfolio and provide a detailed recruiter evaluation:\n\n${portfolioSummary}`,
          },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "recruiter_evaluation",
              description: "Provide a structured recruiter evaluation of a developer portfolio.",
              parameters: {
                type: "object",
                properties: {
                  score: {
                    type: "integer",
                    description: "Overall portfolio score from 1 to 10",
                  },
                  decision: {
                    type: "string",
                    enum: ["Selected", "Rejected", "Needs Improvement"],
                    description: "Hiring decision",
                  },
                  summary: {
                    type: "string",
                    description: "A 2-3 sentence executive summary of the candidate",
                  },
                  strengths: {
                    type: "array",
                    items: { type: "string" },
                    description: "3-5 specific strengths of the candidate",
                  },
                  weaknesses: {
                    type: "array",
                    items: { type: "string" },
                    description: "3-5 specific weaknesses or gaps in the portfolio",
                  },
                  suggestions: {
                    type: "array",
                    items: { type: "string" },
                    description: "3-5 actionable suggestions to improve hiring chances",
                  },
                },
                required: ["score", "decision", "summary", "strengths", "weaknesses", "suggestions"],
                additionalProperties: false,
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "recruiter_evaluation" } },
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limited. Please try again in a moment." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Please add funds." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const text = await response.text();
      console.error("AI gateway error:", response.status, text);
      return new Response(JSON.stringify({ error: "AI analysis failed" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await response.json();
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall) {
      return new Response(JSON.stringify({ error: "No analysis returned" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const result = JSON.parse(toolCall.function.arguments);
    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("Recruiter simulation error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
