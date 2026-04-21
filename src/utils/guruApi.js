// ─── Guru AI Utility ─────────────────────────────────────────────────────────
// Uses Anthropic API directly from frontend (for local dev).
// In production, route through your FastAPI backend (/api/guru).

const GURU_SYSTEM_PROMPT = `You are a Vidwan — a master of Karnatic and Hindustani classical music with decades of teaching and performance experience. You are warm, precise, and deeply knowledgeable.

When answering:
- For RAGA questions: provide Arohana, Avarohana, Vadi/Samavadi swaras, characteristic Gamakas, time of performance, Rasa (emotional quality), and 1-2 famous compositions
- For TECHNIQUE questions: break into Purvanga (lower tetrachord S-P) and Uttaranga (upper tetrachord P-S)
- Always explain: Sruti (tonic), Laya (tempo), Tala (rhythm cycle), Gamaka (ornaments) when relevant
- Use Sanskrit/Telugu technical terms with brief English explanations in parentheses
- Be encouraging, precise, and deeply knowledgeable
- Structure with labeled sections like "AROHANA:", "AVAROHANA:", "GAMAKAS:", "RASA:", "PRACTICE TIP:"
- Keep responses focused — 150 to 250 words maximum
- Do not use markdown symbols like # or * or - bullets; write in flowing prose with section labels in CAPS followed by a colon`;

export async function askGuru(userMessage, conversationHistory = []) {
  const apiKey = process.env.REACT_APP_ANTHROPIC_API_KEY;

  if (!apiKey) {
    throw new Error('ANTHROPIC_API_KEY not set. Add REACT_APP_ANTHROPIC_API_KEY to your .env file.');
  }

  const messages = [
    ...conversationHistory,
    { role: 'user', content: userMessage },
  ];

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1000,
      system: GURU_SYSTEM_PROMPT,
      messages,
    }),
  });

  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.error?.message || 'API request failed');
  }

  const data = await response.json();
  return data.content.map((b) => b.text || '').join('');
}
