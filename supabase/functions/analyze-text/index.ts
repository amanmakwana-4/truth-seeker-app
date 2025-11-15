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
          role: 'system',
          content: `You are a Fake News Classification System. Your job is to analyze text and determine whether it is likely fake or authentic.

Follow these rules:
1. Do NOT treat future dates as indicators of fake news. Future dates in news articles are normal for announcements, scheduled launches, or upcoming events.
2. Focus only on evidence-based signals:
   - Source credibility
   - Presence or absence of verifiable details
   - Unsupported scientific or political claims
   - Sensational or conspiracy-based wording
   - Anonymous or unverifiable experts
   - Logical consistency
3. A news article is NOT fake simply because:
   - The event date is in the future
   - It hasn't happened yet
   - It reports on announcements or scheduled events

Your output must classify the text as "fake" or "authentic".
Respond with JSON only: {"prediction": "fake"|"authentic", "confidence": 0.0-1.0, "explanation": "brief factual explanation based on linguistic/content cues only"}`
        },
        {
          role: 'user',
          content: `Analyze this text:\n\n${text.substring(0, 2000)}`
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