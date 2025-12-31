import { useState, useMemo, useEffect, useRef } from 'react';
import { Ghost, Search, Filter, TrendingUp, AlertTriangle, CheckCircle, Clock, Database, Plus, LayoutGrid, List, Flame } from 'lucide-react';
import { useGhosts } from './hooks/useGhosts';
import { StatCard } from './components/StatCard';
import { GhostCard } from './components/GhostCard';
import { GhostListItem } from './components/GhostListItem';
import { GhostDetailModal } from './components/GhostDetailModal';
import { ReportGhostModal } from './components/ReportGhostModal';
import type { Ghost as GhostType, GhostFilters } from './types/ghost';
import { seedDemoData } from './seedDemoData';
import { GameModeProvider, useGameMode } from './contexts/GameModeContext';
import { useUserProfile } from './hooks/useUserProfile';
import { GameModeHeader } from './components/GameModeHeader';
import { GameModeSidebar } from './components/GameModeSidebar';
import { UserSetupModal } from './components/UserSetupModal';
import { AchievementUnlockModal } from './components/AchievementUnlockModal';
import { calculatePoints } from './utils/points';
import type { Badge } from './types/game';

function AppContent() {
  const { ghosts, loading, error, updateGhostStatus, updateGhost, addGhost } = useGhosts();
  const { isGameMode, toggleGameMode, currentUserId, setCurrentUserId } = useGameMode();
  const { user, awardPoints, checkAndAwardAchievements } = useUserProfile(currentUserId);
  const [selectedGhost, setSelectedGhost] = useState<GhostType | null>(null);
  const [showReportModal, setShowReportModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<GhostFilters>({
    status: 'All',
    category: 'All',
    searchQuery: '',
    impactMin: 0,
  });
  const [showNotification, setShowNotification] = useState(false);
  const [newGhostId, setNewGhostId] = useState<string | null>(null);
  const previousGhostCount = useRef(ghosts.length);
  const [isSeeding, setIsSeeding] = useState(false);
  const [seedMessage, setSeedMessage] = useState('');
  const [showUserSetup, setShowUserSetup] = useState(false);
  const [showGameSidebar, setShowGameSidebar] = useState(false);
  const [unlockedBadge, setUnlockedBadge] = useState<Badge | null>(null);
  const previousGhostStatuses = useRef<Map<string, GhostType['status']>>(new Map());
  const [viewMode, setViewMode] = useState<'card' | 'list'>('card');

  useEffect(() => {
    document.title = isGameMode ? 'Ghost Catcher - Game Mode' : 'Ghost Catcher';
  }, [isGameMode]);

  useEffect(() => {
    if (ghosts.length > previousGhostCount.current && previousGhostCount.current > 0) {
      const newGhost = ghosts[0];
      setNewGhostId(newGhost.id);
      setShowNotification(true);
      setTimeout(() => setShowNotification(false), 5000);
    }
    previousGhostCount.current = ghosts.length;
  }, [ghosts]);

  useEffect(() => {
    if (!isGameMode || !currentUserId || !user) return;

    ghosts.forEach(ghost => {
      const previousStatus = previousGhostStatuses.current.get(ghost.id);

      if (previousStatus && previousStatus !== ghost.status && ghost.status === 'Resolved') {
        if (!ghost.resolvedBy || ghost.resolvedBy === currentUserId) {
          const points = calculatePoints(ghost);

          awardPoints(points.totalPoints, {
            userId: currentUserId,
            ghostId: ghost.id,
            activityType: 'resolved',
            pointsEarned: points.totalPoints,
            timestamp: new Date().toISOString(),
            metadata: { impact: ghost.impact, daysOpen: ghost.daysOpen },
          }).then(async () => {
            const newBadges = await checkAndAwardAchievements();
            if (newBadges && newBadges.length > 0) {
              setUnlockedBadge(newBadges[0]);
            }
          });

          updateGhost(ghost.id, {
            resolvedBy: currentUserId,
            resolvedAt: new Date().toISOString(),
            pointsAwarded: points.totalPoints,
          });
        }
      }

      previousGhostStatuses.current.set(ghost.id, ghost.status);
    });
  }, [ghosts, isGameMode, currentUserId, user]);

  const handleGameModeToggle = () => {
    if (!isGameMode && !currentUserId) {
      setShowUserSetup(true);
    } else {
      toggleGameMode();
      setShowGameSidebar(false);
    }
  };

  const handleUserSetup = (userId: string) => {
    setCurrentUserId(userId);
    setShowUserSetup(false);
    toggleGameMode();
    setShowGameSidebar(true);
  };

  const handleSeedData = async () => {
    setIsSeeding(true);
    setSeedMessage('');
    try {
      const count = await seedDemoData();
      setSeedMessage(`Successfully added ${count} demo ghosts!`);
      setTimeout(() => setSeedMessage(''), 5000);
    } catch (err) {
      setSeedMessage('Error seeding data. Check console for details.');
      console.error(err);
    } finally {
      setIsSeeding(false);
    }
  };

  const filteredGhosts = useMemo(() => {
    return ghosts.filter((ghost) => {
      if (filters.status !== 'All' && ghost.status !== filters.status) return false;
      if (filters.category !== 'All' && ghost.category !== filters.category) return false;
      if (filters.impactMin > 0 && ghost.impact < filters.impactMin) return false;
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        return (
          ghost.title.toLowerCase().includes(query) ||
          ghost.description.toLowerCase().includes(query) ||
          ghost.reporter.toLowerCase().includes(query) ||
          ghost.id.toLowerCase().includes(query)
        );
      }
      return true;
    });
  }, [ghosts, filters, searchQuery]);

  const stats = useMemo(() => {
    const byStatus = {
      New: 0,
      'In Progress': 0,
      Resolved: 0,
      Archived: 0,
    };

    const byCategory: Record<string, number> = {};

    let totalDaysOpen = 0;
    let resolvedCount = 0;

    const now = new Date();
    const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const previousMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const previousMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);

    let currentMonthDaysOpen = 0;
    let currentMonthResolvedCount = 0;
    let previousMonthDaysOpen = 0;
    let previousMonthResolvedCount = 0;

    let highImpactCount = 0;

    ghosts.forEach((ghost) => {
      byStatus[ghost.status]++;
      byCategory[ghost.category] = (byCategory[ghost.category] || 0) + 1;

      if (ghost.impact >= 4) {
        highImpactCount++;
      }

      if (ghost.status === 'Resolved') {
        totalDaysOpen += ghost.daysOpen;
        resolvedCount++;

        const resolvedDate = ghost.resolvedAt ? new Date(ghost.resolvedAt) : new Date(ghost.timestamp);

        if (resolvedDate >= currentMonthStart) {
          currentMonthDaysOpen += ghost.daysOpen;
          currentMonthResolvedCount++;
        } else if (resolvedDate >= previousMonthStart && resolvedDate <= previousMonthEnd) {
          previousMonthDaysOpen += ghost.daysOpen;
          previousMonthResolvedCount++;
        }
      }
    });

    const averageResolutionTime = resolvedCount > 0 ? Math.round(totalDaysOpen / resolvedCount) : 0;
    const currentMonthAvg = currentMonthResolvedCount > 0 ? currentMonthDaysOpen / currentMonthResolvedCount : 0;
    const previousMonthAvg = previousMonthResolvedCount > 0 ? previousMonthDaysOpen / previousMonthResolvedCount : 0;

    let resolutionTimeDelta = 0;
    if (previousMonthAvg > 0) {
      resolutionTimeDelta = ((currentMonthAvg - previousMonthAvg) / previousMonthAvg) * 100;
    }

    return {
      total: ghosts.length,
      byStatus,
      byCategory,
      averageResolutionTime,
      resolutionTimeDelta: Math.round(resolutionTimeDelta),
      highImpactCount,
    };
  }, [ghosts]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading Ghost Catcher...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 flex items-center justify-center">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-md">
          <AlertTriangle className="text-red-600 mx-auto mb-4" size={48} />
          <h2 className="text-xl font-bold text-gray-900 mb-2 text-center">Connection Error</h2>
          <p className="text-gray-600 text-center">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen relative ${
      isGameMode
        ? 'bg-gradient-to-br from-gray-900 via-slate-800 to-gray-900'
        : 'bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100'
    }`}>
      {isGameMode && (
        <>
          <div className="game-mode-scanline" />
          <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
            {[...Array(20)].map((_, i) => (
              <div
                key={i}
                className="game-mode-drift-dot"
                style={{
                  left: `${(i * 5) % 100}%`,
                  bottom: '0',
                  animationDelay: `${i * 0.6}s`,
                  animationDuration: `${10 + (i % 5) * 2}s`,
                }}
              />
            ))}
          </div>
        </>
      )}

      {showNotification && newGhostId && (
        <div className={`fixed top-4 right-4 z-50 px-6 py-4 rounded-lg shadow-2xl animate-slide-in-right flex items-center gap-3 ${
          isGameMode
            ? 'glass-panel border-cyan-500/50 text-cyan-300'
            : 'bg-blue-600 text-white'
        }`}>
          <Ghost size={24} className={isGameMode ? 'text-cyan-400' : ''} />
          <div>
            <div className={`font-semibold ${isGameMode ? 'font-mono' : ''}`}>
              {isGameMode ? 'NEW TARGET DETECTED!' : 'New Ghost Reported!'}
            </div>
            <div className={`text-sm ${isGameMode ? 'opacity-70 font-mono' : 'opacity-90'}`}>{newGhostId}</div>
          </div>
        </div>
      )}

      {isGameMode && (
        <GameModeSidebar
          user={user}
          currentUserId={currentUserId}
          onExitGameMode={handleGameModeToggle}
          isOpen={showGameSidebar}
          onToggle={() => setShowGameSidebar(!showGameSidebar)}
        />
      )}

      <div className="max-w-7xl mx-auto px-4 py-8 relative z-10">
        {isGameMode ? (
          <div className="mb-6">
            <div className="glass-panel rounded-lg p-4 border border-cyan-500/30">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <button
                    onClick={handleGameModeToggle}
                    className="relative hover:scale-110 transition-transform cursor-pointer group"
                    title="Exit Game Mode"
                  >
                    <div className="bg-cyan-500/20 p-3 rounded-lg border border-cyan-500/50 animate-pulse-glow-cyan group-hover:border-cyan-400">
                      <Ghost className="text-cyan-400 group-hover:text-cyan-300" size={36} />
                    </div>
                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-gray-900 animate-pulse" />
                  </button>
                  <div>
                    <h1 className="text-3xl font-bold font-mono text-cyan-400 glow-text-cyan">
                      GHOSTBUSTER HQ
                    </h1>
                    <p className="text-cyan-300/70 text-sm font-mono">
                      {user ? `OPERATIVE: ${user.displayName.toUpperCase()}` : 'SYSTEM ONLINE'}
                    </p>
                  </div>
                </div>
                {user && (
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <div className="text-xs text-cyan-400/70 font-mono">XP</div>
                      <div className="text-2xl font-bold text-cyan-400 glow-text-cyan">{user.totalPoints}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-cyan-400/70 font-mono">LVL</div>
                      <div className="text-2xl font-bold text-cyan-400 glow-text-cyan">{user.level}</div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-3">
                <button
                  onClick={handleGameModeToggle}
                  className="hover:scale-110 transition-transform cursor-pointer group relative"
                  title="Click to enter Game Mode"
                >
                  <Ghost
                    className={`text-blue-600 ${isGameMode ? 'animate-pulse-glow' : ''}`}
                    size={40}
                  />
                  <span className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs px-3 py-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                    Enter Game Mode
                  </span>
                </button>
                <div>
                  <h1 className="text-4xl font-bold text-gray-900">Ghost Catcher</h1>
                  <p className="text-gray-600">Operational Intelligence Dashboard</p>
                </div>
              </div>
              {ghosts.length === 0 && (
                <button
                  onClick={handleSeedData}
                  disabled={isSeeding}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Database size={20} />
                  {isSeeding ? 'Adding Demo Data...' : 'Add Demo Data'}
                </button>
              )}
            </div>
            <div className="mt-4 flex items-center gap-4 text-sm">
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-gray-600">Live</span>
                </div>
                <span className="text-gray-400">•</span>
                <span className="text-gray-600">Real-time sync enabled</span>
              </div>
              {seedMessage && (
                <>
                  <span className="text-gray-400">•</span>
                  <span className="text-green-600 font-medium">{seedMessage}</span>
                </>
              )}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-6 mb-6">
          <StatCard
            title={isGameMode ? "Total Spirits" : "Total"}
            value={stats.total}
            icon={Ghost}
            color="blue"
          />
          <StatCard
            title={isGameMode ? "Fresh Hauntings" : "New"}
            value={stats.byStatus.New}
            icon={AlertTriangle}
            color="red"
          />
          <StatCard
            title={isGameMode ? "Active Hunts" : "In Progress"}
            value={stats.byStatus['In Progress']}
            icon={Clock}
            color="yellow"
          />
          <StatCard
            title={isGameMode ? "Captured Ghosts" : "Resolved"}
            value={stats.byStatus.Resolved}
            icon={CheckCircle}
            color="green"
          />
          <StatCard
            title={isGameMode ? "Avg Capture Time" : "Avg Resolution Time"}
            value={stats.averageResolutionTime > 0 ? `${stats.averageResolutionTime}d` : '—'}
            icon={TrendingUp}
            color="orange"
            trend={stats.resolutionTimeDelta !== 0 && stats.averageResolutionTime > 0
              ? `${stats.resolutionTimeDelta > 0 ? '+' : ''}${stats.resolutionTimeDelta}% vs last month`
              : undefined}
          />
          <StatCard
            title={isGameMode ? "Dangerous Spirits" : "High Impact"}
            value={stats.highImpactCount}
            icon={Flame}
            color="red"
          />
        </div>

        <div className={`rounded-lg shadow-sm p-4 mb-6 ${
          isGameMode
            ? 'glass-panel border border-cyan-500/30'
            : 'bg-white border border-gray-200'
        }`}>
          <div className="flex flex-col lg:flex-row gap-3">
            <div className="flex-1">
              <div className="relative">
                <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${
                  isGameMode ? 'text-cyan-400' : 'text-gray-400'
                }`} size={18} />
                <input
                  type="text"
                  placeholder={isGameMode ? 'SEARCH TARGETS...' : 'Search ghosts...'}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={`w-full pl-9 pr-4 py-2 text-sm rounded-lg focus:ring-2 ${
                    isGameMode
                      ? 'bg-slate-800/50 border border-cyan-500/30 text-cyan-300 placeholder-cyan-600 focus:ring-cyan-500 focus:border-cyan-500 font-mono'
                      : 'border border-gray-300 focus:ring-blue-500 focus:border-transparent'
                  }`}
                />
              </div>
            </div>
            <div className="flex gap-2">
              <select
                value={filters.status}
                onChange={(e) => setFilters({ ...filters, status: e.target.value as any })}
                className={`px-3 py-2 text-sm rounded-lg focus:ring-2 ${
                  isGameMode
                    ? 'bg-slate-800/50 border border-cyan-500/30 text-cyan-300 focus:ring-cyan-500 focus:border-cyan-500 font-mono'
                    : 'border border-gray-300 bg-white focus:ring-blue-500 focus:border-transparent'
                }`}
              >
                <option value="All">Status</option>
                <option value="New">New</option>
                <option value="In Progress">In Progress</option>
                <option value="Resolved">Resolved</option>
                <option value="Archived">Archived</option>
              </select>
              <select
                value={filters.category}
                onChange={(e) => setFilters({ ...filters, category: e.target.value as any })}
                className={`px-3 py-2 text-sm rounded-lg focus:ring-2 ${
                  isGameMode
                    ? 'bg-slate-800/50 border border-cyan-500/30 text-cyan-300 focus:ring-cyan-500 focus:border-cyan-500 font-mono'
                    : 'border border-gray-300 bg-white focus:ring-blue-500 focus:border-transparent'
                }`}
              >
                <option value="All">Category</option>
                <option value="Process Inefficiency">Process Inefficiency</option>
                <option value="Technical Issue">Technical Issue</option>
                <option value="Communication Gap">Communication Gap</option>
                <option value="Data Quality">Data Quality</option>
                <option value="User Experience">User Experience</option>
                <option value="Compliance Risk">Compliance Risk</option>
                <option value="Other">Other</option>
              </select>
              <select
                value={filters.impactMin}
                onChange={(e) => setFilters({ ...filters, impactMin: Number(e.target.value) })}
                className={`px-3 py-2 text-sm rounded-lg focus:ring-2 ${
                  isGameMode
                    ? 'bg-slate-800/50 border border-cyan-500/30 text-cyan-300 focus:ring-cyan-500 focus:border-cyan-500 font-mono'
                    : 'border border-gray-300 bg-white focus:ring-blue-500 focus:border-transparent'
                }`}
              >
                <option value="0">Impact</option>
                <option value="3">3+</option>
                <option value="4">4+</option>
                <option value="5">5</option>
              </select>
              <div className={`flex items-center gap-1 rounded-lg p-1 ${
                isGameMode ? 'bg-slate-800/50' : 'bg-gray-100'
              }`}>
                <button
                  onClick={() => setViewMode('card')}
                  className={`p-1.5 rounded transition-colors ${
                    viewMode === 'card'
                      ? isGameMode
                        ? 'bg-cyan-500/20 text-cyan-400 shadow-sm border border-cyan-500/50'
                        : 'bg-white text-blue-600 shadow-sm'
                      : isGameMode
                        ? 'text-cyan-600 hover:text-cyan-400'
                        : 'text-gray-600 hover:text-gray-900'
                  }`}
                  title="Card View"
                >
                  <LayoutGrid size={16} />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-1.5 rounded transition-colors ${
                    viewMode === 'list'
                      ? isGameMode
                        ? 'bg-cyan-500/20 text-cyan-400 shadow-sm border border-cyan-500/50'
                        : 'bg-white text-blue-600 shadow-sm'
                      : isGameMode
                        ? 'text-cyan-600 hover:text-cyan-400'
                        : 'text-gray-600 hover:text-gray-900'
                  }`}
                  title="List View"
                >
                  <List size={16} />
                </button>
              </div>
            </div>
          </div>
        </div>

        {filteredGhosts.length === 0 ? (
          <div className={`rounded-xl shadow-sm p-12 text-center ${
            isGameMode
              ? 'glass-panel border border-cyan-500/30'
              : 'bg-white border border-gray-200'
          }`}>
            <Ghost className={isGameMode ? 'text-cyan-500/50 mx-auto mb-4' : 'text-gray-300 mx-auto mb-4'} size={64} />
            <h3 className={`text-xl font-semibold mb-2 ${
              isGameMode ? 'text-cyan-400 font-mono' : 'text-gray-900'
            }`}>
              {isGameMode ? 'NO TARGETS FOUND' : 'No Ghosts Found'}
            </h3>
            <p className={isGameMode ? 'text-cyan-300/70 font-mono text-sm' : 'text-gray-600'}>
              {searchQuery || filters.status !== 'All' || filters.category !== 'All'
                ? isGameMode
                  ? 'ADJUST SEARCH PARAMETERS'
                  : 'Try adjusting your filters or search query'
                : isGameMode
                  ? 'NO TARGETS IN SYSTEM'
                  : 'No ghosts have been reported yet'}
            </p>
          </div>
        ) : viewMode === 'card' ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredGhosts.map((ghost) => (
              <GhostCard
                key={ghost.id}
                ghost={ghost}
                onClick={() => setSelectedGhost(ghost)}
                isGameMode={isGameMode}
                previousStatus={previousGhostStatuses.current.get(ghost.id)}
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {filteredGhosts.map((ghost) => (
              <GhostListItem
                key={ghost.id}
                ghost={ghost}
                onClick={() => setSelectedGhost(ghost)}
                isGameMode={isGameMode}
                previousStatus={previousGhostStatuses.current.get(ghost.id)}
              />
            ))}
          </div>
        )}

        {stats.byCategory && Object.keys(stats.byCategory).length > 0 && (
          <div className={`mt-8 rounded-xl shadow-sm p-6 ${
            isGameMode
              ? 'glass-panel border border-cyan-500/30'
              : 'bg-white border border-gray-200'
          }`}>
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className={isGameMode ? 'text-cyan-400' : 'text-blue-600'} size={24} />
              <h2 className={`text-xl font-bold ${
                isGameMode ? 'text-cyan-400 font-mono' : 'text-gray-900'
              }`}>
                {isGameMode ? 'MISSION ANALYTICS' : 'Analytics'}
              </h2>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {Object.entries(stats.byCategory)
                .sort(([, a], [, b]) => b - a)
                .map(([category, count]) => (
                  <div key={category} className={`rounded-lg p-4 ${
                    isGameMode
                      ? 'bg-slate-800/50 border border-cyan-500/20'
                      : 'bg-gray-50'
                  }`}>
                    <div className={`text-2xl font-bold ${
                      isGameMode ? 'text-cyan-400 glow-text-cyan' : 'text-gray-900'
                    }`}>{count}</div>
                    <div className={`text-sm mt-1 ${
                      isGameMode ? 'text-cyan-300/70 font-mono text-xs' : 'text-gray-600'
                    }`}>{category}</div>
                  </div>
                ))}
            </div>
            {stats.averageResolutionTime > 0 && (
              <div className={`mt-4 pt-4 ${
                isGameMode ? 'border-t border-cyan-500/30' : 'border-t border-gray-200'
              }`}>
                <div className={`text-sm ${
                  isGameMode ? 'text-cyan-300/70 font-mono' : 'text-gray-600'
                }`}>
                  {isGameMode ? 'AVG CAPTURE TIME: ' : 'Average Resolution Time: '}
                  <span className={`font-semibold ${
                    isGameMode ? 'text-cyan-400' : 'text-gray-900'
                  }`}>{stats.averageResolutionTime} days</span>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {selectedGhost && (
        <GhostDetailModal
          ghost={selectedGhost}
          onClose={() => setSelectedGhost(null)}
          onUpdateStatus={updateGhostStatus}
          onUpdate={updateGhost}
        />
      )}

      {showReportModal && (
        <ReportGhostModal
          onClose={() => setShowReportModal(false)}
          onSubmit={addGhost}
        />
      )}

      {showUserSetup && (
        <UserSetupModal onSetup={handleUserSetup} />
      )}

      {unlockedBadge && (
        <AchievementUnlockModal
          badge={unlockedBadge}
          onClose={() => setUnlockedBadge(null)}
        />
      )}

      <button
        onClick={() => setShowReportModal(true)}
        className={`fixed bottom-8 right-8 w-16 h-16 rounded-full shadow-2xl hover:scale-110 transition-all duration-200 flex items-center justify-center group z-40 ${
          isGameMode
            ? 'bg-cyan-500/20 border-2 border-cyan-500 text-cyan-400 hover:shadow-cyan-500/50 animate-pulse-glow-cyan'
            : 'bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:shadow-blue-500/50'
        }`}
        aria-label={isGameMode ? 'Report New Target' : 'Report a Ghost'}
      >
        <Plus size={32} className="group-hover:rotate-90 transition-transform duration-200" />
        <span className={`absolute bottom-20 right-0 text-sm px-3 py-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap pointer-events-none ${
          isGameMode
            ? 'glass-panel text-cyan-300 border border-cyan-500/50 font-mono'
            : 'bg-gray-900 text-white'
        }`}>
          {isGameMode ? 'REPORT TARGET' : 'Report a Ghost'}
        </span>
      </button>
    </div>
  );
}

function App() {
  return (
    <GameModeProvider>
      <AppContent />
    </GameModeProvider>
  );
}

export default App;
