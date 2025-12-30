import { useState, useMemo, useEffect, useRef } from 'react';
import { Ghost, Search, Filter, TrendingUp, AlertTriangle, CheckCircle, Clock, Database } from 'lucide-react';
import { useGhosts } from './hooks/useGhosts';
import { StatCard } from './components/StatCard';
import { GhostCard } from './components/GhostCard';
import { GhostDetailModal } from './components/GhostDetailModal';
import type { Ghost as GhostType, GhostFilters } from './types/ghost';
import { seedDemoData } from './seedDemoData';

function App() {
  const { ghosts, loading, error, updateGhostStatus, updateGhost } = useGhosts();
  const [selectedGhost, setSelectedGhost] = useState<GhostType | null>(null);
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

  useEffect(() => {
    if (ghosts.length > previousGhostCount.current && previousGhostCount.current > 0) {
      const newGhost = ghosts[0];
      setNewGhostId(newGhost.id);
      setShowNotification(true);
      setTimeout(() => setShowNotification(false), 5000);
    }
    previousGhostCount.current = ghosts.length;
  }, [ghosts]);

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

    ghosts.forEach((ghost) => {
      byStatus[ghost.status]++;
      byCategory[ghost.category] = (byCategory[ghost.category] || 0) + 1;

      if (ghost.status === 'Resolved') {
        totalDaysOpen += ghost.daysOpen;
        resolvedCount++;
      }
    });

    return {
      total: ghosts.length,
      byStatus,
      byCategory,
      averageResolutionTime: resolvedCount > 0 ? Math.round(totalDaysOpen / resolvedCount) : 0,
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100">
      {showNotification && newGhostId && (
        <div className="fixed top-4 right-4 z-50 bg-blue-600 text-white px-6 py-4 rounded-lg shadow-2xl animate-slide-in-right flex items-center gap-3">
          <Ghost size={24} />
          <div>
            <div className="font-semibold">New Ghost Reported!</div>
            <div className="text-sm opacity-90">{newGhostId}</div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <Ghost className="text-blue-600" size={40} />
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

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Total Ghosts"
            value={stats.total}
            icon={Ghost}
            color="blue"
          />
          <StatCard
            title="New Reports"
            value={stats.byStatus.New}
            icon={AlertTriangle}
            color="red"
          />
          <StatCard
            title="In Progress"
            value={stats.byStatus['In Progress']}
            icon={Clock}
            color="yellow"
          />
          <StatCard
            title="Resolved"
            value={stats.byStatus.Resolved}
            icon={CheckCircle}
            color="green"
          />
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Search ghosts by title, description, or reporter..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            <div className="flex gap-3">
              <select
                value={filters.status}
                onChange={(e) => setFilters({ ...filters, status: e.target.value as any })}
                className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
              >
                <option value="All">All Status</option>
                <option value="New">New</option>
                <option value="In Progress">In Progress</option>
                <option value="Resolved">Resolved</option>
                <option value="Archived">Archived</option>
              </select>
              <select
                value={filters.category}
                onChange={(e) => setFilters({ ...filters, category: e.target.value as any })}
                className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
              >
                <option value="All">All Categories</option>
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
                className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
              >
                <option value="0">All Impact</option>
                <option value="3">Impact 3+</option>
                <option value="4">Impact 4+</option>
                <option value="5">Impact 5</option>
              </select>
            </div>
          </div>

          <div className="mt-4 flex items-center gap-2 text-sm text-gray-600">
            <Filter size={16} />
            <span>Showing {filteredGhosts.length} of {stats.total} ghosts</span>
          </div>
        </div>

        {filteredGhosts.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
            <Ghost className="text-gray-300 mx-auto mb-4" size={64} />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Ghosts Found</h3>
            <p className="text-gray-600">
              {searchQuery || filters.status !== 'All' || filters.category !== 'All'
                ? 'Try adjusting your filters or search query'
                : 'No ghosts have been reported yet'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredGhosts.map((ghost) => (
              <GhostCard
                key={ghost.id}
                ghost={ghost}
                onClick={() => setSelectedGhost(ghost)}
              />
            ))}
          </div>
        )}

        {stats.byCategory && Object.keys(stats.byCategory).length > 0 && (
          <div className="mt-8 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="text-blue-600" size={24} />
              <h2 className="text-xl font-bold text-gray-900">Analytics</h2>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {Object.entries(stats.byCategory)
                .sort(([, a], [, b]) => b - a)
                .map(([category, count]) => (
                  <div key={category} className="bg-gray-50 rounded-lg p-4">
                    <div className="text-2xl font-bold text-gray-900">{count}</div>
                    <div className="text-sm text-gray-600 mt-1">{category}</div>
                  </div>
                ))}
            </div>
            {stats.averageResolutionTime > 0 && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="text-sm text-gray-600">
                  Average Resolution Time: <span className="font-semibold text-gray-900">{stats.averageResolutionTime} days</span>
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
    </div>
  );
}

export default App;
