import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
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

    const fetchUser = async () => {
      const { data: userData, error } = await supabase
        .from('users')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      if (error) {
        console.error('Error fetching user:', error);
        setLoading(false);
        return;
      }

      if (userData) {
        setUser({
          userId: userData.user_id,
          displayName: userData.display_name,
          firstName: userData.first_name,
          lastName: userData.last_name,
          email: userData.email,
          totalPoints: userData.total_points,
          level: userData.level,
          badges: userData.badges || [],
          stats: userData.stats || {
            ghostsResolved: 0,
            averageResolutionTime: 0,
            streak: 0,
            weeklyPoints: 0,
            weeklyGhostsResolved: 0,
          },
          createdAt: userData.created_at,
          lastActivityDate: userData.last_activity_date,
        });
      } else {
        const displayName = userId.split('@')[0];
        const newUser: User = {
          userId,
          displayName,
          firstName: '',
          lastName: '',
          email: '',
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

        const { error: insertError } = await supabase
          .from('users')
          .insert([{
            user_id: userId,
            display_name: displayName,
            first_name: '',
            last_name: '',
            email: '',
            total_points: 0,
            level: 1,
            badges: [],
            stats: newUser.stats,
            created_at: newUser.createdAt,
            last_activity_date: newUser.lastActivityDate,
          }]);

        if (insertError) {
          console.error('Error creating user:', insertError);
        }
        setUser(newUser);
      }
      setLoading(false);
    };

    fetchUser();

    const userChannel = supabase
      .channel(`user-${userId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'users', filter: `user_id=eq.${userId}` }, () => {
        fetchUser();
      })
      .subscribe();

    const fetchActivities = async () => {
      const { data: activitiesData, error } = await supabase
        .from('activities')
        .select('*')
        .eq('user_id', userId)
        .order('timestamp', { ascending: false });

      if (error) {
        console.error('Error fetching activities:', error);
        return;
      }

      setActivities((activitiesData || []).map((activity: any) => ({
        id: activity.id,
        userId: activity.user_id,
        ghostId: activity.ghost_id,
        activityType: activity.activity_type,
        pointsEarned: activity.points_earned,
        timestamp: activity.timestamp,
        metadata: activity.metadata || {},
      })));
    };

    fetchActivities();

    const activitiesChannel = supabase
      .channel(`activities-${userId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'activities', filter: `user_id=eq.${userId}` }, () => {
        fetchActivities();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(userChannel);
      supabase.removeChannel(activitiesChannel);
    };
  }, [userId]);

  const awardPoints = async (pointsEarned: number, activityData: Omit<Activity, 'id'>) => {
    if (!userId || !user) return;

    const newTotalPoints = user.totalPoints + pointsEarned;
    const newLevel = calculateLevel(newTotalPoints);

    const { error: updateError } = await supabase
      .from('users')
      .update({
        total_points: newTotalPoints,
        level: newLevel,
        stats: {
          ...user.stats,
          ghostsResolved: user.stats.ghostsResolved + 1,
        },
        last_activity_date: new Date().toISOString(),
      })
      .eq('user_id', userId);

    if (updateError) {
      console.error('Error updating user points:', updateError);
      return;
    }

    const { error: activityError } = await supabase
      .from('activities')
      .insert([{
        user_id: activityData.userId,
        ghost_id: activityData.ghostId,
        activity_type: activityData.activityType,
        points_earned: activityData.pointsEarned,
        timestamp: activityData.timestamp,
        metadata: activityData.metadata || {},
      }]);

    if (activityError) {
      console.error('Error adding activity:', activityError);
    }

    await checkAndAwardAchievements();
  };

  const checkAndAwardAchievements = async () => {
    if (!userId || !user) return;

    const { data: activitiesData, error } = await supabase
      .from('activities')
      .select('*')
      .eq('user_id', userId);

    if (error) {
      console.error('Error fetching activities for achievements:', error);
      return;
    }

    const activitiesList: Activity[] = (activitiesData || []).map((activity: any) => ({
      id: activity.id,
      userId: activity.user_id,
      ghostId: activity.ghost_id,
      activityType: activity.activity_type,
      pointsEarned: activity.points_earned,
      timestamp: activity.timestamp,
      metadata: activity.metadata || {},
    }));

    const unlockedBadgeIds = user.badges.map(b => b.id);
    const newBadges: Badge[] = [];

    for (const achievement of ACHIEVEMENTS) {
      if (!unlockedBadgeIds.includes(achievement.id) && achievement.condition(user, activitiesList)) {
        const newBadge: Badge = {
          id: achievement.id,
          name: achievement.name,
          description: achievement.description,
          icon: achievement.icon,
          unlockedAt: new Date().toISOString(),
          bonusPoints: achievement.bonusPoints,
        };
        newBadges.push(newBadge);

        const { error: updateError } = await supabase
          .from('users')
          .update({
            badges: [...user.badges, newBadge],
            total_points: user.totalPoints + achievement.bonusPoints,
          })
          .eq('user_id', userId);

        if (updateError) {
          console.error('Error updating user badges:', updateError);
          continue;
        }

        await supabase
          .from('activities')
          .insert([{
            user_id: userId,
            ghost_id: 'achievement',
            activity_type: 'achievementUnlock',
            points_earned: achievement.bonusPoints,
            timestamp: new Date().toISOString(),
            metadata: { achievementId: achievement.id },
          }]);
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
    const fetchLeaderboard = async () => {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .order('total_points', { ascending: false })
        .limit(10);

      if (error) {
        console.error('Error fetching leaderboard:', error);
        setLoading(false);
        return;
      }

      setLeaderboard((data || []).map((user: any) => ({
        userId: user.user_id,
        displayName: user.display_name,
        firstName: user.first_name,
        lastName: user.last_name,
        email: user.email,
        totalPoints: user.total_points,
        level: user.level,
        badges: user.badges || [],
        stats: user.stats || {
          ghostsResolved: 0,
          averageResolutionTime: 0,
          streak: 0,
          weeklyPoints: 0,
          weeklyGhostsResolved: 0,
        },
        createdAt: user.created_at,
        lastActivityDate: user.last_activity_date,
      })));
      setLoading(false);
    };

    fetchLeaderboard();

    const channel = supabase
      .channel('leaderboard-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'users' }, () => {
        fetchLeaderboard();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return { leaderboard, loading };
}
