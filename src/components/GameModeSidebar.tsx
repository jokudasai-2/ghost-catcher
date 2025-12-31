import { Trophy, Award, Zap, X, Ghost, Target, TrendingUp, Menu } from 'lucide-react';
import { useLeaderboard } from '../hooks/useUserProfile';
import type { User } from '../types/game';

interface GameModeSidebarProps {
  user: User | null;
  currentUserId: string | null;
  onExitGameMode: () => void;
  isOpen: boolean;
  onToggle: () => void;
}

export function GameModeSidebar({ user, currentUserId, onExitGameMode, isOpen, onToggle }: GameModeSidebarProps) {
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

  return (
    <>
      <button
        onClick={onToggle}
        className="fixed top-4 right-4 z-40 bg-cyan-500/20 border-2 border-cyan-500 text-cyan-400 p-3 rounded-lg shadow-lg hover:shadow-cyan-500/50 transition-all hover:scale-105 animate-pulse-glow-cyan"
        title="Toggle Game Stats"
      >
        <Menu size={24} />
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-40 backdrop-blur-sm"
            onClick={onToggle}
          />

          <div className="fixed inset-y-0 right-0 w-96 bg-gradient-to-b from-gray-900 via-slate-800 to-gray-900 shadow-2xl z-50 animate-slide-in-right overflow-y-auto border-l border-cyan-500/30">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold font-mono text-cyan-400 flex items-center gap-2 glow-text-cyan">
                  <Ghost className="text-cyan-400" size={28} />
                  BUSTER HQ
                </h2>
                <button
                  onClick={onToggle}
                  className="text-cyan-400 hover:text-cyan-300 text-2xl font-bold transition-colors"
                >
                  ×
                </button>
              </div>

              {user ? (
                <>
                  <div className="glass-panel border border-cyan-500/30 text-cyan-300 rounded-xl p-6 mb-6 shadow-lg">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-16 h-16 bg-cyan-500/20 border-2 border-cyan-500 rounded-full flex items-center justify-center text-3xl font-bold backdrop-blur-sm text-cyan-400">
                        {user.displayName.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h3 className="text-xl font-bold font-mono text-cyan-300">{user.displayName}</h3>
                        <p className="text-cyan-400/70 text-sm font-mono">OPERATIVE</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div className="bg-slate-800/50 border border-cyan-500/30 rounded-lg p-2 backdrop-blur-sm">
                        <div className="flex items-center gap-1 mb-1">
                          <Zap size={14} className="text-cyan-400" />
                          <span className="text-xs text-cyan-400/70 font-mono">XP</span>
                        </div>
                        <div className="text-xl font-bold text-cyan-400 glow-text-cyan">{user.totalPoints}</div>
                      </div>

                      <div className="bg-slate-800/50 border border-cyan-500/30 rounded-lg p-2 backdrop-blur-sm">
                        <div className="flex items-center gap-1 mb-1">
                          <TrendingUp size={14} className="text-cyan-400" />
                          <span className="text-xs text-cyan-400/70 font-mono">LVL</span>
                        </div>
                        <div className="text-xl font-bold text-cyan-400 glow-text-cyan">{user.level}</div>
                      </div>

                      <div className="bg-slate-800/50 border border-cyan-500/30 rounded-lg p-2 backdrop-blur-sm">
                        <div className="flex items-center gap-1 mb-1">
                          <Target size={14} className="text-cyan-400" />
                          <span className="text-xs text-cyan-400/70 font-mono">CAUGHT</span>
                        </div>
                        <div className="text-xl font-bold text-cyan-400 glow-text-cyan">{user.stats.ghostsResolved}</div>
                      </div>

                      <div className="bg-slate-800/50 border border-cyan-500/30 rounded-lg p-2 backdrop-blur-sm">
                        <div className="flex items-center gap-1 mb-1">
                          <Award size={14} className="text-cyan-400" />
                          <span className="text-xs text-cyan-400/70 font-mono">BADGES</span>
                        </div>
                        <div className="text-xl font-bold text-cyan-400 glow-text-cyan">{user.badges.length}</div>
                      </div>
                    </div>

                    {user.stats.longestStreak > 0 && (
                      <div className="mt-3 text-sm text-cyan-400/70 font-mono">
                        <span className="font-semibold text-cyan-400">STREAK:</span> {user.stats.longestStreak} DAYS
                      </div>
                    )}
                  </div>

                  {user.badges.length > 0 && (
                    <div className="mb-6">
                      <h3 className="text-lg font-bold font-mono text-cyan-400 mb-3 flex items-center gap-2">
                        <Award className="text-cyan-400" size={20} />
                        ACHIEVEMENTS
                      </h3>
                      <div className="grid grid-cols-2 gap-2">
                        {user.badges.map((badge) => (
                          <div
                            key={badge.id}
                            className="glass-panel rounded-lg p-3 border border-cyan-500/30 hover:border-cyan-500/50 transition-all hover:shadow-cyan-500/20"
                            title={badge.description}
                          >
                            <div className="text-2xl mb-1">{badge.icon}</div>
                            <div className="text-xs font-semibold font-mono text-cyan-300 line-clamp-1">
                              {badge.name}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="mb-6">
                    <h3 className="text-lg font-bold font-mono text-cyan-400 mb-3 flex items-center gap-2">
                      <Trophy className="text-yellow-400" size={20} />
                      LEADERBOARD
                    </h3>

                    {loading ? (
                      <div className="text-center py-8">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500 mx-auto"></div>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {leaderboard.slice(0, 10).map((leaderUser, index) => {
                          const isCurrentUser = leaderUser.userId === currentUserId;
                          return (
                            <div
                              key={leaderUser.userId}
                              className={`glass-panel rounded-lg p-3 shadow-sm border transition-all ${
                                isCurrentUser
                                  ? 'border-cyan-500 bg-cyan-500/10'
                                  : 'border-cyan-500/30 hover:border-cyan-500/50'
                              }`}
                            >
                              <div className="flex items-center gap-2">
                                <div className="text-lg font-bold font-mono w-8 text-center text-cyan-400">
                                  {getRankIcon(index + 1)}
                                </div>
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold border-2 border-cyan-500 ${
                                  index < 3 ? 'bg-gradient-to-br from-cyan-500 to-cyan-700' : 'bg-slate-700'
                                }`}>
                                  {leaderUser.displayName.charAt(0).toUpperCase()}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="font-semibold text-sm font-mono text-cyan-300 flex items-center gap-1 truncate">
                                    <span className="truncate">{leaderUser.displayName}</span>
                                    {isCurrentUser && (
                                      <span className="text-xs bg-cyan-500 text-white px-1.5 py-0.5 rounded-full flex-shrink-0">
                                        YOU
                                      </span>
                                    )}
                                  </div>
                                  <div className="text-xs text-cyan-400/70 font-mono flex items-center gap-2">
                                    <span className="flex items-center gap-1">
                                      <Zap size={12} className="text-yellow-400" />
                                      {leaderUser.totalPoints}
                                    </span>
                                    <span className="text-cyan-500">•</span>
                                    <span>LV.{leaderUser.level}</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          );
                        })}

                        {leaderboard.length === 0 && (
                          <div className="text-center py-8 text-cyan-400/70">
                            <Trophy size={48} className="mx-auto mb-3 text-cyan-500/30" />
                            <p className="font-mono">NO BUSTERS YET</p>
                            <p className="text-sm font-mono text-cyan-400/50">BE THE FIRST TO BUST</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500 mx-auto"></div>
                  <p className="text-cyan-400 mt-4 font-mono">LOADING PROFILE...</p>
                </div>
              )}

              <button
                onClick={onExitGameMode}
                className="w-full glass-panel border border-red-500/50 hover:border-red-500 text-red-400 hover:text-red-300 px-4 py-3 rounded-lg font-bold font-mono flex items-center justify-center gap-2 transition-all shadow-md hover:shadow-red-500/20"
              >
                <X size={20} />
                EXIT GAME MODE
              </button>
            </div>
          </div>
        </>
      )}
    </>
  );
}
