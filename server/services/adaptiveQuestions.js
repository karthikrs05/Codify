function fallbackQuestion({ topic = 'Arrays', difficulty = 'Medium' } = {}) {
  return {
    id: `gen_${Date.now()}`,
    title: `Adaptive ${topic} Challenge`,
    difficulty,
    tags: [topic, 'Adaptive'],
    xp: difficulty === 'Easy' ? 75 : difficulty === 'Hard' ? 200 : 125,
    prompt:
      `Solve a ${difficulty.toLowerCase()} ${topic.toLowerCase()} problem. ` +
      `Implement an efficient solution and explain time/space complexity.`
  };
}

export async function generateAdaptiveQuestion({ user, topic, difficulty } = {}) {
  // Stub: wire a real LLM provider later (OpenAI/Anthropic/etc).
  // Keep the contract stable for the frontend.
  void user;
  return fallbackQuestion({ topic, difficulty });
}

