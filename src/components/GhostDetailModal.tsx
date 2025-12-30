import { X, Calendar, User, Mail, Globe, ExternalLink, AlertCircle, Target } from 'lucide-react';
import type { Ghost } from '../types/ghost';
import { useState } from 'react';

interface GhostDetailModalProps {
  ghost: Ghost;
  onClose: () => void;
  onUpdateStatus: (ghostId: string, status: Ghost['status']) => Promise<void>;
  onUpdate: (ghostId: string, updates: Partial<Ghost>) => Promise<void>;
}

export function GhostDetailModal({ ghost, onClose, onUpdateStatus, onUpdate }: GhostDetailModalProps) {
  const [isUpdating, setIsUpdating] = useState(false);
  const [assignedTo, setAssignedTo] = useState(ghost.assignedTo || '');
  const [resolutionNotes, setResolutionNotes] = useState(ghost.resolutionNotes || '');

  const handleStatusChange = async (newStatus: Ghost['status']) => {
    setIsUpdating(true);
    try {
      await onUpdateStatus(ghost.id, newStatus);
    } catch (error) {
      console.error('Failed to update status:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleSaveDetails = async () => {
    setIsUpdating(true);
    try {
      await onUpdate(ghost.id, {
        assignedTo: assignedTo || null,
        resolutionNotes,
      });
    } catch (error) {
      console.error('Failed to update ghost:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  const getStatusColor = (status: Ghost['status']) => {
    switch (status) {
      case 'New':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'In Progress':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Resolved':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'Archived':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Ghost Details</h2>
            <p className="text-sm text-gray-500 font-mono mt-1">{ghost.id}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div>
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{ghost.title}</h3>
                <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(ghost.status)}`}>
                  {ghost.status}
                </span>
              </div>
              <div className="flex items-center gap-2 ml-4">
                <AlertCircle className="text-red-600" size={20} />
                <span className="text-lg font-semibold text-gray-700">Impact: {ghost.impact}/5</span>
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-4 mb-4">
              <h4 className="text-sm font-semibold text-gray-700 mb-2">Description</h4>
              <p className="text-gray-700 whitespace-pre-wrap">{ghost.description}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-2 text-gray-700">
              <User size={18} className="text-gray-500" />
              <div>
                <div className="text-xs text-gray-500">Reporter</div>
                <div className="font-medium">{ghost.reporter}</div>
              </div>
            </div>
            <div className="flex items-center gap-2 text-gray-700">
              <Mail size={18} className="text-gray-500" />
              <div>
                <div className="text-xs text-gray-500">Email</div>
                <div className="font-medium">{ghost.reporterEmail}</div>
              </div>
            </div>
            <div className="flex items-center gap-2 text-gray-700">
              <Calendar size={18} className="text-gray-500" />
              <div>
                <div className="text-xs text-gray-500">Reported</div>
                <div className="font-medium">{new Date(ghost.timestamp).toLocaleString()}</div>
              </div>
            </div>
            <div className="flex items-center gap-2 text-gray-700">
              <Target size={18} className="text-gray-500" />
              <div>
                <div className="text-xs text-gray-500">Days Open</div>
                <div className="font-medium">{ghost.daysOpen} days</div>
              </div>
            </div>
            <div className="flex items-center gap-2 text-gray-700">
              <Globe size={18} className="text-gray-500" />
              <div>
                <div className="text-xs text-gray-500">Category</div>
                <div className="font-medium">{ghost.category}</div>
              </div>
            </div>
            <div className="flex items-center gap-2 text-gray-700">
              <Globe size={18} className="text-gray-500" />
              <div>
                <div className="text-xs text-gray-500">Geography</div>
                <div className="font-medium">{ghost.geography}</div>
              </div>
            </div>
          </div>

          {ghost.url && (
            <div className="bg-blue-50 rounded-lg p-4">
              <div className="flex items-start gap-2">
                <ExternalLink size={18} className="text-blue-600 mt-0.5" />
                <div className="flex-1">
                  <div className="text-xs text-blue-700 font-semibold mb-1">Context URL</div>
                  <a
                    href={ghost.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-blue-600 hover:text-blue-800 underline break-all"
                  >
                    {ghost.url}
                  </a>
                  {ghost.pageTitle && (
                    <div className="text-xs text-gray-600 mt-1">{ghost.pageTitle}</div>
                  )}
                </div>
              </div>
            </div>
          )}

          {ghost.screenshot && (
            <div>
              <h4 className="text-sm font-semibold text-gray-700 mb-2">Screenshot</h4>
              <img
                src={ghost.screenshot}
                alt="Ghost screenshot"
                className="w-full rounded-lg border border-gray-200"
              />
            </div>
          )}

          <div className="border-t border-gray-200 pt-6">
            <h4 className="text-lg font-semibold text-gray-900 mb-4">Management</h4>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status
                </label>
                <div className="flex gap-2">
                  {(['New', 'In Progress', 'Resolved', 'Archived'] as const).map((status) => (
                    <button
                      key={status}
                      onClick={() => handleStatusChange(status)}
                      disabled={isUpdating || ghost.status === status}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                        ghost.status === status
                          ? getStatusColor(status)
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      } disabled:opacity-50`}
                    >
                      {status}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Assigned To
                </label>
                <input
                  type="text"
                  value={assignedTo}
                  onChange={(e) => setAssignedTo(e.target.value)}
                  placeholder="Enter name or email"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Resolution Notes
                </label>
                <textarea
                  value={resolutionNotes}
                  onChange={(e) => setResolutionNotes(e.target.value)}
                  placeholder="Add notes about the resolution..."
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <button
                onClick={handleSaveDetails}
                disabled={isUpdating}
                className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                {isUpdating ? 'Saving...' : 'Save Details'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
