import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import type { Ghost } from '../types/ghost';

export function useGhosts() {
  const [ghosts, setGhosts] = useState<Ghost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchGhosts = async () => {
      try {
        const { data, error: fetchError } = await supabase
          .from('ghosts')
          .select('*')
          .order('timestamp', { ascending: false });

        if (fetchError) throw fetchError;

        const ghostsData: Ghost[] = (data || []).map((ghost) => {
          const dateReported = new Date(ghost.date_reported || ghost.timestamp);
          const today = new Date();
          const daysOpen = Math.floor((today.getTime() - dateReported.getTime()) / (1000 * 60 * 60 * 24));

          let actualResolutionTime = ghost.actual_resolution_time;
          if (ghost.status === 'Resolved' && ghost.date_resolved && !actualResolutionTime) {
            const dateResolved = new Date(ghost.date_resolved);
            actualResolutionTime = Math.floor((dateResolved.getTime() - dateReported.getTime()) / (1000 * 60 * 60 * 24));
          }

          return {
            id: ghost.ghost_id,
            title: ghost.title,
            description: ghost.description,
            category: ghost.category,
            impact: ghost.impact,
            effort: ghost.effort,
            priority: ghost.priority,
            email: ghost.email,
            reporterEmail: ghost.reporter_email,
            reporter: ghost.reporter,
            department: ghost.department,
            geography: ghost.geography,
            riskType: ghost.risk_type || [],
            url: ghost.url,
            pageTitle: ghost.page_title,
            timestamp: ghost.timestamp,
            dateReported: ghost.date_reported,
            status: ghost.status,
            assignedTo: ghost.assigned_to,
            resolutionNotes: ghost.resolution_notes,
            daysOpen,
            screenshot: ghost.screenshot,
            resolvedBy: ghost.resolved_by,
            resolvedAt: ghost.resolved_at,
            dateResolved: ghost.date_resolved,
            actualResolutionTime,
            pointsAwarded: ghost.points_awarded,
            escalated: ghost.escalated,
            escalatedAt: ghost.escalated_at,
            escalatedBy: ghost.escalated_by,
            escalationNotes: ghost.escalation_notes,
            firestoreId: ghost.id,
          };
        });

        setGhosts(ghostsData);
        setLoading(false);
        setError(null);
      } catch (err: any) {
        console.error('Error fetching ghosts:', err);
        setError('Failed to load ghosts');
        setLoading(false);
      }
    };

    fetchGhosts();

    const channel = supabase
      .channel('ghosts-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'ghosts' }, () => {
        fetchGhosts();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const updateGhostStatus = async (ghostId: string, status: Ghost['status']) => {
    try {
      const updates: any = {
        status,
        updated_at: new Date().toISOString()
      };

      if (status === 'Resolved') {
        const ghost = ghosts.find(g => g.id === ghostId);
        if (!ghost?.dateResolved) {
          updates.date_resolved = new Date().toISOString();
        }
      }

      const { error } = await supabase
        .from('ghosts')
        .update(updates)
        .eq('ghost_id', ghostId);

      if (error) throw error;
    } catch (err) {
      console.error('Error updating ghost status:', err);
      throw err;
    }
  };

  const updateGhost = async (ghostId: string, updates: Partial<Ghost>) => {
    try {
      const dbUpdates: any = {
        updated_at: new Date().toISOString()
      };

      if (updates.title !== undefined) dbUpdates.title = updates.title;
      if (updates.description !== undefined) dbUpdates.description = updates.description;
      if (updates.category !== undefined) dbUpdates.category = updates.category;
      if (updates.impact !== undefined) dbUpdates.impact = updates.impact;
      if (updates.effort !== undefined) dbUpdates.effort = updates.effort;
      if (updates.priority !== undefined) dbUpdates.priority = updates.priority;
      if (updates.status !== undefined) dbUpdates.status = updates.status;
      if (updates.assignedTo !== undefined) dbUpdates.assigned_to = updates.assignedTo;
      if (updates.resolutionNotes !== undefined) dbUpdates.resolution_notes = updates.resolutionNotes;
      if (updates.resolvedBy !== undefined) dbUpdates.resolved_by = updates.resolvedBy;
      if (updates.resolvedAt !== undefined) dbUpdates.resolved_at = updates.resolvedAt;
      if (updates.dateResolved !== undefined) dbUpdates.date_resolved = updates.dateResolved;
      if (updates.actualResolutionTime !== undefined) dbUpdates.actual_resolution_time = updates.actualResolutionTime;
      if (updates.pointsAwarded !== undefined) dbUpdates.points_awarded = updates.pointsAwarded;
      if (updates.escalated !== undefined) dbUpdates.escalated = updates.escalated;
      if (updates.escalatedAt !== undefined) dbUpdates.escalated_at = updates.escalatedAt;
      if (updates.escalatedBy !== undefined) dbUpdates.escalated_by = updates.escalatedBy;
      if (updates.escalationNotes !== undefined) dbUpdates.escalation_notes = updates.escalationNotes;

      const { error } = await supabase
        .from('ghosts')
        .update(dbUpdates)
        .eq('ghost_id', ghostId);

      if (error) throw error;
    } catch (err) {
      console.error('Error updating ghost:', err);
      throw err;
    }
  };

  const addGhost = async (ghostData: Omit<Ghost, 'daysOpen' | 'firestoreId'>) => {
    try {
      const { error } = await supabase.from('ghosts').insert({
        ghost_id: ghostData.id,
        title: ghostData.title,
        description: ghostData.description,
        category: ghostData.category,
        impact: ghostData.impact,
        effort: ghostData.effort,
        priority: ghostData.priority,
        email: ghostData.email,
        reporter_email: ghostData.reporterEmail,
        reporter: ghostData.reporter,
        department: ghostData.department,
        geography: ghostData.geography,
        risk_type: ghostData.riskType || [],
        url: ghostData.url,
        page_title: ghostData.pageTitle,
        timestamp: ghostData.timestamp,
        date_reported: ghostData.dateReported,
        status: ghostData.status,
        assigned_to: ghostData.assignedTo,
        resolution_notes: ghostData.resolutionNotes,
        screenshot: ghostData.screenshot,
      });

      if (error) throw error;
    } catch (err) {
      console.error('Error adding ghost:', err);
      throw err;
    }
  };

  return { ghosts, loading, error, updateGhostStatus, updateGhost, addGhost };
}
