import { Trophy, Award, Zap } from 'lucide-react';
import { useLeaderboard } from '../hooks/useUserProfile';

interface LeaderboardProps {
  currentUserId: string | null;
  onClose: () => void;
}

export function Leaderboard({ currentUserId, onClose }: LeaderboardProps) {
  const { leaderboard, loading } = useLeaderboard();

  const getAvatarColor = (index: number) => {
    const colors = [
      'bg-yellow-500',
      'bg-gray-400',
      'bg-orange-600',
      'bg-blue-500',
      'bg-green-500',
      'bg-purple-500',
      'bg-pink-500',
      'bg-indigo-500',
      'bg-red-500',
      'bg-teal-500',
    ];
    return colors[index % colors.length];
  };

  const getRankIcon = (rank: number) => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return `#${rank}`;
  };

  if (loading) {
    return (
      <div className="fixed inset-y-0 right-0 w-96 bg-white shadow-2xl z-50 animate-slide-in-right">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Trophy className="text-yellow-500" size={28} />
              Leaderboard
            </h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 text-2xl"
            >
              ×
            </button>
          </div>
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-y-0 right-0 w-96 bg-gradient-to-b from-blue-50 to-white shadow-2xl z-50 animate-slide-in-right overflow-y-auto">
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Trophy className="text-yellow-500" size={28} />
            Leaderboard
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl font-bold"
          >
            ×
          </button>
        </div>

        <div className="space-y-3">
          {leaderboard.map((user, index) => {
            const isCurrentUser = user.userId === currentUserId;
            return (
              <div
                key={user.userId}
                className={`bg-white rounded-lg p-4 shadow-sm border-2 transition-all animate-fade-in-up ${
                  isCurrentUser
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-blue-300'
                }`}
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <div className="flex items-center gap-3">
                  <div className="text-2xl font-bold w-12 text-center">
                    {getRankIcon(index + 1)}
                  </div>
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold ${getAvatarColor(index)}`}>
                    {user.displayName.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold text-gray-900 flex items-center gap-2">
                      {user.displayName}
                      {isCurrentUser && (
                        <span className="text-xs bg-blue-500 text-white px-2 py-0.5 rounded-full">
                          You
                        </span>
                      )}
                    </div>
                    <div className="text-sm text-gray-600 flex items-center gap-3">
                      <span className="flex items-center gap-1">
                        <Zap size={14} className="text-yellow-500" />
                        {user.totalPoints} pts
                      </span>
                      <span className="text-gray-400">•</span>
                      <span>Level {user.level}</span>
                      <span className="text-gray-400">•</span>
                      <span>{user.stats.ghostsResolved} ghosts</span>
                    </div>
                  </div>
                  {user.badges.length > 0 && (
                    <div className="flex items-center gap-1">
                      <Award size={16} className="text-purple-500" />
                      <span className="text-sm font-semibold text-purple-600">
                        {user.badges.length}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {leaderboard.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <Trophy size={48} className="mx-auto mb-3 text-gray-300" />
            <p>No players yet!</p>
            <p className="text-sm">Be the first to resolve a ghost.</p>
          </div>
        )}
      </div>
    </div>
  );
}
