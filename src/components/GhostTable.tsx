import { useState } from 'react';
import { Calendar, User, AlertCircle, ExternalLink, Zap, Flag, AlertTriangle, ChevronUp, ChevronDown } from 'lucide-react';
import type { Ghost, GhostPriority } from '../types/ghost';
import { calculatePoints } from '../utils/points';

interface GhostTableProps {
  ghosts: Ghost[];
  onClick: (ghost: Ghost) => void;
  isGameMode?: boolean;
  previousStatuses?: Map<string, Ghost['status']>;
}

type SortField = 'id' | 'title' | 'status' | 'impact' | 'daysOpen' | 'reporter' | 'priority' | 'category';
type SortDirection = 'asc' | 'desc' | null;

export function GhostTable({ ghosts, onClick, isGameMode = false, previousStatuses }: GhostTableProps) {
  const [sortField, setSortField] = useState<SortField | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>(null);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      if (sortDirection === 'asc') {
        setSortDirection('desc');
      } else if (sortDirection === 'desc') {
        setSortDirection(null);
        setSortField(null);
      }
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const sortedGhosts = [...ghosts].sort((a, b) => {
    if (!sortField || !sortDirection) return 0;

    let aValue: any = a[sortField];
    let bValue: any = b[sortField];

    if (sortField === 'priority') {
      const priorityOrder = { 'Critical': 0, 'High': 1, 'Medium': 2, 'Low': 3 };
      aValue = priorityOrder[a.priority || 'Medium'];
      bValue = priorityOrder[b.priority || 'Medium'];
    }

    if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
    return 0;
  });

  const getStatusColor = (status: Ghost['status']) => {
    switch (status) {
      case 'New':
        return 'bg-blue-100 text-blue-800';
      case 'In Progress':
        return 'bg-yellow-100 text-yellow-800';
      case 'Resolved':
        return 'bg-green-100 text-green-800';
      case 'Archived':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getImpactColor = (impact: number) => {
    if (isGameMode) {
      if (impact >= 4) return 'text-red-400';
      if (impact >= 3) return 'text-orange-400';
      return 'text-yellow-400';
    }
    if (impact >= 4) return 'text-red-600';
    if (impact >= 3) return 'text-orange-600';
    return 'text-yellow-600';
  };

  const getPriorityColor = (priority?: GhostPriority) => {
    if (!priority) return 'bg-gray-100 text-gray-700';
    switch (priority) {
      case 'Low':
        return 'bg-gray-100 text-gray-700';
      case 'Medium':
        return 'bg-blue-100 text-blue-700';
      case 'High':
        return 'bg-orange-100 text-orange-700';
      case 'Critical':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) {
      return <div className="w-4 h-4" />;
    }
    return sortDirection === 'asc' ? (
      <ChevronUp size={16} />
    ) : (
      <ChevronDown size={16} />
    );
  };

  const thClassName = `px-3 py-3 text-left text-xs font-semibold uppercase tracking-wider cursor-pointer hover:bg-opacity-70 transition-colors ${
    isGameMode
      ? 'text-cyan-400 border-b border-cyan-500/30 font-mono'
      : 'text-gray-700 border-b border-gray-200'
  }`;

  const tdClassName = `px-3 py-3 text-sm ${
    isGameMode ? 'text-cyan-300/90 border-b border-cyan-500/10' : 'text-gray-900 border-b border-gray-100'
  }`;

  return (
    <div className={`rounded-lg shadow-sm overflow-hidden ${
      isGameMode
        ? 'glass-panel border border-cyan-500/30'
        : 'bg-white border border-gray-200'
    }`}>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className={isGameMode ? 'bg-slate-800/50' : 'bg-gray-50'}>
            <tr>
              <th
                className={thClassName}
                onClick={() => handleSort('id')}
              >
                <div className="flex items-center gap-1">
                  <span>ID</span>
                  <SortIcon field="id" />
                </div>
              </th>
              <th
                className={`${thClassName} hidden lg:table-cell`}
                onClick={() => handleSort('title')}
              >
                <div className="flex items-center gap-1">
                  <span>Title</span>
                  <SortIcon field="title" />
                </div>
              </th>
              <th
                className={thClassName}
                onClick={() => handleSort('status')}
              >
                <div className="flex items-center gap-1">
                  <span>Status</span>
                  <SortIcon field="status" />
                </div>
              </th>
              {!isGameMode && (
                <th
                  className={`${thClassName} hidden md:table-cell`}
                  onClick={() => handleSort('priority')}
                >
                  <div className="flex items-center gap-1">
                    <span>Priority</span>
                    <SortIcon field="priority" />
                  </div>
                </th>
              )}
              <th
                className={`${thClassName} hidden sm:table-cell`}
                onClick={() => handleSort('category')}
              >
                <div className="flex items-center gap-1">
                  <span>Category</span>
                  <SortIcon field="category" />
                </div>
              </th>
              <th
                className={thClassName}
                onClick={() => handleSort('impact')}
              >
                <div className="flex items-center gap-1">
                  <span>{isGameMode ? 'Threat' : 'Impact'}</span>
                  <SortIcon field="impact" />
                </div>
              </th>
              <th
                className={`${thClassName} hidden md:table-cell`}
                onClick={() => handleSort('daysOpen')}
              >
                <div className="flex items-center gap-1">
                  <span>Age</span>
                  <SortIcon field="daysOpen" />
                </div>
              </th>
              <th
                className={`${thClassName} hidden lg:table-cell`}
                onClick={() => handleSort('reporter')}
              >
                <div className="flex items-center gap-1">
                  <span>Reporter</span>
                  <SortIcon field="reporter" />
                </div>
              </th>
              <th className={`${thClassName} text-right`}>
                <span>{isGameMode ? 'XP' : 'Actions'}</span>
              </th>
            </tr>
          </thead>
          <tbody className={isGameMode ? 'bg-slate-900/30' : 'bg-white divide-y divide-gray-100'}>
            {sortedGhosts.map((ghost) => {
              const potentialPoints = isGameMode && ghost.status !== 'Resolved' ? calculatePoints(ghost).totalPoints : null;

              return (
                <tr
                  key={ghost.id}
                  onClick={() => onClick(ghost)}
                  className={`cursor-pointer transition-colors ${
                    isGameMode
                      ? 'hover:bg-cyan-500/10'
                      : 'hover:bg-blue-50'
                  }`}
                >
                  <td className={tdClassName}>
                    <span className={`font-mono text-xs font-semibold ${
                      isGameMode ? 'text-cyan-400' : 'text-gray-600'
                    }`}>
                      {ghost.id}
                    </span>
                  </td>
                  <td className={`${tdClassName} hidden lg:table-cell max-w-xs`}>
                    <div className="flex flex-col">
                      <span className="font-medium truncate">{ghost.title}</span>
                      <span className={`text-xs truncate ${
                        isGameMode ? 'text-cyan-400/60' : 'text-gray-500'
                      }`}>
                        {ghost.description}
                      </span>
                    </div>
                  </td>
                  <td className={tdClassName}>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium inline-flex items-center gap-1 ${
                      isGameMode ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/50 font-mono' : getStatusColor(ghost.status)
                    }`}>
                      {isGameMode ? ghost.status.toUpperCase() : ghost.status}
                    </span>
                  </td>
                  {!isGameMode && (
                    <td className={`${tdClassName} hidden md:table-cell`}>
                      {ghost.priority && (
                        <span className={`px-2 py-1 rounded-full text-xs font-medium inline-flex items-center gap-1 ${getPriorityColor(ghost.priority)}`}>
                          <Flag size={10} />
                          {ghost.priority}
                        </span>
                      )}
                    </td>
                  )}
                  <td className={`${tdClassName} hidden sm:table-cell`}>
                    <span className={`text-xs ${isGameMode ? 'text-cyan-400/70' : 'text-gray-600'}`}>
                      {ghost.category}
                    </span>
                  </td>
                  <td className={tdClassName}>
                    <div className={`flex items-center gap-1 ${getImpactColor(ghost.impact)}`}>
                      <AlertCircle size={14} />
                      <span className="font-semibold">{ghost.impact}/5</span>
                    </div>
                  </td>
                  <td className={`${tdClassName} hidden md:table-cell`}>
                    <div className={`flex items-center gap-1 ${isGameMode ? 'text-cyan-400/70' : 'text-gray-600'}`}>
                      <Calendar size={12} />
                      <span className="text-xs">{ghost.daysOpen}d</span>
                    </div>
                  </td>
                  <td className={`${tdClassName} hidden lg:table-cell`}>
                    <div className={`flex items-center gap-1 ${isGameMode ? 'text-cyan-400/70' : 'text-gray-600'}`}>
                      <User size={12} />
                      <span className="text-xs">{ghost.reporter}</span>
                    </div>
                  </td>
                  <td className={`${tdClassName} text-right`}>
                    <div className="flex items-center justify-end gap-2">
                      {potentialPoints && (
                        <div className={`flex items-center gap-1 px-2 py-1 rounded-full ${
                          isGameMode
                            ? 'text-cyan-400 bg-cyan-500/20 border border-cyan-500/50'
                            : 'text-yellow-600 bg-yellow-50'
                        }`}>
                          <Zap size={12} />
                          <span className="text-xs font-bold">+{potentialPoints}</span>
                        </div>
                      )}
                      {ghost.escalated && (
                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                          isGameMode
                            ? 'bg-red-500/20 text-red-400 border border-red-500/50'
                            : 'bg-red-50 text-red-700 border border-red-200'
                        }`}>
                          <AlertTriangle size={10} />
                        </span>
                      )}
                      {ghost.url && (
                        <a
                          href={ghost.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className={`flex items-center gap-1 ${
                            isGameMode ? 'text-cyan-400 hover:text-cyan-300' : 'text-blue-600 hover:text-blue-800'
                          }`}
                          title={ghost.pageTitle || ghost.url}
                        >
                          <ExternalLink size={14} />
                        </a>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
