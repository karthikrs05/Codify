import { createChatCompletion, extractJson } from './ai.js';

const TOPICS = [
  'Arrays', 'Strings', 'Hash Maps', 'Two Pointers', 'Sliding Window',
  'Linked Lists', 'Stacks & Queues', 'Trees', 'Graphs', 'Dynamic Programming'
];

const DIFFICULTY_LEVELS = ['Beginner', 'Easy', 'Medium', 'Hard', 'Expert'];

async function generateAssessmentQuestions() {
  const systemPrompt = `You are an expert coding assessment generator. Generate 5 diagnostic questions to assess a programmer's level across different topics.

Each question should test a different fundamental topic:
1. Arrays/Lists
2. Strings
3. Hash Maps/Dictionaries
4. Two Pointers or Basic Algorithms
5. Simple Logic/Problem Solving

Return ONLY a JSON object with this exact structure:
{
  "questions": [
    {
      "id": "q1",
      "topic": "Arrays",
      "title": "Question Title",
      "description": "Full problem description with examples",
      "difficulty": "Easy",
      "starterCode": "def solution(nums):\\n    pass",
      "testCases": [
        {"input": "[1,2,3]", "expected": "[2,4,6]"},
        {"input": "[0]", "expected": "[0]"}
      ]
    }
  ]
}

Make questions that help differentiate between beginner, intermediate, and advanced programmers. Include clear examples in each description.`;

  const result = await createChatCompletion(systemPrompt, 'Generate 5 diagnostic assessment questions.', {
    jsonMode: true,
    temperature: 0.8,
    maxTokens: 8000,
  });

  const json = await extractJson(result);
  return json?.questions || [];
}

async function evaluateAssessment(submissions) {
  const systemPrompt = `You are an expert coding evaluator. Evaluate the user's performance on assessment questions and determine their skill level.

Submissions will contain: question topic, their code, and whether test cases passed.

Return ONLY a JSON object with this exact structure:
{
  "estimatedLevel": "Intermediate",
  "estimatedLevelNumeric": 3,
  "strengths": ["Arrays", "Strings"],
  "weaknesses": ["Dynamic Programming", "Graphs"],
  "scores": {
    "arrays": 75,
    "strings": 80,
    "hashMaps": 60,
    "twoPointers": 50,
    "slidingWindow": 30,
    "linkedLists": 40,
    "stacksQueues": 45,
    "trees": 35,
    "graphs": 20,
    "dynamicProgramming": 15
  },
  "feedback": "Overall summary of performance and suggestions"
}

estimatedLevelNumeric: 1=Beginner, 2=Novice, 3=Intermediate, 4=Advanced, 5=Expert
Scores should be 0-100 based on performance.`;

  const result = await createChatCompletion(
    systemPrompt,
    `Evaluate these assessment submissions:\n${JSON.stringify(submissions, null, 2)}`,
    { jsonMode: true, temperature: 0.3, maxTokens: 2000 }
  );

  const json = await extractJson(result);
  return json || {
    estimatedLevel: 'Beginner',
    estimatedLevelNumeric: 1,
    strengths: [],
    weaknesses: TOPICS,
    scores: { arrays: 50, strings: 50, hashMaps: 50, twoPointers: 30, slidingWindow: 20, linkedLists: 30, stacksQueues: 30, trees: 20, graphs: 10, dynamicProgramming: 10 },
    feedback: 'Starting your coding journey.'
  };
}

async function generateRoadmap(assessment) {
  const systemPrompt = `You are an expert learning path designer. Create a personalized coding learning roadmap based on the user's assessment.

Consider their:
- Current level (1=Beginner to 5=Expert)
- Strengths (they're good at these)
- Weaknesses (need practice)
- Topic scores (0-100)

Return ONLY a JSON object with this exact structure:
{
  "roadmap": [
    {
      "topic": "Arrays",
      "priority": 1,
      "reason": "Why this topic should be learned first",
      "estimatedProblems": 5
    }
  ],
  "overview": "A 1-paragraph summary of the learning path"
}

Priority: 1 = highest priority (learn first), 10 = lowest.
Order topics from most fundamental to most advanced.
Address weaknesses first, then build on strengths.`;

  const result = await createChatCompletion(
    systemPrompt,
    `Generate a learning roadmap based on this assessment:\n${JSON.stringify(assessment, null, 2)}`,
    { jsonMode: true, temperature: 0.7, maxTokens: 2000 }
  );

  const json = await extractJson(result);
  return json || { roadmap: [], overview: 'No roadmap generated' };
}

