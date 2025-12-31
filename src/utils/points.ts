import type { Ghost } from '../types/ghost';
import type { PointsCalculation } from '../types/game';

export function calculatePoints(ghost: Ghost): PointsCalculation {
  const basePoints = 10;

  const impactMultiplier = ghost.impact;

  const isQuickResolve = ghost.daysOpen < 1;
  const quickBonus = isQuickResolve ? basePoints * impactMultiplier : 0;

  const weeksOpen = Math.floor(ghost.daysOpen / 7);
  const ageBonus = weeksOpen * 5;

  const subtotal = basePoints * impactMultiplier + quickBonus + ageBonus;
  const totalPoints = Math.max(subtotal, 10);

  return {
    basePoints,
    impactMultiplier,
    quickBonus,
    ageBonus,
    totalPoints,
  };
}

export function getPointsBreakdown(calculation: PointsCalculation): string[] {
  const breakdown: string[] = [];

  breakdown.push(`Base: ${calculation.basePoints} points`);
  breakdown.push(`Impact x${calculation.impactMultiplier}`);

  if (calculation.quickBonus > 0) {
    breakdown.push(`Quick Resolve: +${calculation.quickBonus} points`);
  }

  if (calculation.ageBonus > 0) {
    breakdown.push(`Old Ghost Bonus: +${calculation.ageBonus} points`);
  }

  return breakdown;
}
