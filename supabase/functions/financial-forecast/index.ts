import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { monthlyData, categoryBreakdown } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const systemPrompt = `You are a financial forecasting AI. Given historical monthly financial data, produce accurate forecasts.

You MUST respond using the suggest_forecast tool. Analyze trends, seasonality, and growth patterns to generate predictions.

Rules:
- Forecast the next 4 months
- Include confidence intervals (upper/lower bounds)
- Base predictions on actual trends in the data
- Generate specific actionable insights about the forecast`;

    const userPrompt = `Historical monthly data: ${JSON.stringify(monthlyData)}
Category breakdown: ${JSON.stringify(categoryBreakdown)}

Forecast the next 4 months of revenue with confidence intervals and provide insights.`;

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
            name: "suggest_forecast",
            description: "Return revenue forecast for next 4 months with confidence intervals",
            parameters: {
              type: "object",
              properties: {
                forecasts: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      month: { type: "string" },
                      forecast: { type: "number" },
                      upperBound: { type: "number" },
                      lowerBound: { type: "number" },
                    },
                    required: ["month", "forecast", "upperBound", "lowerBound"],
                    additionalProperties: false,
                  },
                },
                insights: {
                  type: "array",
                  items: { type: "string" },
                },
                growthRate: { type: "number" },
                confidence: { type: "number" },
              },
              required: ["forecasts", "insights", "growthRate", "confidence"],
              additionalProperties: false,
            },
          },
        }],
        tool_choice: { type: "function", function: { name: "suggest_forecast" } },
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
      const t = await response.text();
      console.error("AI error:", status, t);
      throw new Error("AI service error");
    }

    const result = await response.json();
    const toolCall = result.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall) throw new Error("No forecast generated");

    const forecastData = JSON.parse(toolCall.function.arguments);

    return new Response(JSON.stringify(forecastData), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("forecast error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
