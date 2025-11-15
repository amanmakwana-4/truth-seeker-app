import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

  try {
    const { text } = await req.json();
    const startTime = Date.now();

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('LOVABLE_API_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [{
          role: 'user',
          content: `Analyze if this text is fake news or authentic. Respond with JSON: {"prediction": "fake"|"authentic"|"uncertain", "confidence": 0.0-1.0, "explanation": "brief reason"}. Text: ${text.substring(0, 2000)}`
        }],
      }),
    });

    const data = await response.json();
    const content = data.choices[0].message.content;
    const result = JSON.parse(content.match(/\{.*\}/s)?.[0] || '{"prediction":"uncertain","confidence":0.5}');

    return new Response(JSON.stringify({
      prediction: result.prediction,
      confidenceScore: result.confidence,
      modelVersion: 'v1.0',
      processingTime: Date.now() - startTime,
      explanation: result.explanation
    }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  } catch (error) {
    console.error('Analysis error:', error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : 'An unknown error occurred' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});