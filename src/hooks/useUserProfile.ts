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
      try {
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select(`
            *,
            user_stats (*),
            badges (*)
          `)
          .eq('user_id', userId)
          .maybeSingle();

        if (userError) throw userError;

        if (userData) {
          const stats = userData.user_stats || {
            ghosts_resolved: 0,
            average_resolution_time: 0,
            streak: 0,
            weekly_points: 0,
            weekly_ghosts_resolved: 0,
          };

          setUser({
            userId: userData.user_id,
            displayName: userData.display_name,
            firstName: userData.first_name,
            lastName: userData.last_name,
            email: userData.email,
            totalPoints: userData.total_points,
            level: userData.level,
            badges: (userData.badges || []).map((b: any) => ({
              id: b.badge_id,
              name: b.name,
              description: b.description,
              icon: b.icon,
              unlockedAt: b.unlocked_at,
              bonusPoints: b.bonus_points,
            })),
            stats: {
              ghostsResolved: stats.ghosts_resolved || 0,
              averageResolutionTime: stats.average_resolution_time || 0,
              streak: stats.streak || 0,
              weeklyPoints: stats.weekly_points || 0,
              weeklyGhostsResolved: stats.weekly_ghosts_resolved || 0,
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

          const { data: insertedUser, error: insertError } = await supabase
            .from('users')
            .insert({
              user_id: userId,
              display_name: displayName,
              first_name: '',
              last_name: '',
              email: '',
              total_points: 0,
              level: 1,
              is_admin: false,
            })
            .select()
            .single();

          if (insertError) {
            console.error('Error creating user:', insertError);
          } else if (insertedUser) {
            await supabase.from('user_stats').insert({
              user_id: insertedUser.id,
              ghosts_resolved: 0,
              average_resolution_time: 0,
              streak: 0,
              weekly_points: 0,
              weekly_ghosts_resolved: 0,
            });
            setUser(newUser);
          }
        }
        setLoading(false);
      } catch (error) {
        console.error('Error fetching user:', error);
        setLoading(false);
      }
    };

    const fetchActivities = async () => {
      try {
        const { data: userRecord } = await supabase
          .from('users')
          .select('id')
          .eq('user_id', userId)
          .maybeSingle();

        if (!userRecord) return;

        const { data, error } = await supabase
          .from('activities')
          .select('*')
          .eq('user_id', userRecord.id)
          .order('timestamp', { ascending: false });

        if (error) throw error;

        setActivities((data || []).map((activity: any) => ({
          id: activity.id,
          userId: activity.user_id,
          ghostId: activity.ghost_id,
          activityType: activity.activity_type,
          pointsEarned: activity.points_earned,
          timestamp: activity.timestamp,
          metadata: activity.metadata || {},
        })));
      } catch (error) {
        console.error('Error fetching activities:', error);
      }
    };

    fetchUser();
    fetchActivities();

    const usersChannel = supabase
      .channel(`users-${userId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'users', filter: `user_id=eq.${userId}` }, () => {
        fetchUser();
      })
      .subscribe();

    const activitiesChannel = supabase
      .channel(`activities-${userId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'activities' }, () => {
        fetchActivities();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(usersChannel);
      supabase.removeChannel(activitiesChannel);
    };
  }, [userId]);

  const awardPoints = async (pointsEarned: number, activityData: Omit<Activity, 'id'>) => {
    if (!userId || !user) return;

    const newTotalPoints = user.totalPoints + pointsEarned;
    const newLevel = calculateLevel(newTotalPoints);

    try {
      const { data: userRecord } = await supabase
        .from('users')
        .select('id')
        .eq('user_id', userId)
        .single();

      if (userRecord) {
        await supabase
          .from('users')
          .update({
            total_points: newTotalPoints,
            level: newLevel,
            last_activity_date: new Date().toISOString(),
          })
          .eq('user_id', userId);

        await supabase
          .from('user_stats')
          .update({
            ghosts_resolved: user.stats.ghostsResolved + 1,
            updated_at: new Date().toISOString(),
          })
          .eq('user_id', userRecord.id);

        await supabase.from('activities').insert({
          user_id: userRecord.id,
          ghost_id: activityData.ghostId,
          activity_type: activityData.activityType,
          points_earned: activityData.pointsEarned,
          timestamp: activityData.timestamp,
          metadata: activityData.metadata || {},
        });

        await checkAndAwardAchievements();
      }
    } catch (error) {
      console.error('Error awarding points:', error);
    }
  };

  const checkAndAwardAchievements = async () => {
    if (!userId || !user) return;

    try {
      const { data: userRecord } = await supabase
        .from('users')
        .select('id')
        .eq('user_id', userId)
        .single();

      if (!userRecord) return;

      const { data: activitiesData } = await supabase
        .from('activities')
        .select('*')
        .eq('user_id', userRecord.id);

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

          await supabase.from('badges').insert({
            user_id: userRecord.id,
            badge_id: achievement.id,
            name: achievement.name,
            description: achievement.description,
            icon: achievement.icon,
            bonus_points: achievement.bonusPoints,
            unlocked_at: new Date().toISOString(),
          });

          await supabase
            .from('users')
            .update({
              total_points: user.totalPoints + achievement.bonusPoints,
            })
            .eq('user_id', userId);

          await supabase.from('activities').insert({
            user_id: userRecord.id,
            ghost_id: 'achievement',
            activity_type: 'achievementUnlock',
            points_earned: achievement.bonusPoints,
            timestamp: new Date().toISOString(),
            metadata: { achievementId: achievement.id },
          });
        }
      }

      return newBadges;
    } catch (error) {
      console.error('Error checking achievements:', error);
      return [];
    }
  };

  return { user, activities, loading, awardPoints, checkAndAwardAchievements };
}

export function useLeaderboard() {
  const [leaderboard, setLeaderboard] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const { data, error } = await supabase
          .from('users')
          .select(`
            *,
            user_stats (*),
            badges (*)
          `)
          .order('total_points', { ascending: false })
          .limit(10);

        if (error) throw error;

        setLeaderboard((data || []).map((userData: any) => {
          const stats = userData.user_stats || {
            ghosts_resolved: 0,
            average_resolution_time: 0,
            streak: 0,
            weekly_points: 0,
            weekly_ghosts_resolved: 0,
          };

          return {
            userId: userData.user_id,
            displayName: userData.display_name,
            firstName: userData.first_name,
            lastName: userData.last_name,
            email: userData.email,
            totalPoints: userData.total_points,
            level: userData.level,
            badges: (userData.badges || []).map((b: any) => ({
              id: b.badge_id,
              name: b.name,
              description: b.description,
              icon: b.icon,
              unlockedAt: b.unlocked_at,
              bonusPoints: b.bonus_points,
            })),
            stats: {
              ghostsResolved: stats.ghosts_resolved || 0,
              averageResolutionTime: stats.average_resolution_time || 0,
              streak: stats.streak || 0,
              weeklyPoints: stats.weekly_points || 0,
              weeklyGhostsResolved: stats.weekly_ghosts_resolved || 0,
            },
            createdAt: userData.created_at,
            lastActivityDate: userData.last_activity_date,
          };
        }));
        setLoading(false);
      } catch (error) {
        console.error('Error fetching leaderboard:', error);
        setLoading(false);
      }
    };

    fetchLeaderboard();

    const channel = supabase
      .channel('users-leaderboard')
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
