import { useState, useEffect } from "react";
import { axiosInstance } from "../lib/axios";
import { 
  Shield, 
  Eye, 
  EyeOff, 
  Download, 
  Trash2, 
  Lock, 
  Unlock,
  AlertTriangle,
  CheckCircle,
  Info,
  Settings
} from "lucide-react";
import toast from "react-hot-toast";

const PrivacyDashboard = () => {
  const [privacyHealth, setPrivacyHealth] = useState(null);
  const [privacySettings, setPrivacySettings] = useState({});
  const [exportLoading, setExportLoading] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPrivacyData();
  }, []);

  const loadPrivacyData = async () => {
    try {
      const [healthRes, settingsRes] = await Promise.all([
        axiosInstance.get('/privacy/health'),
        axiosInstance.get('/privacy/settings')
      ]);
      
      setPrivacyHealth(healthRes.data);
      setPrivacySettings(settingsRes.data);
    } catch (error) {
      toast.error('Failed to load privacy data');
    } finally {
      setLoading(false);
    }
  };

  const updatePrivacySettings = async (newSettings) => {
    try {
      await axiosInstance.put('/privacy/settings', { privacy: newSettings });
      setPrivacySettings(newSettings);
      toast.success('Privacy settings updated');
    } catch (error) {
      toast.error('Failed to update settings');
    }
  };

  const exportData = async (format) => {
    setExportLoading(true);
    try {
      const res = await axiosInstance.post('/privacy/export', { format });
      toast.success('Export started! Download will begin shortly.');
      
      // Trigger download
      window.open(res.data.downloadUrl, '_blank');
    } catch (error) {
      toast.error('Export failed');
    } finally {
      setExportLoading(false);
    }
  };

  const getRiskColor = (level) => {
    switch (level) {
      case 'low': return 'text-success';
      case 'medium': return 'text-warning';
      case 'high': return 'text-error';
      case 'critical': return 'text-error';
      default: return 'text-base-content';
    }
  };

  const getRiskIcon = (level) => {
    switch (level) {
      case 'low': return <CheckCircle className="w-5 h-5" />;
      case 'medium': return <Info className="w-5 h-5" />;
      case 'high': return <AlertTriangle className="w-5 h-5" />;
      case 'critical': return <AlertTriangle className="w-5 h-5" />;
      default: return <Shield className="w-5 h-5" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="loading loading-spinner loading-lg"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Shield className="w-8 h-8 text-primary" />
        <div>
          <h1 className="text-3xl font-bold">Privacy & Security</h1>
          <p className="text-base-content/70">Manage your data privacy and security settings</p>
        </div>
      </div>

      {/* Privacy Health Score */}
      {privacyHealth && (
        <div className="card bg-base-100 shadow-lg">
          <div className="card-body">
            <h2 className="card-title flex items-center gap-2">
              <Shield className="w-5 h-5" />
              Privacy Health Score
            </h2>
            
            <div className="flex items-center gap-4 mb-4">
              <div className="radial-progress text-primary" 
                   style={{"--value": privacyHealth.overallHealth}}>
                {privacyHealth.overallHealth}%
              </div>
              <div>
                <p className="text-lg font-semibold">Overall Privacy Health</p>
                <p className="text-sm text-base-content/70">
                  Based on {privacyHealth.totalConversations} conversations
                </p>
              </div>
            </div>

            {/* Risk Distribution */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Object.entries(privacyHealth.riskDistribution).map(([level, count]) => (
                <div key={level} className="stat bg-base-200 rounded-lg p-3">
                  <div className={`stat-figure ${getRiskColor(level)}`}>
                    {getRiskIcon(level)}
                  </div>
                  <div className="stat-title text-xs">{level.toUpperCase()}</div>
                  <div className="stat-value text-lg">{count}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Privacy Settings */}
      <div className="card bg-base-100 shadow-lg">
        <div className="card-body">
          <h2 className="card-title flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Privacy Settings
          </h2>

          <div className="space-y-4">
            {/* Show Last Seen */}
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium">Show Last Seen</h3>
                <p className="text-sm text-base-content/70">
                  Let others see when you were last online
                </p>
              </div>
              <input
                type="checkbox"
                className="toggle toggle-primary"
                checked={privacySettings.showLastSeen ?? true}
                onChange={(e) => updatePrivacySettings({
                  ...privacySettings,
                  showLastSeen: e.target.checked
                })}
              />
            </div>

            {/* Show Profile Picture */}
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium">Show Profile Picture</h3>
                <p className="text-sm text-base-content/70">
                  Display your profile picture to other users
                </p>
              </div>
              <input
                type="checkbox"
                className="toggle toggle-primary"
                checked={privacySettings.showProfilePic ?? true}
                onChange={(e) => updatePrivacySettings({
                  ...privacySettings,
                  showProfilePic: e.target.checked
                })}
              />
            </div>

            {/* Show Status */}
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium">Show Status Message</h3>
                <p className="text-sm text-base-content/70">
                  Let others see your status message
                </p>
              </div>
              <input
                type="checkbox"
                className="toggle toggle-primary"
                checked={privacySettings.showStatus ?? true}
                onChange={(e) => updatePrivacySettings({
                  ...privacySettings,
                  showStatus: e.target.checked
                })}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Data Export */}
      <div className="card bg-base-100 shadow-lg">
        <div className="card-body">
          <h2 className="card-title flex items-center gap-2">
            <Download className="w-5 h-5" />
            Export Your Data
          </h2>
          
          <p className="text-base-content/70 mb-4">
            Download all your data including messages, contacts, and call history.
          </p>

          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => exportData('json')}
              disabled={exportLoading}
              className="btn btn-primary"
            >
              {exportLoading ? (
                <span className="loading loading-spinner loading-sm"></span>
              ) : (
                <Download className="w-4 h-4" />
              )}
              Export as JSON
            </button>
            
            <button
              onClick={() => exportData('csv')}
              disabled={exportLoading}
              className="btn btn-outline btn-primary"
            >
              Export as CSV
            </button>
            
            <button
              onClick={() => exportData('zip')}
              disabled={exportLoading}
              className="btn btn-outline btn-primary"
            >
              Export as ZIP
            </button>
          </div>
        </div>
      </div>

      {/* Security Features */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Encryption */}
        <div className="card bg-base-100 shadow-lg">
          <div className="card-body">
            <h3 className="card-title flex items-center gap-2">
              <Lock className="w-5 h-5" />
              End-to-End Encryption
            </h3>
            <p className="text-sm text-base-content/70 mb-4">
              Secure your messages with zero-knowledge encryption
            </p>
            <button className="btn btn-primary btn-sm">
              Enable Encryption
            </button>
          </div>
        </div>

        {/* Anonymous Chat */}
        <div className="card bg-base-100 shadow-lg">
          <div className="card-body">
            <h3 className="card-title flex items-center gap-2">
              <EyeOff className="w-5 h-5" />
              Anonymous Chat
            </h3>
            <p className="text-sm text-base-content/70 mb-4">
              Start anonymous conversations that auto-delete
            </p>
            <button className="btn btn-secondary btn-sm">
              Start Anonymous Chat
            </button>
          </div>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="card bg-error/10 border border-error/20">
        <div className="card-body">
          <h2 className="card-title text-error flex items-center gap-2">
            <AlertTriangle className="w-5 h-5" />
            Danger Zone
          </h2>
          
          <div className="space-y-4">
            <div>
              <h3 className="font-medium mb-2">Delete All Data</h3>
              <p className="text-sm text-base-content/70 mb-3">
                Permanently delete all your messages, contacts, and account data.
                This action cannot be undone.
              </p>
              <button className="btn btn-error btn-sm">
                <Trash2 className="w-4 h-4" />
                Request Account Deletion
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrivacyDashboard;