import Groq from 'groq-sdk';

const apiKeys = process.env.GROQ_API_KEYS
  ? process.env.GROQ_API_KEYS.split(',').map((k) => k.trim()).filter(Boolean)
  : [];

const model = process.env.GROQ_MODEL || 'llama-3.3-70b-versatile';

let keyIndex = 0;

function getNextClient() {
  if (apiKeys.length === 0) {
    throw new Error('No GROQ_API_KEYS configured. Please check .env');
  }
  const key = apiKeys[keyIndex];
  keyIndex = (keyIndex + 1) % apiKeys.length;
  return new Groq({ apiKey: key });
}

async function createChatCompletion(systemPrompt, userMessage, options = {}) {
  const client = getNextClient();
  const response = await client.chat.completions.create({
    model,
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userMessage },
    ],
    temperature: options.temperature ?? 0.7,
    max_tokens: options.maxTokens ?? 4096,
    response_format: options.jsonMode ? { type: 'json_object' } : undefined,
  });
  return response.choices[0].message.content;
}

async function extractJson(text) {
  try {
    return JSON.parse(text);
  } catch {
    const jsonMatch = text.match(/```json\s*([\s\S]*?)\s*```/) || text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      try {
        return JSON.parse(jsonMatch[1] || jsonMatch[0]);
      } catch {
        return null;
      }
    }
    return null;
  }
}

export { createChatCompletion, extractJson, getNextClient };
