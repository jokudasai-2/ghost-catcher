import { Calendar, User, AlertCircle, ExternalLink, Zap } from 'lucide-react';
import type { Ghost } from '../types/ghost';
import { calculatePoints } from '../utils/points';
import { useState, useEffect } from 'react';

interface GhostListItemProps {
  ghost: Ghost;
  onClick: () => void;
  isGameMode?: boolean;
  previousStatus?: Ghost['status'];
}

export function GhostListItem({ ghost, onClick, isGameMode = false, previousStatus }: GhostListItemProps) {
  const [animationClass, setAnimationClass] = useState('');

  useEffect(() => {
    if (previousStatus && previousStatus !== ghost.status) {
      if (ghost.status === 'In Progress') {
        setAnimationClass('animate-capture');
      } else if (ghost.status === 'Resolved') {
        setAnimationClass('animate-exorcise');
      }

      const timer = setTimeout(() => setAnimationClass(''), 600);
      return () => clearTimeout(timer);
    }
  }, [ghost.status, previousStatus]);

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

  const potentialPoints = isGameMode && ghost.status !== 'Resolved' ? calculatePoints(ghost).totalPoints : null;

  return (
    <div
      onClick={onClick}
      className={`bg-white rounded-lg shadow-sm border border-gray-200 p-3 hover:shadow-md transition-all cursor-pointer hover:border-blue-300 ${animationClass}`}
    >
      <div className="flex items-center gap-4">
        <div className="flex-shrink-0">
          <span className="font-mono text-xs font-semibold text-gray-500">{ghost.id}</span>
        </div>

        <div className="flex-shrink-0">
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(ghost.status)}`}>
            {ghost.status}
          </span>
        </div>

        <div className="flex-1 min-w-0">
          <h3 className="text-base font-semibold text-gray-900 truncate">{ghost.title}</h3>
          <p className="text-sm text-gray-600 truncate">{ghost.description}</p>
        </div>

        <div className="flex items-center gap-4 flex-shrink-0">
          <div className="flex items-center gap-1 text-xs text-gray-500">
            <User size={12} />
            <span>{ghost.reporter}</span>
          </div>

          <div className="flex items-center gap-1 text-xs text-gray-500">
            <Calendar size={12} />
            <span>{ghost.daysOpen}d</span>
          </div>

          <div className="flex items-center gap-1 text-xs">
            <span className="px-2 py-0.5 bg-gray-100 rounded text-gray-700">{ghost.category}</span>
          </div>

          <div className={`flex items-center gap-1 ${getImpactColor(ghost.impact)}`}>
            <AlertCircle size={16} />
            <span className="text-sm font-semibold">{ghost.impact}</span>
          </div>

          {potentialPoints && (
            <div className="flex items-center gap-1 text-yellow-600 bg-yellow-50 px-2 py-1 rounded-full">
              <Zap size={14} />
              <span className="text-xs font-bold">+{potentialPoints}</span>
            </div>
          )}

          {ghost.url && (
            <a
              href={ghost.url}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="flex items-center gap-1 text-blue-600 hover:text-blue-800"
              title={ghost.pageTitle || ghost.url}
            >
              <ExternalLink size={16} />
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
