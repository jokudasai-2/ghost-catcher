import { Calendar, User, AlertCircle, ExternalLink, Zap } from 'lucide-react';
import type { Ghost } from '../types/ghost';
import { calculatePoints } from '../utils/points';
import { useState, useEffect } from 'react';

interface GhostCardProps {
  ghost: Ghost;
  onClick: () => void;
  isGameMode?: boolean;
  previousStatus?: Ghost['status'];
}

export function GhostCard({ ghost, onClick, isGameMode = false, previousStatus }: GhostCardProps) {
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
    if (isGameMode) {
      if (impact >= 4) return 'text-red-400';
      if (impact >= 3) return 'text-orange-400';
      return 'text-yellow-400';
    }
    if (impact >= 4) return 'text-red-600';
    if (impact >= 3) return 'text-orange-600';
    return 'text-yellow-600';
  };

  const getBorderColorClass = (impact: number) => {
    if (!isGameMode) return '';
    if (impact >= 4) return 'border-l-4 border-l-red-500';
    if (impact >= 3) return 'border-l-4 border-l-orange-500';
    return 'border-l-4 border-l-green-500';
  };

  const getRarityBadge = (impact: number) => {
    if (!isGameMode) return null;
    if (impact >= 5) return { label: 'LEGENDARY', color: 'bg-purple-500/20 text-purple-400 border-purple-500' };
    if (impact >= 4) return { label: 'RARE', color: 'bg-red-500/20 text-red-400 border-red-500' };
    if (impact >= 3) return { label: 'UNCOMMON', color: 'bg-orange-500/20 text-orange-400 border-orange-500' };
    return { label: 'COMMON', color: 'bg-green-500/20 text-green-400 border-green-500' };
  };

  const potentialPoints = isGameMode && ghost.status !== 'Resolved' ? calculatePoints(ghost).totalPoints : null;
  const rarityBadge = getRarityBadge(ghost.impact);

  return (
    <div
      onClick={onClick}
      className={`rounded-lg shadow-sm p-5 transition-all cursor-pointer ${animationClass} ${
        isGameMode
          ? `glass-panel border border-cyan-500/30 hover:border-cyan-500/60 hover:shadow-cyan-500/20 ${getBorderColorClass(ghost.impact)}`
          : 'bg-white border border-gray-200 hover:shadow-lg hover:border-blue-300'
      }`}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <span className={`font-mono text-xs font-semibold ${
              isGameMode ? 'text-cyan-400' : 'text-gray-500'
            }`}>{ghost.id}</span>
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
              isGameMode ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/50 font-mono' : getStatusColor(ghost.status)
            }`}>
              {isGameMode ? ghost.status.toUpperCase() : ghost.status}
            </span>
            {rarityBadge && (
              <span className={`px-2 py-1 rounded text-xs font-bold border ${rarityBadge.color}`}>
                {rarityBadge.label}
              </span>
            )}
          </div>
          <h3 className={`text-lg font-semibold mb-2 ${
            isGameMode ? 'text-cyan-300 font-mono' : 'text-gray-900'
          }`}>{ghost.title}</h3>
          <p className={`text-sm line-clamp-2 ${
            isGameMode ? 'text-cyan-400/70' : 'text-gray-600'
          }`}>{ghost.description}</p>
        </div>
        <div className="ml-4 flex flex-col items-end gap-1">
          <div className={`flex items-center gap-1 ${getImpactColor(ghost.impact)}`}>
            <AlertCircle size={16} />
            <span className={`text-sm font-semibold ${isGameMode ? 'font-mono' : ''}`}>
              {isGameMode ? 'THREAT:' : 'Impact:'} {ghost.impact}/5
            </span>
          </div>
          {potentialPoints && (
            <div className={`flex items-center gap-1 px-2 py-1 rounded-full ${
              isGameMode
                ? 'text-cyan-400 bg-cyan-500/20 border border-cyan-500/50 glow-border-cyan'
                : 'text-yellow-600 bg-yellow-50'
            }`}>
              <Zap size={14} />
              <span className={`text-xs font-bold ${isGameMode ? 'font-mono' : ''}`}>
                +{potentialPoints} {isGameMode ? 'XP' : 'pts'}
              </span>
            </div>
          )}
        </div>
      </div>

      <div className={`flex items-center gap-3 text-xs mt-3 ${
        isGameMode ? 'text-cyan-400/70 font-mono' : 'text-gray-500'
      }`}>
        <div className="flex items-center gap-1">
          <User size={12} />
          <span>{ghost.reporter}</span>
        </div>
        <div className="flex items-center gap-1">
          <Calendar size={12} />
          <span>{ghost.daysOpen}d</span>
        </div>
        <span className={`px-2 py-0.5 rounded ${
          isGameMode
            ? 'bg-slate-800/50 text-cyan-300 border border-cyan-500/30'
            : 'bg-gray-100 text-gray-700'
        }`}>{ghost.category}</span>
      </div>

      {ghost.url && (
        <div className="mt-2">
          <a
            href={ghost.url}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className={`flex items-center gap-1 text-xs ${
              isGameMode
                ? 'text-cyan-400 hover:text-cyan-300 font-mono'
                : 'text-blue-600 hover:text-blue-800'
            }`}
          >
            <ExternalLink size={12} />
            <span className="truncate">{ghost.pageTitle || ghost.url}</span>
          </a>
        </div>
      )}
    </div>
  );
}
