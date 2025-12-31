import type { Achievement, User, Activity } from '../types/game';

export const ACHIEVEMENTS: Achievement[] = [
  {
    id: 'first_catch',
    name: 'First Catch',
    description: 'Resolve your first ghost',
    icon: '👻',
    bonusPoints: 10,
    condition: (user: User) => user.stats.ghostsResolved >= 1,
  },
  {
    id: 'speed_demon',
    name: 'Speed Demon',
    description: 'Resolve a ghost in under 4 hours',
    icon: '⚡',
    bonusPoints: 25,
    condition: (_user: User, activities: Activity[]) => {
      return activities.some(activity => activity.activityType === 'quickResolve');
    },
  },
  {
    id: 'impact_player',
    name: 'Impact Player',
    description: 'Resolve a ghost with impact level 5',
    icon: '💥',
    bonusPoints: 30,
    condition: (_user: User, activities: Activity[]) => {
      return activities.some(activity =>
        activity.activityType === 'impactBonus' &&
        activity.metadata?.impact === 5
      );
    },
  },
  {
    id: 'hat_trick',
    name: 'Hat Trick',
    description: 'Resolve 3 ghosts in one day',
    icon: '🎩',
    bonusPoints: 50,
    condition: (_user: User, activities: Activity[]) => {
      const today = new Date().toDateString();
      const todayResolutions = activities.filter(activity => {
        const activityDate = new Date(activity.timestamp).toDateString();
        return activityDate === today && activity.activityType === 'resolved';
      });
      return todayResolutions.length >= 3;
    },
  },
  {
    id: 'week_warrior',
    name: 'Week Warrior',
    description: 'Resolve 10 total ghosts',
    icon: '🏆',
    bonusPoints: 100,
    condition: (user: User) => user.stats.ghostsResolved >= 10,
  },
];

export const calculateLevel = (totalPoints: number): number => {
  return Math.floor(totalPoints / 100) + 1;
};
