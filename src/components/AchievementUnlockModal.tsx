import { Award } from 'lucide-react';
import type { Badge } from '../types/game';

interface AchievementUnlockModalProps {
  badge: Badge;
  onClose: () => void;
}

export function AchievementUnlockModal({ badge, onClose }: AchievementUnlockModalProps) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 animate-fade-in-up">
      <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-2xl p-8 max-w-md mx-4 shadow-2xl border-4 border-yellow-400 animate-bounce-subtle">
        <div className="text-center">
          <div className="mb-4 relative">
            <Award size={64} className="text-yellow-500 mx-auto animate-pulse-glow" />
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-4xl animate-bounce-subtle">{badge.icon}</span>
            </div>
          </div>

          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Achievement Unlocked!
          </h2>

          <div className="mb-4">
            <div className="text-xl font-bold text-yellow-700 mb-1">
              {badge.name}
            </div>
            <p className="text-gray-600">{badge.description}</p>
          </div>

          <div className="bg-white rounded-lg p-4 mb-6 border-2 border-yellow-300">
            <div className="text-sm text-gray-600 mb-1">Bonus Points Awarded</div>
            <div className="text-3xl font-bold text-yellow-600">
              +{badge.bonusPoints}
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white font-bold py-3 px-6 rounded-lg transition-all transform hover:scale-105"
          >
            Awesome!
          </button>
        </div>

        <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-2xl">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute w-2 h-2 bg-yellow-400 rounded-full animate-sparkle"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 2}s`,
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
