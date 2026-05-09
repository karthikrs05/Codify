export function getLevelFromXp(xp) {
  const safeXp = Number.isFinite(xp) ? xp : 0;
  return Math.max(1, Math.floor(safeXp / 500) + 1);
}

export function getNextLevelXp(level) {
  const safeLevel = Number.isFinite(level) ? level : 1;
  return Math.max(500, safeLevel * 500);
}

