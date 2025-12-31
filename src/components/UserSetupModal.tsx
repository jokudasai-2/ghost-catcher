import { useState } from 'react';
import { Ghost } from 'lucide-react';

interface UserSetupModalProps {
  onSetup: (userId: string) => void;
}

export function UserSetupModal({ onSetup }: UserSetupModalProps) {
  const [userId, setUserId] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (userId.trim()) {
      onSetup(userId.trim());
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-8 max-w-md mx-4 shadow-2xl">
        <div className="text-center mb-6">
          <Ghost className="text-blue-600 mx-auto mb-4" size={64} />
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome to Game Mode!
          </h2>
          <p className="text-gray-600">
            Enter your email to start earning points and competing on the leaderboard.
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <label htmlFor="userId" className="block text-sm font-medium text-gray-700 mb-2">
              Email Address
            </label>
            <input
              type="email"
              id="userId"
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="your.email@company.com"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-bold py-3 px-6 rounded-lg transition-all transform hover:scale-105"
          >
            Start Playing
          </button>
        </form>
      </div>
    </div>
  );
}
