import { useState, useEffect } from 'react';
import { X, Ghost, AlertCircle, Upload, Trash2 } from 'lucide-react';
import type { Ghost as GhostType, GhostCategory } from '../types/ghost';

interface ReportGhostModalProps {
  onClose: () => void;
  onSubmit: (ghost: Omit<GhostType, 'daysOpen' | 'firestoreId'>) => Promise<void>;
}

interface SavedReporterInfo {
  email: string;
  reporter: string;
  department: string;
  geography: string;
}

const RISK_TYPES = [
  'Financial',
  'Operational',
  'Compliance',
  'Reputational',
  'Strategic'
];

const CATEGORIES: GhostCategory[] = [
  'Process Inefficiency',
  'Technical Issue',
  'Communication Gap',
  'Data Quality',
  'User Experience',
  'Compliance Risk',
  'Other'
];

const DEPARTMENTS = [
  'Engineering',
  'Product',
  'Design',
  'Marketing',
  'Sales',
  'Customer Success',
  'Operations',
  'Finance',
  'HR',
  'Legal',
  'Other'
];

const GEOGRAPHIES = [
  'Global',
  'North America',
  'Europe',
  'Asia Pacific',
  'Latin America',
  'Middle East & Africa'
];

export function ReportGhostModal({ onClose, onSubmit }: ReportGhostModalProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<GhostCategory>('Process Inefficiency');
  const [impact, setImpact] = useState(3);
  const [effort, setEffort] = useState(3);
  const [email, setEmail] = useState('');
  const [reporter, setReporter] = useState('');
  const [department, setDepartment] = useState('');
  const [geography, setGeography] = useState('Global');
  const [selectedRisks, setSelectedRisks] = useState<string[]>([]);
  const [url, setUrl] = useState('');
  const [screenshot, setScreenshot] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('ghostReporter');
    if (saved) {
      try {
        const data: SavedReporterInfo = JSON.parse(saved);
        setEmail(data.email || '');
        setReporter(data.reporter || '');
        setDepartment(data.department || '');
        setGeography(data.geography || 'Global');
      } catch (e) {
        console.error('Error loading saved reporter info:', e);
      }
    }
    setUrl(window.location.href);
  }, []);

  const validateEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!title.trim() || title.length < 5) {
      newErrors.title = 'Title must be at least 5 characters';
    } else if (title.length > 200) {
      newErrors.title = 'Title must be less than 200 characters';
    }

    if (!description.trim() || description.length < 10) {
      newErrors.description = 'Description must be at least 10 characters';
    } else if (description.length > 2000) {
      newErrors.description = 'Description must be less than 2000 characters';
    }

    if (!email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!validateEmail(email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleScreenshotUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setScreenshot(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveScreenshot = () => {
    setScreenshot(null);
  };

  const toggleRisk = (risk: string) => {
    setSelectedRisks(prev =>
      prev.includes(risk)
        ? prev.filter(r => r !== risk)
        : [...prev, risk]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const timestamp = new Date().toISOString();
      const randomSuffix = Math.random().toString(36).substring(2, 8);
      const id = `GH-${timestamp.slice(-6)}${randomSuffix}`;

      const ghostData: Omit<GhostType, 'daysOpen' | 'firestoreId'> = {
        id,
        title: title.trim(),
        description: description.trim(),
        category,
        impact,
        effort,
        email: email.trim(),
        reporterEmail: email.trim(),
        reporter: reporter.trim() || email.split('@')[0],
        department: department.trim() || 'Unknown',
        geography: geography || 'Global',
        riskType: selectedRisks,
        url: url.trim() || window.location.href,
        pageTitle: document.title || 'Ghost Catcher Dashboard',
        timestamp,
        dateReported: new Date().toISOString().split('T')[0],
        status: 'New',
        assignedTo: null,
        resolutionNotes: '',
        screenshot: screenshot || null
      };

      const reporterInfo: SavedReporterInfo = {
        email: email.trim(),
        reporter: reporter.trim() || email.split('@')[0],
        department: department.trim() || 'Unknown',
        geography: geography || 'Global'
      };
      localStorage.setItem('ghostReporter', JSON.stringify(reporterInfo));

      await onSubmit(ghostData);

      setTitle('');
      setDescription('');
      setCategory('Process Inefficiency');
      setImpact(3);
      setEffort(3);
      setSelectedRisks([]);
      setUrl(window.location.href);
      setScreenshot(null);
      setErrors({});

      onClose();
    } catch (error) {
      console.error('Error submitting ghost:', error);
      setErrors({ submit: 'Failed to submit ghost. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClearSavedInfo = () => {
    localStorage.removeItem('ghostReporter');
    setEmail('');
    setReporter('');
    setDepartment('');
    setGeography('Global');
  };

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
      onClick={handleOverlayClick}
    >
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col animate-scale-in">
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4 rounded-t-2xl flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Ghost className="text-white" size={28} />
            <h2 className="text-2xl font-bold text-white">Report a Ghost</h2>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:bg-white hover:bg-opacity-20 rounded-lg p-2 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
          <div className="overflow-y-auto px-6 pt-6 pb-4">
            {errors.submit && (
              <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
                <AlertCircle className="text-red-600 flex-shrink-0 mt-0.5" size={20} />
                <span className="text-red-800">{errors.submit}</span>
              </div>
            )}

            <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Brief summary of the issue"
                className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.title ? 'border-red-300 bg-red-50' : 'border-gray-300'
                }`}
              />
              {errors.title && (
                <p className="mt-1 text-sm text-red-600">{errors.title}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Description <span className="text-red-500">*</span>
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Detailed description of the issue, its impact, and any relevant context..."
                rows={3}
                className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none ${
                  errors.description ? 'border-red-300 bg-red-50' : 'border-gray-300'
                }`}
              />
              {errors.description && (
                <p className="mt-1 text-sm text-red-600">{errors.description}</p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Category <span className="text-red-500">*</span>
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as GhostCategory)}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your.email@company.com"
                  className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.email ? 'border-red-300 bg-red-50' : 'border-gray-300'
                  }`}
                />
                {errors.email && (
                  <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Impact (1-5) <span className="text-red-500">*</span>
                </label>
                <div className="flex items-center gap-4">
                  <input
                    type="range"
                    min="1"
                    max="5"
                    value={impact}
                    onChange={(e) => setImpact(Number(e.target.value))}
                    className="flex-1"
                  />
                  <span className="text-2xl font-bold text-blue-600 w-12 text-center">
                    {impact}
                  </span>
                </div>
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>Low</span>
                  <span>High</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Effort to Fix (1-5)
                </label>
                <div className="flex items-center gap-4">
                  <input
                    type="range"
                    min="1"
                    max="5"
                    value={effort}
                    onChange={(e) => setEffort(Number(e.target.value))}
                    className="flex-1"
                  />
                  <span className="text-2xl font-bold text-blue-600 w-12 text-center">
                    {effort}
                  </span>
                </div>
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>Easy</span>
                  <span>Hard</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Reporter Name
                </label>
                <input
                  type="text"
                  value={reporter}
                  onChange={(e) => setReporter(e.target.value)}
                  placeholder="Your name"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Department
                </label>
                <select
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                >
                  <option value="">Select department</option>
                  {DEPARTMENTS.map((dept) => (
                    <option key={dept} value={dept}>
                      {dept}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Geography
                </label>
                <select
                  value={geography}
                  onChange={(e) => setGeography(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                >
                  {GEOGRAPHIES.map((geo) => (
                    <option key={geo} value={geo}>
                      {geo}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Risk Type
              </label>
              <div className="flex flex-wrap gap-3">
                {RISK_TYPES.map((risk) => (
                  <label
                    key={risk}
                    className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                  >
                    <input
                      type="checkbox"
                      checked={selectedRisks.includes(risk)}
                      onChange={() => toggleRisk(risk)}
                      className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">{risk}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                URL
              </label>
              <input
                type="text"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://example.com/page"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Screenshot (optional)
              </label>
              {!screenshot ? (
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-500 transition-colors">
                  <Upload className="mx-auto text-gray-400 mb-2" size={32} />
                  <label className="cursor-pointer">
                    <span className="text-blue-600 hover:text-blue-700 font-medium">
                      Upload an image
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleScreenshotUpload}
                      className="hidden"
                    />
                  </label>
                  <p className="text-sm text-gray-500 mt-1">PNG, JPG up to 10MB</p>
                </div>
              ) : (
                <div className="relative border border-gray-300 rounded-lg p-2">
                  <img
                    src={screenshot}
                    alt="Screenshot preview"
                    className="w-full h-32 object-contain rounded"
                  />
                  <button
                    type="button"
                    onClick={handleRemoveScreenshot}
                    className="absolute top-4 right-4 bg-red-600 text-white p-2 rounded-lg hover:bg-red-700 transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              )}
            </div>
            </div>
          </div>

          <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200 bg-gray-50 rounded-b-2xl">
            <button
              type="button"
              onClick={handleClearSavedInfo}
              className="text-sm text-gray-600 hover:text-gray-800 underline"
            >
              Clear Saved Info
            </button>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-3 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                <Ghost size={20} />
                {isSubmitting ? 'Submitting...' : 'Report Ghost'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
