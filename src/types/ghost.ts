export type GhostStatus = 'New' | 'In Progress' | 'Resolved' | 'Archived';

export type GhostCategory =
  | 'Process Inefficiency'
  | 'Technical Issue'
  | 'Communication Gap'
  | 'Data Quality'
  | 'User Experience'
  | 'Compliance Risk'
  | 'Other';

export interface Ghost {
  id: string;
  firestoreId?: string;
  title: string;
  description: string;
  category: GhostCategory;
  impact: number;
  effort: number;
  email: string;
  reporterEmail: string;
  reporter: string;
  department: string;
  geography: string;
  riskType: string[];
  url: string;
  pageTitle: string;
  timestamp: string;
  dateReported: string;
  status: GhostStatus;
  assignedTo: string | null;
  resolutionNotes: string;
  daysOpen: number;
  screenshot?: string | null;
  resolvedBy?: string;
  resolvedAt?: string;
  pointsAwarded?: number;
}

export interface GhostFilters {
  status: GhostStatus | 'All';
  category: GhostCategory | 'All';
  searchQuery: string;
  impactMin: number;
}

export interface GhostStats {
  total: number;
  byStatus: Record<GhostStatus, number>;
  byCategory: Record<string, number>;
  averageResolutionTime: number;
  recentGhosts: Ghost[];
}
