import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { monthlyData, categoryBreakdown, rawSample } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const systemPrompt = `You are an AI anomaly detection system for financial data. Analyze the provided financial data and detect anomalies, unusual patterns, and risks.

You MUST respond using the detect_anomalies tool. Look for:
- Unusual spikes or drops in revenue/expenses
- Category spending outliers
- Month-over-month volatility
- Concentration risks
- Suspicious patterns

Generate realistic, data-grounded anomalies with specific numbers from the data.`;

    const userPrompt = `Monthly data: ${JSON.stringify(monthlyData)}
Category breakdown: ${JSON.stringify(categoryBreakdown)}
${rawSample ? `Sample transactions: ${JSON.stringify(rawSample.slice(0, 20))}` : ''}

Detect anomalies and unusual patterns in this financial data.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        tools: [{
          type: "function",
          function: {
            name: "detect_anomalies",
            description: "Return detected financial anomalies",
            parameters: {
              type: "object",
              properties: {
                anomalies: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      severity: { type: "string", enum: ["high", "medium", "low"] },
                      title: { type: "string" },
                      description: { type: "string" },
                      category: { type: "string" },
                      date: { type: "string" },
                      confidence: { type: "number" },
                      recommendation: { type: "string" },
                      amount: { type: "number" },
                    },
                    required: ["severity", "title", "description", "category", "confidence", "recommendation"],
                    additionalProperties: false,
                  },
                },
                riskScore: { type: "number" },
                summary: { type: "string" },
              },
              required: ["anomalies", "riskScore", "summary"],
              additionalProperties: false,
            },
          },
        }],
        tool_choice: { type: "function", function: { name: "detect_anomalies" } },
      }),
    });

    if (!response.ok) {
      const status = response.status;
      if (status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded" }), { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }
      if (status === 402) {
        return new Response(JSON.stringify({ error: "Payment required" }), { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }
      throw new Error("AI service error");
    }

    const result = await response.json();
    const toolCall = result.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall) throw new Error("No anomalies generated");

    const anomalyData = JSON.parse(toolCall.function.arguments);

    return new Response(JSON.stringify(anomalyData), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("anomaly error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
