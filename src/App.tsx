import { useState, useMemo, useEffect, useRef } from 'react';
import { Ghost, Search, Filter, TrendingUp, AlertTriangle, CheckCircle, Clock, Database, Plus, LayoutGrid, List, Flame, LogOut } from 'lucide-react';
import { useGhosts } from './hooks/useGhosts';
import { StatCard } from './components/StatCard';
import { GhostCard } from './components/GhostCard';
import { GhostTable } from './components/GhostTable';
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
import { useAuth } from './contexts/AuthContext';
import { AuthModal } from './components/AuthModal';
import { LandingPage } from './components/LandingPage';

function AppContent() {
  const { user: authUser, loading: authLoading, signOut } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const { ghosts, loading, error, updateGhostStatus, updateGhost, addGhost } = useGhosts();
  const { isGameMode, toggleGameMode, currentUserId, setCurrentUserId } = useGameMode();
  const { user, awardPoints, checkAndAwardAchievements } = useUserProfile(currentUserId);
  const [selectedGhost, setSelectedGhost] = useState<GhostType | null>(null);
  const [showReportModal, setShowReportModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'priority' | 'age' | 'impact' | 'none'>('none');
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
    document.title = isGameMode ? 'Haunted House - Game Mode' : 'Haunted House';
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

  const handleSignOut = async () => {
    const { error } = await signOut();
    if (error) {
      console.error('Sign out error:', error);
    }
  };

  const filteredGhosts = useMemo(() => {
    let filtered = ghosts.filter((ghost) => {
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

    if (sortBy !== 'none') {
      filtered = [...filtered].sort((a, b) => {
        if (sortBy === 'priority') {
          const priorityOrder = { 'Critical': 0, 'High': 1, 'Medium': 2, 'Low': 3 };
          const aPriority = priorityOrder[a.priority || 'Medium'];
          const bPriority = priorityOrder[b.priority || 'Medium'];
          return aPriority - bPriority;
        } else if (sortBy === 'age') {
          return b.daysOpen - a.daysOpen;
        } else if (sortBy === 'impact') {
          return b.impact - a.impact;
        }
        return 0;
      });
    }

    return filtered;
  }, [ghosts, filters, searchQuery, sortBy]);

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

      if (ghost.status === 'Resolved' && ghost.actualResolutionTime !== undefined) {
        totalDaysOpen += ghost.actualResolutionTime;
        resolvedCount++;

        const resolvedDate = ghost.dateResolved ? new Date(ghost.dateResolved) :
                            ghost.resolvedAt ? new Date(ghost.resolvedAt) :
                            new Date(ghost.timestamp);

        if (resolvedDate >= currentMonthStart) {
          currentMonthDaysOpen += ghost.actualResolutionTime;
          currentMonthResolvedCount++;
        } else if (resolvedDate >= previousMonthStart && resolvedDate <= previousMonthEnd) {
          previousMonthDaysOpen += ghost.actualResolutionTime;
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

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading Haunted House...</p>
        </div>
      </div>
    );
  }

  if (!authUser) {
    return (
      <>
        <LandingPage onSignIn={() => setShowAuthModal(true)} />
        <AuthModal
          isOpen={showAuthModal}
          onClose={() => setShowAuthModal(false)}
          initialMode="signin"
        />
      </>
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
        <div className={`fixed top-4 left-4 right-4 sm:left-auto sm:right-4 sm:max-w-sm z-50 px-4 sm:px-6 py-3 sm:py-4 rounded-lg shadow-2xl animate-slide-in-right flex items-center gap-2 sm:gap-3 ${
          isGameMode
            ? 'glass-panel border-cyan-500/50 text-cyan-300'
            : 'bg-blue-600 text-white'
        }`}>
          <Ghost size={20} className={`sm:w-6 sm:h-6 flex-shrink-0 ${isGameMode ? 'text-cyan-400' : ''}`} />
          <div className="flex-1 min-w-0">
            <div className={`text-sm sm:text-base font-semibold truncate ${isGameMode ? 'font-mono' : ''}`}>
              {isGameMode ? 'NEW TARGET DETECTED!' : 'New Ghost Reported!'}
            </div>
            <div className={`text-xs sm:text-sm truncate ${isGameMode ? 'opacity-70 font-mono' : 'opacity-90'}`}>{newGhostId}</div>
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

      <div className="max-w-7xl mx-auto px-3 sm:px-4 py-4 sm:py-6 lg:py-8 relative z-10">
        {isGameMode ? (
          <div className="mb-4 sm:mb-6">
            <div className="glass-panel rounded-lg p-3 sm:p-4 border border-cyan-500/30">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2 sm:gap-4 flex-1 min-w-0">
                  <button
                    onClick={handleGameModeToggle}
                    className="relative hover:scale-110 transition-transform cursor-pointer group flex-shrink-0"
                    title="Exit Game Mode"
                  >
                    <div className="bg-cyan-500/20 p-2 sm:p-3 rounded-lg border border-cyan-500/50 animate-pulse-glow-cyan group-hover:border-cyan-400">
                      <Ghost className="text-cyan-400 group-hover:text-cyan-300" size={28} />
                    </div>
                    <div className="absolute -top-1 -right-1 w-2.5 h-2.5 sm:w-3 sm:h-3 bg-green-500 rounded-full border-2 border-gray-900 animate-pulse" />
                  </button>
                  <div className="flex-1 min-w-0">
                    <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold font-mono text-cyan-400 glow-text-cyan truncate">
                      GHOSTBUSTER HQ
                    </h1>
                    <p className="text-cyan-300/70 text-xs sm:text-sm font-mono truncate">
                      {user ? `OPERATIVE: ${user.displayName.toUpperCase()}` : 'SYSTEM ONLINE'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
                  {user && (
                    <>
                      <div className="text-right">
                        <div className="text-xs text-cyan-400/70 font-mono">XP</div>
                        <div className="text-lg sm:text-xl lg:text-2xl font-bold text-cyan-400 glow-text-cyan">{user.totalPoints}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-xs text-cyan-400/70 font-mono">LVL</div>
                        <div className="text-lg sm:text-xl lg:text-2xl font-bold text-cyan-400 glow-text-cyan">{user.level}</div>
                      </div>
                    </>
                  )}
                  <button
                    onClick={handleSignOut}
                    className="p-2 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/20 hover:border-cyan-500/50 transition-colors group"
                    title="Sign Out"
                  >
                    <LogOut size={18} className="group-hover:scale-110 transition-transform" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="mb-4 sm:mb-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0 mb-2">
              <div className="flex items-center gap-2 sm:gap-3">
                <button
                  onClick={handleGameModeToggle}
                  className="hover:scale-110 transition-transform cursor-pointer group relative flex-shrink-0"
                  title="Click to enter Game Mode"
                >
                  <Ghost
                    className={`text-blue-600 ${isGameMode ? 'animate-pulse-glow' : ''}`}
                    size={32}
                  />
                  <span className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs px-3 py-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none hidden sm:block">
                    Enter Game Mode
                  </span>
                </button>
                <div>
                  <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900">Haunted House</h1>
                  <p className="text-sm sm:text-base text-gray-600">Operational Intelligence Dashboard</p>
                </div>
              </div>
              <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto">
                {ghosts.length === 0 && (
                  <button
                    onClick={handleSeedData}
                    disabled={isSeeding}
                    className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex-1 sm:flex-none justify-center"
                  >
                    <Database size={18} />
                    <span className="sm:inline">{isSeeding ? 'Adding...' : 'Add Demo Data'}</span>
                  </button>
                )}
                <button
                  onClick={handleSignOut}
                  className="flex items-center gap-2 px-3 sm:px-4 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors group"
                  title="Sign Out"
                >
                  <LogOut size={18} className="group-hover:scale-110 transition-transform" />
                  <span className="hidden sm:inline">Sign Out</span>
                </button>
              </div>
            </div>
            <div className="mt-3 sm:mt-4 flex flex-wrap items-center gap-2 sm:gap-4 text-xs sm:text-sm">
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-gray-600">Live</span>
                </div>
                <span className="text-gray-400 hidden sm:inline">•</span>
                <span className="text-gray-600 hidden sm:inline">Real-time sync enabled</span>
              </div>
              {seedMessage && (
                <>
                  <span className="text-gray-400 hidden sm:inline">•</span>
                  <span className="text-green-600 font-medium">{seedMessage}</span>
                </>
              )}
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4 lg:gap-6 mb-4 sm:mb-6">
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
            title={isGameMode ? "Busted Ghosts" : "Resolved"}
            value={stats.byStatus.Resolved}
            icon={CheckCircle}
            color="green"
          />
          <StatCard
            title={isGameMode ? "Avg. Bust Time" : "Avg Resolution Time"}
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

        <div className={`rounded-lg shadow-sm p-3 sm:p-4 mb-4 sm:mb-6 ${
          isGameMode
            ? 'glass-panel border border-cyan-500/30'
            : 'bg-white border border-gray-200'
        }`}>
          <div className="flex flex-col gap-2 sm:gap-3">
            <div className="w-full">
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
            <div className="flex flex-wrap gap-2">
              <select
                value={filters.status}
                onChange={(e) => setFilters({ ...filters, status: e.target.value as any })}
                className={`flex-1 min-w-[90px] px-2 sm:px-3 py-2 text-xs sm:text-sm rounded-lg focus:ring-2 ${
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
                className={`flex-1 min-w-[110px] px-2 sm:px-3 py-2 text-xs sm:text-sm rounded-lg focus:ring-2 ${
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
                className={`flex-1 min-w-[90px] px-2 sm:px-3 py-2 text-xs sm:text-sm rounded-lg focus:ring-2 ${
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
              {!isGameMode && (
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="flex-1 min-w-[90px] px-2 sm:px-3 py-2 text-xs sm:text-sm rounded-lg focus:ring-2 border border-gray-300 bg-white focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="none">Sort By</option>
                  <option value="priority">Priority</option>
                  <option value="age">Age</option>
                  <option value="impact">Impact</option>
                </select>
              )}
              <div className={`flex items-center gap-1 rounded-lg p-1 flex-shrink-0 ${
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
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
            {filteredGhosts.map((ghost) => (
              <GhostCard
                key={ghost.id}
                ghost={ghost}
                onClick={() => setSelectedGhost(ghost)}
                isGameMode={isGameMode}
                previousStatus={previousGhostStatuses.current.get(ghost.id)}
                onQuickStatusChange={(status) => updateGhostStatus(ghost.id, status)}
              />
            ))}
          </div>
        ) : (
          <GhostTable
            ghosts={filteredGhosts}
            onClick={(ghost) => setSelectedGhost(ghost)}
            isGameMode={isGameMode}
            previousStatuses={previousGhostStatuses.current}
          />
        )}

        {stats.byCategory && Object.keys(stats.byCategory).length > 0 && (
          <div className={`mt-6 sm:mt-8 rounded-xl shadow-sm p-4 sm:p-6 ${
            isGameMode
              ? 'glass-panel border border-cyan-500/30'
              : 'bg-white border border-gray-200'
          }`}>
            <div className="flex items-center gap-2 mb-3 sm:mb-4">
              <TrendingUp className={isGameMode ? 'text-cyan-400' : 'text-blue-600'} size={20} />
              <h2 className={`text-lg sm:text-xl font-bold ${
                isGameMode ? 'text-cyan-400 font-mono' : 'text-gray-900'
              }`}>
                {isGameMode ? 'MISSION ANALYTICS' : 'Analytics'}
              </h2>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
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
        className={`fixed bottom-6 right-6 sm:bottom-8 sm:right-8 w-14 h-14 sm:w-16 sm:h-16 rounded-full shadow-2xl hover:scale-110 active:scale-95 transition-all duration-200 flex items-center justify-center group z-40 ${
          isGameMode
            ? 'bg-cyan-500/20 border-2 border-cyan-500 text-cyan-400 hover:shadow-cyan-500/50 animate-pulse-glow-cyan'
            : 'bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:shadow-blue-500/50'
        }`}
        aria-label={isGameMode ? 'Report New Target' : 'Report a Ghost'}
      >
        <Plus size={28} className="sm:w-8 sm:h-8 group-hover:rotate-90 transition-transform duration-200" />
        <span className={`absolute bottom-16 sm:bottom-20 right-0 text-xs sm:text-sm px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap pointer-events-none hidden sm:block ${
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
