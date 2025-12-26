import { useState, useEffect } from 'react';
import { Bell, Volume2, Vibrate, Moon, X } from 'lucide-react';
import { axiosInstance } from '../lib/axios';
import toast from 'react-hot-toast';

const NotificationSettings = ({ onClose }) => {
  const [settings, setSettings] = useState({
    enabled: true,
    messages: true,
    groupMessages: true,
    contactRequests: true,
    calls: true,
    soundEnabled: true,
    vibrationEnabled: true,
    quietHours: {
      enabled: false,
      startTime: "22:00",
      endTime: "08:00"
    }
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const res = await axiosInstance.get('/notifications/settings');
      setSettings(res.data);
    } catch (error) {
      console.error('Error fetching settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateSettings = async (newSettings) => {
    try {
      await axiosInstance.put('/notifications/settings', newSettings);
      setSettings(newSettings);
      toast.success('Settings updated!');
    } catch (error) {
      console.error('Error updating settings:', error);
      toast.error('Failed to update settings');
    }
  };

  const handleToggle = (key, subKey = null) => {
    const newSettings = { ...settings };
    if (subKey) {
      newSettings[key][subKey] = !newSettings[key][subKey];
    } else {
      newSettings[key] = !newSettings[key];
    }
    updateSettings(newSettings);
  };

  const handleTimeChange = (type, value) => {
    const newSettings = {
      ...settings,
      quietHours: {
        ...settings.quietHours,
        [type]: value
      }
    };
    updateSettings(newSettings);
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-base-100 rounded-lg p-6">
          <span className="loading loading-spinner loading-lg"></span>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-base-100 rounded-lg w-full max-w-md max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-base-300">
          <div className="flex items-center gap-3">
            <Bell className="w-5 h-5" />
            <h2 className="text-xl font-semibold">Notification Settings</h2>
          </div>
          <button onClick={onClose} className="btn btn-ghost btn-sm btn-circle">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 overflow-y-auto max-h-[70vh]">
          {/* Master Toggle */}
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium">Enable Notifications</h3>
              <p className="text-sm text-base-content/60">Turn all notifications on/off</p>
            </div>
            <input
              type="checkbox"
              checked={settings.enabled}
              onChange={() => handleToggle('enabled')}
              className="toggle toggle-primary"
            />
          </div>

          {settings.enabled && (
            <>
              {/* Notification Types */}
              <div className="space-y-4">
                <h4 className="font-medium text-sm text-base-content/80">NOTIFICATION TYPES</h4>
                
                <div className="flex items-center justify-between">
                  <span>Direct Messages</span>
                  <input
                    type="checkbox"
                    checked={settings.messages}
                    onChange={() => handleToggle('messages')}
                    className="toggle toggle-sm"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <span>Group Messages</span>
                  <input
                    type="checkbox"
                    checked={settings.groupMessages}
                    onChange={() => handleToggle('groupMessages')}
                    className="toggle toggle-sm"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <span>Contact Requests</span>
                  <input
                    type="checkbox"
                    checked={settings.contactRequests}
                    onChange={() => handleToggle('contactRequests')}
                    className="toggle toggle-sm"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <span>Voice & Video Calls</span>
                  <input
                    type="checkbox"
                    checked={settings.calls}
                    onChange={() => handleToggle('calls')}
                    className="toggle toggle-sm"
                  />
                </div>
              </div>

              {/* Sound & Vibration */}
              <div className="space-y-4">
                <h4 className="font-medium text-sm text-base-content/80">SOUND & VIBRATION</h4>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Volume2 className="w-4 h-4" />
                    <span>Sound</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.soundEnabled}
                    onChange={() => handleToggle('soundEnabled')}
                    className="toggle toggle-sm"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Vibrate className="w-4 h-4" />
                    <span>Vibration</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.vibrationEnabled}
                    onChange={() => handleToggle('vibrationEnabled')}
                    className="toggle toggle-sm"
                  />
                </div>
              </div>

              {/* Quiet Hours */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Moon className="w-4 h-4" />
                    <div>
                      <h4 className="font-medium">Quiet Hours</h4>
                      <p className="text-xs text-base-content/60">Mute notifications during specific hours</p>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.quietHours.enabled}
                    onChange={() => handleToggle('quietHours', 'enabled')}
                    className="toggle toggle-sm"
                  />
                </div>

                {settings.quietHours.enabled && (
                  <div className="ml-6 space-y-3">
                    <div className="flex items-center gap-4">
                      <div>
                        <label className="text-sm text-base-content/60">From</label>
                        <input
                          type="time"
                          value={settings.quietHours.startTime}
                          onChange={(e) => handleTimeChange('startTime', e.target.value)}
                          className="input input-bordered input-sm w-full mt-1"
                        />
                      </div>
                      <div>
                        <label className="text-sm text-base-content/60">To</label>
                        <input
                          type="time"
                          value={settings.quietHours.endTime}
                          onChange={(e) => handleTimeChange('endTime', e.target.value)}
                          className="input input-bordered input-sm w-full mt-1"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default NotificationSettings;