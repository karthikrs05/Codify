export const mockProblems = [
  {
    id: 1,
    title: "Two Sum",
    difficulty: "Easy",
    tags: ["Array", "Hash Map"],
    xp: 75,
    description: "Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.",
    examples: [
      { input: "nums = [2,7,11,15], target = 9", output: "[0,1]", explanation: "nums[0] + nums[1] = 9" },
    ],
    constraints: ["2 <= nums.length <= 10^4", "-10^9 <= nums[i] <= 10^9"],
    starterCode: "def twoSum(nums, target):\n    seen = {}\n    for i, n in enumerate(nums):\n        diff = target - n\n        if diff in seen:\n            return [seen[diff], i]\n        seen[n] = i",
  },
  { id: 2, title: "Valid Parentheses", difficulty: "Easy", tags: ["Stack"], xp: 75 },
  { id: 3, title: "Longest Substring", difficulty: "Medium", tags: ["Sliding Window"], xp: 125 },
];

export const mockLeaderboard = [
  { rank: 1, username: "rahulk", xp: 9820, solved: 312, streak: 45 },
  { rank: 2, username: "priyas", xp: 8410, solved: 278, streak: 30 },
  { rank: 3, username: "aaravm", xp: 7990, solved: 251, streak: 22 },
  { rank: 4, username: "devj", xp: 6540, solved: 198, streak: 15 },
  { rank: 5, username: "snehat", xp: 5920, solved: 176, streak: 12 },
  { rank: 6, username: "karthikr", xp: 5430, solved: 154, streak: 9 },
  { rank: 7, username: "ananyam", xp: 5100, solved: 143, streak: 18 },
  { rank: 8, username: "rohans", xp: 4890, solved: 132, streak: 7 },
  { rank: 9, username: "meghap", xp: 4600, solved: 121, streak: 11 },
  { rank: 10, username: "vijayk", xp: 4400, solved: 115, streak: 6 },
  { rank: 11, username: "ishank", xp: 4310, solved: 109, streak: 8 },
  { rank: 12, username: "arjun_codes", xp: 4250, solved: 87, streak: 18, isMe: true },
];

export const mockBadges = [
  { id: 1, name: "First Blood", icon: "⚡", desc: "Solved your first problem", earned: true },
  { id: 2, name: "Hot Streak", icon: "🔥", desc: "7-day streak", earned: true },
  { id: 3, name: "Sharpshooter", icon: "🎯", desc: "First attempt AC", earned: true },
  { id: 4, name: "Century Club", icon: "💎", desc: "Solve 100 problems", earned: false },
  { id: 5, name: "Contest King", icon: "🏆", desc: "Win a weekly contest", earned: false },
  { id: 6, name: "DP Master", icon: "🧠", desc: "Solve 20 DP problems", earned: false },
];

export const mockTopics = [
  { name: "Arrays", pct: 78 },
  { name: "Dynamic Programming", pct: 45 },
  { name: "Graphs", pct: 30 },
  { name: "Trees", pct: 62 },
  { name: "Strings", pct: 85 },
];
