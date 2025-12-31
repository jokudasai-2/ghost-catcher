import { LucideIcon } from 'lucide-react';
import { useGameMode } from '../contexts/GameModeContext';

interface StatCardProps {
  title: string;
  value: number | string;
  icon: LucideIcon;
  trend?: string;
  color?: string;
}

export function StatCard({ title, value, icon: Icon, trend, color = 'blue' }: StatCardProps) {
  const { isGameMode } = useGameMode();

  const colorClasses = {
    blue: isGameMode ? 'text-cyan-400' : 'text-blue-600',
    green: isGameMode ? 'text-green-400' : 'text-green-600',
    red: isGameMode ? 'text-red-400' : 'text-red-600',
    yellow: isGameMode ? 'text-yellow-400' : 'text-yellow-600',
    orange: isGameMode ? 'text-orange-400' : 'text-orange-600',
  };

  const getBorderColor = () => {
    if (!isGameMode) return '';

    switch (color) {
      case 'red':
        return 'border-l-4 border-l-red-500';
      case 'yellow':
        return 'border-l-4 border-l-yellow-500';
      case 'orange':
        return 'border-l-4 border-l-orange-500';
      case 'green':
        return 'border-l-4 border-l-green-500';
      default:
        return 'border-l-4 border-l-cyan-500';
    }
  };

  return (
    <div className={`rounded-lg px-3 py-2 transition-all ${
      isGameMode
        ? `glass-panel border border-cyan-500/30 hover:border-cyan-500/50 ${getBorderColor()}`
        : 'bg-white border border-gray-200 hover:border-gray-300'
    }`}>
      <div className="flex items-center gap-2">
        <Icon size={16} className={colorClasses[color as keyof typeof colorClasses] || colorClasses.blue} />
        <div className="flex-1 min-w-0">
          <p className={`text-xs truncate ${
            isGameMode ? 'text-cyan-400/70 font-mono' : 'text-gray-500'
          }`}>{title}</p>
          <p className={`text-lg font-semibold ${
            isGameMode ? 'text-cyan-300 glow-text-cyan' : 'text-gray-900'
          }`}>{value}</p>
        </div>
      </div>
      {trend && (
        <p className={`text-xs mt-1 truncate ${
          isGameMode ? 'text-cyan-400/60 font-mono' : 'text-gray-500'
        }`}>{trend}</p>
      )}
    </div>
  );
}
