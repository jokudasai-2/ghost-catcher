import { Calendar, User, AlertCircle, ExternalLink, Zap, Flag, AlertTriangle } from 'lucide-react';
import type { Ghost, GhostPriority } from '../types/ghost';
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

  const potentialPoints = isGameMode && ghost.status !== 'Resolved' ? calculatePoints(ghost).totalPoints : null;

  return (
    <div
      onClick={onClick}
      className={`bg-white rounded-lg shadow-sm border border-gray-200 p-2.5 sm:p-3 hover:shadow-md transition-all cursor-pointer hover:border-blue-300 ${animationClass}`}
    >
      <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
        <div className="flex items-center gap-2 sm:gap-4 flex-wrap">
          <div className="flex-shrink-0">
            <span className="font-mono text-xs font-semibold text-gray-500">{ghost.id}</span>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
            <span className={`px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full text-xs font-medium ${getStatusColor(ghost.status)}`}>
              {ghost.status}
            </span>
            {!isGameMode && ghost.priority && (
              <span className={`px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full text-xs font-medium ${getPriorityColor(ghost.priority)}`}>
                <Flag size={10} className="inline mr-1" />
                {ghost.priority}
              </span>
            )}
            {ghost.escalated && (
              <span className={`inline-flex items-center gap-1 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full text-xs font-medium ${
                isGameMode
                  ? 'bg-red-500/20 text-red-400 border border-red-500/50 font-mono'
                  : 'bg-red-50 text-red-700 border border-red-200'
              }`}>
                <AlertTriangle size={10} />
                {isGameMode ? 'ESCALATED' : 'Escalated'}
              </span>
            )}
          </div>
        </div>

        <div className="flex-1 min-w-0">
          <h3 className="text-sm sm:text-base font-semibold text-gray-900 truncate">{ghost.title}</h3>
          <p className="text-xs sm:text-sm text-gray-600 truncate">{ghost.description}</p>
        </div>

        <div className="flex items-center gap-2 sm:gap-3 lg:gap-4 flex-wrap text-xs">
          <div className="flex items-center gap-1 text-gray-500">
            <User size={12} />
            <span className="hidden sm:inline">{ghost.reporter}</span>
          </div>

          <div className="flex items-center gap-1 text-gray-500">
            <Calendar size={12} />
            <span>{ghost.daysOpen}d</span>
          </div>

          <div className={`flex items-center gap-1 ${getImpactColor(ghost.impact)}`}>
            <AlertCircle size={14} />
            <span className="text-sm font-semibold">{ghost.impact}</span>
          </div>

          {potentialPoints && (
            <div className="flex items-center gap-1 text-yellow-600 bg-yellow-50 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full">
              <Zap size={12} />
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
              <ExternalLink size={14} />
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