async function generateQuestion(topic, userLevel = 1, options = {}) {
  const { isBossTask = false, solvedInTopic = 0, explicitDifficulty = null } = options;

  let difficulty;
  if (explicitDifficulty && ['Easy', 'Medium', 'Hard'].includes(explicitDifficulty)) {
    difficulty = explicitDifficulty;
  } else if (isBossTask) {
    difficulty = userLevel >= 4 ? 'Hard' : 'Medium';
  } else {
    const diffMap = { 1: 'Easy', 2: 'Easy', 3: 'Medium', 4: 'Medium', 5: 'Hard' };
    difficulty = diffMap[userLevel] || 'Easy';
  }

  const bossTaskNote = isBossTask
    ? `This is a BOSS TASK - a challenging problem that tests comprehensive understanding of ${topic}. Make it harder than a regular problem, requiring multiple techniques or an elegant insight.`
    : '';

  const randomSeed = Math.floor(Math.random() * 10000);

  const systemPrompt = `You are an expert coding problem generator. Generate a unique, high-quality coding interview-style problem.

IMPORTANT INSTRUCTIONS:
1. Generate a UNIQUE problem - do NOT copy existing LeetCode/known problems exactly. Create something original.
2. Do NOT include the solution or correct answer anywhere in the description.
3. Do NOT explain how to solve it in the problem statement.
4. Make sure test cases match the problem you're describing.
5. Use appropriate parameter names in starterCode based on the problem (not just "nums").

Topic: ${topic}
Difficulty: ${difficulty}
Random Seed: ${randomSeed} (use this to ensure uniqueness)

${bossTaskNote}

Return ONLY a JSON object with this exact structure:
{
  "id": "prob_${topic.toLowerCase().replace(/\\s/g, '_')}_${randomSeed}",
  "topic": "${topic}",
  "title": "Descriptive Problem Title",
  "description": "Full problem description. Include: problem statement, Example 1 with Input/Output/Explanation, Example 2, and Constraints.",
  "difficulty": "${difficulty}",
  "isBossTask": ${isBossTask},
  "starterCode": {
    "python": "def solution(param1, param2):\\n    pass",
    "cpp": "class Solution {\\npublic:\\n    ...\\n};",
    "java": "class Solution {\\n    ...\\n}"
  },
  "testCases": [
    {"input": "input_as_per_problem", "expected": "correct_output"},
    {"input": "another_input", "expected": "another_output"}
  ],
  "hints": [
    "First hint that doesn't give away solution",
    "Second hint if needed"
  ],
  "xpReward": ${isBossTask ? 200 : (difficulty === 'Easy' ? 75 : difficulty === 'Medium' ? 125 : 175)}
}

The starterCode should have appropriate parameters based on the problem (e.g., for strings use 's' or 'str', for arrays use 'arr' or 'nums', for linked lists use 'head', etc.).

Make the description clear and detailed. Include at least 2 test cases.`;

  const userMessage = `Generate a unique ${difficulty} difficulty ${topic} problem. ${isBossTask ? 'This is a BOSS TASK - make it challenging and comprehensive.' : ''}`;

  const result = await createChatCompletion(
    systemPrompt,
    userMessage,
    { jsonMode: true, temperature: 0.95, maxTokens: 4096 }
  );

  const json = await extractJson(result);
  return json;
}

async function evaluateCode(problem, code, language, testCases) {
  const systemPrompt = `You are an expert code evaluator and judge. Evaluate the user's code for correctness, efficiency, and style.

You will receive:
- The problem description
- The user's code
- The programming language
- Test cases (input/expected pairs)

Return ONLY a JSON object with this exact structure:
{
  "passed": true/false,
  "verdict": "Accepted" or "Wrong Answer" or "Time Limit Exceeded" or "Runtime Error" or "Compile Error",
  "passedTestCases": 2,
  "totalTestCases": 3,
  "failedTestCase": {"input": "...", "expected": "...", "actual": "..."},
  "feedback": "Detailed feedback about the solution: what they did well, what could be improved, time/space complexity analysis",
  "suggestions": ["Specific suggestion 1", "Specific suggestion 2"],
  "isMasteryLevel": true/false
}

Be thorough in your evaluation. Check edge cases. Provide constructive feedback.`;

  const result = await createChatCompletion(
    systemPrompt,
    `Problem: ${JSON.stringify(problem)}\n\nCode (${language}):\n${code}\n\nTest Cases: ${JSON.stringify(testCases)}`,
    { jsonMode: true, temperature: 0.3, maxTokens: 2000 }
  );

  const json = await extractJson(result);
  return json || {
    passed: false,
    verdict: 'Evaluation Error',
    passedTestCases: 0,
    totalTestCases: testCases?.length || 0,
    feedback: 'Could not evaluate code.',
    suggestions: [],
    isMasteryLevel: false
  };
}

async function checkMastery(topic, solvedCount, accuracy, recentPerformance) {
  const systemPrompt = `You are an expert at assessing programmer mastery. Determine if a user has achieved mastery in a topic based on their performance.

Factors:
- Number of problems solved in the topic
- Accuracy rate (% of attempts that passed)
- Recent performance (whether they're solving harder problems)

Return ONLY a JSON object with this exact structure:
{
  "isReadyForBossTask": true/false,
  "masteryScore": 75,
  "reasoning": "Why they are or aren't ready for the boss task",
  "suggestions": ["If not ready, what they should practice more"]
}

Consider them ready for a boss task when:
- They've solved at least 3-5 problems in the topic
- Their accuracy is 70%+
- They're consistently solving problems`;

  const result = await createChatCompletion(
    systemPrompt,
    `Topic: ${topic}\nSolved: ${solvedCount}\nAccuracy: ${accuracy}%\nRecent: ${JSON.stringify(recentPerformance)}`,
    { jsonMode: true, temperature: 0.3, maxTokens: 1000 }
  );

  const json = await extractJson(result);
  return json || { isReadyForBossTask: false, masteryScore: 0, reasoning: 'Could not assess', suggestions: [] };
}

export {
  generateAssessmentQuestions,
  evaluateAssessment,
  generateRoadmap,
  generateQuestion,
  evaluateCode,
  checkMastery,
  TOPICS,
  DIFFICULTY_LEVELS,
};
