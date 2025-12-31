export interface User {
  userId: string;
  displayName: string;
  totalPoints: number;
  level: number;
  badges: Badge[];
  stats: UserStats;
  createdAt: string;
  lastActivityDate: string;
}

export interface UserStats {
  ghostsResolved: number;
  averageResolutionTime: number;
  streak: number;
  weeklyPoints: number;
  weeklyGhostsResolved: number;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlockedAt: string;
  bonusPoints: number;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  bonusPoints: number;
  condition: (user: User, activities: Activity[]) => boolean;
}

export interface Activity {
  id?: string;
  userId: string;
  ghostId: string;
  activityType: 'resolved' | 'quickResolve' | 'impactBonus' | 'achievementUnlock';
  pointsEarned: number;
  timestamp: string;
  metadata?: Record<string, any>;
}

export interface PointsCalculation {
  basePoints: number;
  impactMultiplier: number;
  quickBonus: number;
  ageBonus: number;
  totalPoints: number;
}
