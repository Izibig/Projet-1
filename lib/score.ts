const WEIGHT = { CRITICAL: 10, SERIOUS: 5, MODERATE: 2, MINOR: 1 } as const;

export function computeScore(violations: { impact: keyof typeof WEIGHT }[]) {
  const penalty = violations.reduce((s, v) => s + WEIGHT[v.impact], 0);
  return Math.max(0, 100 - penalty); // 100 = aucune violation
}
