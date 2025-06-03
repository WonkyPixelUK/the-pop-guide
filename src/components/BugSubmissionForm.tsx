import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { supabase } from '@/integrations/supabase/client';
import { BugSeverity, BugType, BugPlatform, Bug } from '@/types/supabase';
import { 
  Bug as BugIcon, 
  Upload, 
  AlertTriangle, 
  CheckCircle, 
  Loader, 
  X,
  Camera,
  FileText,
  Monitor,
  Chrome,
  Smartphone,
  Tablet
} from 'lucide-react';

interface BugSubmissionFormProps {
  onSubmissionSuccess?: (bugRef: string) => void;
  onClose?: () => void;
  initialPlatform?: BugPlatform;
}

interface EnvironmentData {
  browser: string;
  os: string;
  screen_resolution: string;
  user_agent: string;
  url: string;
  user_type: 'free' | 'pro';
}

const BugSubmissionForm: React.FC<BugSubmissionFormProps> = ({ 
  onSubmissionSuccess, 
  onClose,
  initialPlatform = 'web_app'
}) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    severity: 'medium' as BugSeverity,
    bug_type: 'functionality' as BugType,
    platform: initialPlatform,
    reproduction_steps: '',
    expected_behavior: '',
    actual_behavior: ''
  });

  const [files, setFiles] = useState<File[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [environmentData, setEnvironmentData] = useState<EnvironmentData | null>(null);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    // Get user session
    const getUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUserId(session?.user?.id || null);
    };
    getUser();

    // Auto-detect environment
    const detectEnvironment = () => {
      const env: EnvironmentData = {
        browser: navigator.userAgent.includes('Chrome') ? 'Chrome' : 
                navigator.userAgent.includes('Firefox') ? 'Firefox' :
                navigator.userAgent.includes('Safari') ? 'Safari' : 'Unknown',
        os: navigator.platform,
        screen_resolution: `${screen.width}x${screen.height}`,
        user_agent: navigator.userAgent,
        url: window.location.href,
        user_type: 'free' // This should be fetched from user profile
      };
      setEnvironmentData(env);
    };

    detectEnvironment();
  }, []);

  const severityOptions = [
    { value: 'critical', label: 'Critical', description: 'System unusable, data loss', color: 'text-red-400' },
    { value: 'high', label: 'High', description: 'Major functionality broken', color: 'text-orange-400' },
    { value: 'medium', label: 'Medium', description: 'Feature not working as expected', color: 'text-yellow-400' },
    { value: 'low', label: 'Low', description: 'Minor issue, cosmetic problem', color: 'text-green-400' }
  ];

  const typeOptions = [
    { value: 'ui_ux', label: 'UI/UX Issue', description: 'Visual or usability problem' },
    { value: 'functionality', label: 'Functionality', description: 'Feature not working correctly' },
    { value: 'performance', label: 'Performance', description: 'Slow loading, lag, crashes' },
    { value: 'security', label: 'Security', description: 'Potential security vulnerability' },
    { value: 'data_loss', label: 'Data Loss', description: 'Data not saving or disappearing' },
    { value: 'compatibility', label: 'Compatibility', description: 'Browser or device specific issue' }
  ];

  const platformOptions = [
    { value: 'web_app', label: 'Web App', icon: <Monitor className="w-4 h-4" /> },
    { value: 'chrome_extension', label: 'Chrome Extension', icon: <Chrome className="w-4 h-4" /> },
    { value: 'ios_app', label: 'iOS App', icon: <Tablet className="w-4 h-4" /> },
    { value: 'android_app', label: 'Android App', icon: <Smartphone className="w-4 h-4" /> },
    { value: 'all_platforms', label: 'All Platforms', icon: <BugIcon className="w-4 h-4" /> }
  ];

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    const validFiles = selectedFiles.filter(file => {
      // Max 10MB per file, common image/video formats
      const maxSize = 10 * 1024 * 1024; // 10MB
      const allowedTypes = ['image/', 'video/', 'text/plain', 'application/pdf'];
      return file.size <= maxSize && allowedTypes.some(type => file.type.startsWith(type));
    });
    
    if (validFiles.length !== selectedFiles.length) {
      setError('Some files were rejected. Max 10MB per file, images/videos/text/PDF only.');
    }
    
    setFiles(prev => [...prev, ...validFiles].slice(0, 5)); // Max 5 files
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const generateReferenceNumber = () => {
    const year = new Date().getFullYear();
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    return `BUG-${year}-${random}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) {
      setError('Please log in to submit a bug report.');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      // Generate unique reference number
      const referenceNumber = generateReferenceNumber();
      
      // Calculate priority based on severity and type
      const priority = formData.severity === 'critical' ? 'urgent' :
                      formData.severity === 'high' ? 'high' :
                      formData.severity === 'medium' ? 'normal' : 'low';

      // Create bug record
      const bugData = {
        reference_number: referenceNumber,
        title: formData.title.trim(),
        description: formData.description.trim(),
        severity: formData.severity,
        bug_type: formData.bug_type,
        platform: formData.platform,
        status: 'new' as const,
        priority,
        created_by: userId,
        environment_data: environmentData || {},
        reproduction_steps: formData.reproduction_steps.trim() || null,
        expected_behavior: formData.expected_behavior.trim() || null,
        actual_behavior: formData.actual_behavior.trim() || null
      };

      const { data: bug, error: bugError } = await supabase
        .from('bugs')
        .insert(bugData)
        .select()
        .single();

      if (bugError) throw bugError;

      // Upload files if any
      if (files.length > 0 && bug) {
        const uploadPromises = files.map(async (file, index) => {
          const fileName = `${bug.id}/${Date.now()}-${index}-${file.name}`;
          const { data: uploadData, error: uploadError } = await supabase.storage
            .from('bug-attachments')
            .upload(fileName, file);

          if (uploadError) throw uploadError;

          // Save attachment record
          await supabase.from('bug_attachments').insert({
            bug_id: bug.id,
            filename: file.name,
            file_path: uploadData.path,
            file_size: file.size,
            file_type: file.type,
            uploaded_by: userId
          });
        });

        await Promise.all(uploadPromises);
      }

      // Send notification email (this would typically be handled by a server function)
      await supabase.from('bug_notifications').insert({
        bug_id: bug.id,
        email: userId, // This should be user's email
        notification_type: 'submission',
        email_status: 'pending',
        email_content: {
          subject: `Bug Report Submitted - ${referenceNumber}`,
          body: `Thank you for submitting bug report ${referenceNumber}. We'll review it and get back to you soon.`
        }
      });

      setSuccess(referenceNumber);
      onSubmissionSuccess?.(referenceNumber);

      // Reset form
      setFormData({
        title: '',
        description: '',
        severity: 'medium',
        bug_type: 'functionality',
        platform: initialPlatform,
        reproduction_steps: '',
        expected_behavior: '',
        actual_behavior: ''
      });
      setFiles([]);

    } catch (err: any) {
      setError(`Failed to submit bug report: ${err.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  if (success) {
    return (
      <Card className="bg-gray-900 border-green-500/50 text-white max-w-2xl mx-auto">
        <CardContent className="p-8 text-center">
          <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4" />
          <h3 className="text-2xl font-bold text-green-400 mb-2">Bug Report Submitted!</h3>
          <p className="text-gray-200 mb-4">
            Your bug report has been submitted successfully.
          </p>
          <div className="bg-gray-800/50 border border-green-500/30 rounded-lg p-4 mb-6">
            <p className="text-sm text-gray-300 mb-2">Reference Number:</p>
            <p className="text-xl font-mono font-bold text-green-400">{success}</p>
          </div>
          <p className="text-sm text-gray-300 mb-6">
            You'll receive a confirmation email shortly. We'll keep you updated on the progress.
          </p>
          {onClose && (
            <Button 
              onClick={onClose}
              className="bg-orange-500 hover:bg-orange-600 text-white"
            >
              Close
            </Button>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-gray-900 border-gray-600 text-white max-w-4xl mx-auto">
      <CardHeader className="border-b border-gray-700">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-3 text-2xl">
            <BugIcon className="w-8 h-8 text-orange-400" />
            Report a Bug
          </CardTitle>
          {onClose && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={onClose}
              className="text-gray-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </Button>
          )}
        </div>
        <p className="text-gray-300 mt-2">
          Help us improve PopGuide by reporting bugs. Please provide as much detail as possible.
        </p>
      </CardHeader>

      <CardContent className="p-6">
        {error && (
          <Alert className="bg-red-900/50 border-red-500/50 text-red-200 mb-6">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Title */}
          <div>
            <label className="block text-sm font-semibold text-gray-200 mb-2">
              Bug Title *
            </label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              placeholder="Brief description of the issue"
              className="w-full bg-gray-800 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:border-orange-500 focus:outline-none"
              maxLength={100}
            />
          </div>

          {/* Platform Selection */}
          <div>
            <label className="block text-sm font-semibold text-gray-200 mb-2">
              Platform *
            </label>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              {platformOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, platform: option.value as BugPlatform }))}
                  className={`flex items-center gap-2 p-3 rounded-lg border transition-all ${
                    formData.platform === option.value
                      ? 'bg-orange-500/20 border-orange-500 text-orange-400'
                      : 'bg-gray-800 border-gray-600 text-gray-300 hover:border-gray-500'
                  }`}
                >
                  {option.icon}
                  <span className="text-sm font-medium">{option.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Severity and Type Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Severity */}
            <div>
              <label className="block text-sm font-semibold text-gray-200 mb-2">
                Severity *
              </label>
              <select
                value={formData.severity}
                onChange={(e) => setFormData(prev => ({ ...prev, severity: e.target.value as BugSeverity }))}
                className="w-full bg-gray-800 border border-gray-600 rounded-lg px-4 py-3 text-white focus:border-orange-500 focus:outline-none"
              >
                {severityOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label} - {option.description}
                  </option>
                ))}
              </select>
            </div>

            {/* Bug Type */}
            <div>
              <label className="block text-sm font-semibold text-gray-200 mb-2">
                Bug Type *
              </label>
              <select
                value={formData.bug_type}
                onChange={(e) => setFormData(prev => ({ ...prev, bug_type: e.target.value as BugType }))}
                className="w-full bg-gray-800 border border-gray-600 rounded-lg px-4 py-3 text-white focus:border-orange-500 focus:outline-none"
              >
                {typeOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label} - {option.description}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-semibold text-gray-200 mb-2">
              Description *
            </label>
            <textarea
              required
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Detailed description of the bug"
              rows={4}
              className="w-full bg-gray-800 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:border-orange-500 focus:outline-none resize-vertical"
            />
          </div>

          {/* Steps to Reproduce */}
          <div>
            <label className="block text-sm font-semibold text-gray-200 mb-2">
              Steps to Reproduce
            </label>
            <textarea
              value={formData.reproduction_steps}
              onChange={(e) => setFormData(prev => ({ ...prev, reproduction_steps: e.target.value }))}
              placeholder="1. Go to... &#10;2. Click on... &#10;3. See error"
              rows={3}
              className="w-full bg-gray-800 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:border-orange-500 focus:outline-none resize-vertical"
            />
          </div>

          {/* Expected vs Actual */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-200 mb-2">
                Expected Behavior
              </label>
              <textarea
                value={formData.expected_behavior}
                onChange={(e) => setFormData(prev => ({ ...prev, expected_behavior: e.target.value }))}
                placeholder="What should happen?"
                rows={3}
                className="w-full bg-gray-800 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:border-orange-500 focus:outline-none resize-vertical"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-200 mb-2">
                Actual Behavior
              </label>
              <textarea
                value={formData.actual_behavior}
                onChange={(e) => setFormData(prev => ({ ...prev, actual_behavior: e.target.value }))}
                placeholder="What actually happens?"
                rows={3}
                className="w-full bg-gray-800 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:border-orange-500 focus:outline-none resize-vertical"
              />
            </div>
          </div>

          {/* File Upload */}
          <div>
            <label className="block text-sm font-semibold text-gray-200 mb-2">
              Attachments (Screenshots, Videos, Logs)
            </label>
            <div className="border-2 border-dashed border-gray-600 rounded-lg p-6 text-center">
              <input
                type="file"
                multiple
                accept="image/*,video/*,.txt,.pdf"
                onChange={handleFileUpload}
                className="hidden"
                id="file-upload"
              />
              <label htmlFor="file-upload" className="cursor-pointer">
                <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-300 mb-1">Click to upload files</p>
                <p className="text-sm text-gray-500">Max 5 files, 10MB each. Images, videos, text, PDF</p>
              </label>
            </div>

            {files.length > 0 && (
              <div className="mt-4 space-y-2">
                {files.map((file, index) => (
                  <div key={index} className="flex items-center justify-between bg-gray-800 rounded-lg p-3">
                    <div className="flex items-center gap-3">
                      <FileText className="w-4 h-4 text-orange-400" />
                      <span className="text-sm text-gray-200">{file.name}</span>
                      <span className="text-xs text-gray-500">({(file.size / 1024 / 1024).toFixed(1)}MB)</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeFile(index)}
                      className="text-red-400 hover:text-red-300"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Environment Info Display */}
          {environmentData && (
            <div className="bg-gray-800/50 rounded-lg p-4">
              <h4 className="text-sm font-semibold text-gray-200 mb-3">Environment Information (Auto-detected)</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs text-gray-400">
                <div>
                  <span className="font-medium text-gray-300">Browser:</span>
                  <br />{environmentData.browser}
                </div>
                <div>
                  <span className="font-medium text-gray-300">OS:</span>
                  <br />{environmentData.os}
                </div>
                <div>
                  <span className="font-medium text-gray-300">Resolution:</span>
                  <br />{environmentData.screen_resolution}
                </div>
                <div>
                  <span className="font-medium text-gray-300">URL:</span>
                  <br />{environmentData.url.substring(0, 50)}...
                </div>
              </div>
            </div>
          )}

          {/* Submit Button */}
          <div className="flex justify-end gap-4 pt-4 border-t border-gray-700">
            {onClose && (
              <Button 
                type="button" 
                variant="outline" 
                onClick={onClose}
                className="border-gray-600 text-gray-300 hover:bg-gray-800"
              >
                Cancel
              </Button>
            )}
            <Button
              type="submit"
              disabled={submitting || !userId}
              className="bg-orange-500 hover:bg-orange-600 text-white px-8"
            >
              {submitting ? (
                <>
                  <Loader className="w-4 h-4 animate-spin mr-2" />
                  Submitting...
                </>
              ) : (
                'Submit Bug Report'
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default BugSubmissionForm; 