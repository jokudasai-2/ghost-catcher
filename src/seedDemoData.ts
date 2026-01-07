import { supabase } from './lib/supabase';
import type { GhostStatus, GhostCategory, GhostPriority } from './types/ghost';
import deelGhostsData from './data/deel-ghosts-v2.json';

function generateGhostId() {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 1000);
  return `GH-${timestamp.toString().slice(-6)}${random}`;
}

export async function seedDemoData() {
  try {
    console.log('Starting to seed demo data...');

    let count = 0;

    for (const ghost of deelGhostsData) {
      const priority: GhostPriority = ghost.impact >= 4 ? 'High' : ghost.impact >= 3 ? 'Medium' : 'Low';

      const now = new Date();
      const daysAgo = ghost.daysOpen || 10;
      const reportDate = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000);
      const timestamp = reportDate.toISOString();
      const dateReported = reportDate.toISOString();

      const ghostData: any = {
        ghost_id: ghost.id,
        title: ghost.title,
        description: ghost.description,
        category: ghost.category as GhostCategory,
        impact: ghost.impact,
        effort: ghost.effort,
        priority,
        email: ghost.reporterEmail,
        reporter_email: ghost.reporterEmail,
        reporter: ghost.reporter,
        department: ghost.department,
        geography: ghost.geography,
        risk_type: typeof ghost.riskType === 'string' ? [ghost.riskType] : ghost.riskType,
        url: null,
        page_title: ghost.title,
        timestamp,
        date_reported: dateReported,
        status: ghost.status as GhostStatus,
        assigned_to: ghost.assignedTo,
        resolution_notes: ghost.resolutionNotes,
        screenshot: null
      };

      if (ghost.status === 'Resolved') {
        const resolutionDays = Math.floor(daysAgo * 0.7);
        const resolveDate = new Date(reportDate.getTime() + resolutionDays * 24 * 60 * 60 * 1000);
        ghostData.date_resolved = resolveDate.toISOString();
        ghostData.resolved_at = resolveDate.toISOString();
        ghostData.actual_resolution_time = resolutionDays;
        ghostData.resolved_by = ghost.assignedTo;
      }

      try {
        const { error } = await supabase.from('ghosts').insert(ghostData);
        if (error) throw error;
        count++;
        console.log(`Added ghost ${count}/${deelGhostsData.length}: ${ghost.title}`);
      } catch (error) {
        console.error(`Error adding ghost ${ghost.id}:`, error);
      }
    }

    console.log(`✅ Successfully seeded ${count} ghost reports!`);
    return count;
  } catch (error) {
    console.error('Error seeding demo data:', error);
    throw error;
  }
}
