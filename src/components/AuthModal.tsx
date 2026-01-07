import { useState } from 'react';
import { X, Mail, Lock, User } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { authSignInSchema, authSignUpSchema, passwordResetSchema } from '../lib/validation';
import { z } from 'zod';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'signin' | 'signup';
}

export function AuthModal({ isOpen, onClose, initialMode = 'signin' }: AuthModalProps) {
  const { signIn, signUp, resetPassword } = useAuth();
  const [mode, setMode] = useState<'signin' | 'signup' | 'reset'>(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setFieldErrors({});
    setLoading(true);

    try {
      if (mode === 'signin') {
        const validation = authSignInSchema.safeParse({ email, password });
        if (!validation.success) {
          const errors: Record<string, string> = {};
          validation.error.errors.forEach((err) => {
            const field = err.path[0]?.toString();
            if (field) errors[field] = err.message;
          });
          setFieldErrors(errors);
          setLoading(false);
          return;
        }

        const { error } = await signIn(email, password);
        if (error) {
          setError(error.message);
        } else {
          onClose();
        }
      } else if (mode === 'signup') {
        const validation = authSignUpSchema.safeParse({ email, password, displayName });
        if (!validation.success) {
          const errors: Record<string, string> = {};
          validation.error.errors.forEach((err) => {
            const field = err.path[0]?.toString();
            if (field) errors[field] = err.message;
          });
          setFieldErrors(errors);
          setLoading(false);
          return;
        }

        const { error } = await signUp(email, password, displayName);
        if (error) {
          setError(error.message);
        } else {
          setMessage('Account created successfully! You can now sign in.');
          setTimeout(() => {
            onClose();
          }, 2000);
        }
      } else if (mode === 'reset') {
        const validation = passwordResetSchema.safeParse({ email });
        if (!validation.success) {
          const errors: Record<string, string> = {};
          validation.error.errors.forEach((err) => {
            const field = err.path[0]?.toString();
            if (field) errors[field] = err.message;
          });
          setFieldErrors(errors);
          setLoading(false);
          return;
        }

        const { error } = await resetPassword(email);
        if (error) {
          setError(error.message);
        } else {
          setMessage('Password reset email sent! Check your inbox.');
        }
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-md w-full p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
        >
          <X size={24} />
        </button>

        <h2 className="text-2xl font-bold mb-6">
          {mode === 'signin' && 'Sign In'}
          {mode === 'signup' && 'Create Account'}
          {mode === 'reset' && 'Reset Password'}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'signup' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Display Name
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    fieldErrors.displayName ? 'border-red-300 bg-red-50' : 'border-gray-300'
                  }`}
                  placeholder="Your name"
                  required
                />
              </div>
              {fieldErrors.displayName && (
                <p className="mt-1 text-sm text-red-600">{fieldErrors.displayName}</p>
              )}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  fieldErrors.email ? 'border-red-300 bg-red-50' : 'border-gray-300'
                }`}
                placeholder="you@example.com"
                required
              />
            </div>
            {fieldErrors.email && (
              <p className="mt-1 text-sm text-red-600">{fieldErrors.email}</p>
            )}
          </div>

          {mode !== 'reset' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    fieldErrors.password ? 'border-red-300 bg-red-50' : 'border-gray-300'
                  }`}
                  placeholder="••••••••"
                  required
                  minLength={6}
                />
              </div>
              {fieldErrors.password && (
                <p className="mt-1 text-sm text-red-600">{fieldErrors.password}</p>
              )}
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-2 rounded-lg text-sm">
              {error}
            </div>
          )}

          {message && (
            <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-2 rounded-lg text-sm">
              {message}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Loading...' : mode === 'signin' ? 'Sign In' : mode === 'signup' ? 'Create Account' : 'Send Reset Email'}
          </button>
        </form>

        <div className="mt-4 text-center text-sm">
          {mode === 'signin' && (
            <>
              <button
                onClick={() => setMode('reset')}
                className="text-blue-600 hover:underline"
              >
                Forgot password?
              </button>
              <span className="mx-2 text-gray-400">•</span>
              <button
                onClick={() => setMode('signup')}
                className="text-blue-600 hover:underline"
              >
                Create account
              </button>
            </>
          )}
          {mode === 'signup' && (
            <button
              onClick={() => setMode('signin')}
              className="text-blue-600 hover:underline"
            >
              Already have an account? Sign in
            </button>
          )}
          {mode === 'reset' && (
            <button
              onClick={() => setMode('signin')}
              className="text-blue-600 hover:underline"
            >
              Back to sign in
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
