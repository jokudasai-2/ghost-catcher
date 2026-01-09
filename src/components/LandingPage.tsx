import { Ghost, Target, Users, Zap, TrendingUp, Shield, CheckCircle, Award } from 'lucide-react';

interface LandingPageProps {
  onSignIn: () => void;
}

export function LandingPage({ onSignIn }: LandingPageProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100">
      <div className="max-w-7xl mx-auto px-4 py-8 sm:py-12 lg:py-16">
        <div className="text-center mb-12 sm:mb-16">
          <div className="flex items-center justify-center mb-6">
            <div className="relative">
              <Ghost className="text-blue-600" size={80} />
              <div className="absolute -top-2 -right-2 w-6 h-6 bg-blue-600 rounded-full animate-pulse" />
            </div>
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-4">
            Ghost Catcher
          </h1>
          <p className="text-xl sm:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Say bye bye to operational ghosts that haunt your organization
          </p>
          <button
            onClick={onSignIn}
            className="inline-flex items-center gap-3 bg-blue-600 text-white px-8 py-4 rounded-xl hover:bg-blue-700 transition font-semibold text-lg shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            <Ghost size={24} />
            Start
          </button>
        </div>

        <div className="mb-12 sm:mb-16">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white rounded-xl shadow-lg p-6 border-2 border-blue-100 hover:border-blue-300 transition">
              <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center mb-4 font-bold text-xl">
                1
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Report Ghosts (catch)</h3>
              <p className="text-gray-600 text-sm">
                Anyone in your organization can report operational ghosts through the web app or browser extension
              </p>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6 border-2 border-blue-100 hover:border-blue-300 transition">
              <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center mb-4 font-bold text-xl">
                2
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Track & Escalate</h3>
              <p className="text-gray-600 text-sm">
                Auto-calculated priorities based on impact and effort help you focus on what matters most
              </p>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6 border-2 border-blue-100 hover:border-blue-300 transition">
              <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center mb-4 font-bold text-xl">
                3
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Take Action (bust)</h3>
              <p className="text-gray-600 text-sm">
                Assign ghosts to team members, update status, and document resolution notes
              </p>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6 border-2 border-blue-100 hover:border-blue-300 transition">
              <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center mb-4 font-bold text-xl">
                4
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Analyze & Improve</h3>
              <p className="text-gray-600 text-sm">
                Track resolution times, identify patterns, and continuously improve operations
              </p>
            </div>
          </div>
        </div>

        <footer className="border-t border-gray-200 bg-white/50 backdrop-blur-sm rounded-xl shadow-sm p-8 mt-12">
          <div className="max-w-4xl mx-auto">
            <div className="grid md:grid-cols-3 gap-8 mb-6">
              <div>
                <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                  <Users size={18} />
                  About
                </h3>
                <p className="text-sm text-gray-600">
                  Ghost Catcher was created for Deel in January 2026 by <a href="https://www.linkedin.com/in/johannabassetti/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 underline">Johanna Santos Bassetti</a> (Ghostbuster candidate). Last update: 01/09/2026
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                  <Shield size={18} />
                  Data Privacy
                </h3>
                <p className="text-sm text-gray-600">
                  Your data is securely stored with Supabase. We use row-level security to ensure only authorized users can access their organization's data.
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                  <CheckCircle size={18} />
                  Security
                </h3>
                <p className="text-sm text-gray-600">
                  All data is encrypted in transit and at rest. Authentication is handled securely through Supabase Auth with industry-standard practices.
                </p>
              </div>
            </div>

            <div className="text-center pt-6 border-t border-gray-200">
              <p className="text-sm text-gray-500">
                © 2026 Ghost Catcher. Built with security and privacy in mind.
              </p>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
