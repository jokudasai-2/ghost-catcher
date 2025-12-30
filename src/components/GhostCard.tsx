import { Calendar, User, AlertCircle, ExternalLink } from 'lucide-react';
import type { Ghost } from '../types/ghost';

interface GhostCardProps {
  ghost: Ghost;
  onClick: () => void;
}

export function GhostCard({ ghost, onClick }: GhostCardProps) {
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
    if (impact >= 4) return 'text-red-600';
    if (impact >= 3) return 'text-orange-600';
    return 'text-yellow-600';
  };

  return (
    <div
      onClick={onClick}
      className="bg-white rounded-lg shadow-sm border border-gray-200 p-5 hover:shadow-lg transition-all cursor-pointer hover:border-blue-300"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <span className="font-mono text-xs font-semibold text-gray-500">{ghost.id}</span>
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(ghost.status)}`}>
              {ghost.status}
            </span>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">{ghost.title}</h3>
          <p className="text-sm text-gray-600 line-clamp-2">{ghost.description}</p>
        </div>
        <div className="ml-4 flex flex-col items-end gap-1">
          <div className={`flex items-center gap-1 ${getImpactColor(ghost.impact)}`}>
            <AlertCircle size={16} />
            <span className="text-sm font-semibold">Impact: {ghost.impact}/5</span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4 text-xs text-gray-500 mt-4 pt-4 border-t border-gray-100">
        <div className="flex items-center gap-1">
          <User size={14} />
          <span>{ghost.reporter}</span>
        </div>
        <div className="flex items-center gap-1">
          <Calendar size={14} />
          <span>{ghost.daysOpen} days open</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="px-2 py-0.5 bg-gray-100 rounded text-gray-700">{ghost.category}</span>
        </div>
      </div>

      {ghost.url && (
        <div className="mt-3 pt-3 border-t border-gray-100">
          <a
            href={ghost.url}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800"
          >
            <ExternalLink size={12} />
            <span className="truncate">{ghost.pageTitle || ghost.url}</span>
          </a>
        </div>
      )}
    </div>
  );
}
