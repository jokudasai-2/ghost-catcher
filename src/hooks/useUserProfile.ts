import { useEffect, useState } from 'react';
import { collection, doc, setDoc, updateDoc, onSnapshot, query, where, orderBy, getDocs } from 'firebase/firestore';
import { db } from '../firebase-config';
import type { User, Activity, Badge } from '../types/game';
import { ACHIEVEMENTS, calculateLevel } from '../constants/achievements';

export function useUserProfile(userId: string | null) {
  const [user, setUser] = useState<User | null>(null);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) {
      setUser(null);
      setActivities([]);
      setLoading(false);
      return;
    }

    const userRef = doc(db, 'users', userId);

    const unsubscribe = onSnapshot(userRef, async (docSnapshot) => {
      if (docSnapshot.exists()) {
        const userData = docSnapshot.data() as User;
        setUser(userData);
      } else {
        const newUser: User = {
          userId,
          displayName: userId.split('@')[0],
          totalPoints: 0,
          level: 1,
          badges: [],
          stats: {
            ghostsResolved: 0,
            averageResolutionTime: 0,
            streak: 0,
            weeklyPoints: 0,
            weeklyGhostsResolved: 0,
          },
          createdAt: new Date().toISOString(),
          lastActivityDate: new Date().toISOString(),
        };
        await setDoc(userRef, newUser);
        setUser(newUser);
      }
      setLoading(false);
    });

    const activitiesQuery = query(
      collection(db, 'activities'),
      where('userId', '==', userId),
      orderBy('timestamp', 'desc')
    );

    const unsubscribeActivities = onSnapshot(activitiesQuery, (snapshot) => {
      const activitiesData: Activity[] = [];
      snapshot.forEach((doc) => {
        activitiesData.push({ id: doc.id, ...doc.data() } as Activity);
      });
      setActivities(activitiesData);
    });

    return () => {
      unsubscribe();
      unsubscribeActivities();
    };
  }, [userId]);

  const awardPoints = async (pointsEarned: number, activityData: Omit<Activity, 'id'>) => {
    if (!userId || !user) return;

    const userRef = doc(db, 'users', userId);
    const newTotalPoints = user.totalPoints + pointsEarned;
    const newLevel = calculateLevel(newTotalPoints);

    await updateDoc(userRef, {
      totalPoints: newTotalPoints,
      level: newLevel,
      'stats.ghostsResolved': user.stats.ghostsResolved + 1,
      lastActivityDate: new Date().toISOString(),
    });

    await setDoc(doc(collection(db, 'activities')), activityData);

    await checkAndAwardAchievements();
  };

  const checkAndAwardAchievements = async () => {
    if (!userId || !user) return;

    const userActivities = await getDocs(
      query(collection(db, 'activities'), where('userId', '==', userId))
    );
    const activitiesData: Activity[] = [];
    userActivities.forEach((doc) => {
      activitiesData.push({ id: doc.id, ...doc.data() } as Activity);
    });

    const unlockedBadgeIds = user.badges.map(b => b.id);
    const newBadges: Badge[] = [];

    for (const achievement of ACHIEVEMENTS) {
      if (!unlockedBadgeIds.includes(achievement.id) && achievement.condition(user, activitiesData)) {
        const newBadge: Badge = {
          id: achievement.id,
          name: achievement.name,
          description: achievement.description,
          icon: achievement.icon,
          unlockedAt: new Date().toISOString(),
          bonusPoints: achievement.bonusPoints,
        };
        newBadges.push(newBadge);

        await updateDoc(doc(db, 'users', userId), {
          badges: [...user.badges, newBadge],
          totalPoints: user.totalPoints + achievement.bonusPoints,
        });

        await setDoc(doc(collection(db, 'activities')), {
          userId,
          ghostId: 'achievement',
          activityType: 'achievementUnlock',
          pointsEarned: achievement.bonusPoints,
          timestamp: new Date().toISOString(),
          metadata: { achievementId: achievement.id },
        });
      }
    }

    return newBadges;
  };

  return { user, activities, loading, awardPoints, checkAndAwardAchievements };
}

export function useLeaderboard() {
  const [leaderboard, setLeaderboard] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, 'users'), orderBy('totalPoints', 'desc'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const users: User[] = [];
      snapshot.forEach((doc) => {
        users.push(doc.data() as User);
      });
      setLeaderboard(users.slice(0, 10));
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  return { leaderboard, loading };
}
