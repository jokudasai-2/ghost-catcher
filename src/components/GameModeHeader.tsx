import { Ghost, Zap, Award, Trophy, X } from 'lucide-react';
import type { User } from '../types/game';

interface GameModeHeaderProps {
  user: User | null;
  onExitGameMode: () => void;
  onOpenLeaderboard: () => void;
}

export function GameModeHeader({ user, onExitGameMode, onOpenLeaderboard }: GameModeHeaderProps) {
  return (
    <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 rounded-xl shadow-lg mb-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="bg-white bg-opacity-20 p-3 rounded-lg animate-pulse-glow">
            <Ghost size={32} />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Ghost Catcher - Game Mode</h1>
            <p className="text-blue-100">
              {user ? `Welcome back, ${user.displayName}!` : 'Loading...'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-6">
          {user && (
            <>
              <div className="text-center bg-white bg-opacity-20 px-4 py-2 rounded-lg">
                <div className="flex items-center gap-2 mb-1">
                  <Zap size={16} />
                  <span className="text-sm">Points</span>
                </div>
                <div className="text-2xl font-bold">{user.totalPoints}</div>
              </div>

              <div className="text-center bg-white bg-opacity-20 px-4 py-2 rounded-lg">
                <div className="flex items-center gap-2 mb-1">
                  <Award size={16} />
                  <span className="text-sm">Level</span>
                </div>
                <div className="text-2xl font-bold">{user.level}</div>
              </div>

              <button
                onClick={onOpenLeaderboard}
                className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-lg font-semibold flex items-center gap-2 transition-all transform hover:scale-105"
              >
                <Trophy size={20} />
                Leaderboard
              </button>
            </>
          )}

          <button
            onClick={onExitGameMode}
            className="bg-white bg-opacity-20 hover:bg-opacity-30 px-4 py-2 rounded-lg flex items-center gap-2 transition-all"
          >
            <X size={20} />
            Exit Game Mode
          </button>
        </div>
      </div>
    </div>
  );
}
