import { useCircadianStore } from '../store/useCircadianStore';
import { Sun, Moon, Bell, Coffee, Settings } from 'lucide-react';

const CircadianSettings = () => {
  const { circadianSettings, updateSettings, timeOfDay, currentRecommendations } = useCircadianStore();

  const toggleSetting = (setting) => {
    updateSettings({ [setting]: !circadianSettings[setting] });
  };

  return (
    <div className="card bg-base-100 shadow-lg">
      <div className="card-body">
        <div className="flex items-center gap-2 mb-4">
          <Sun className="w-5 h-5 text-primary" />
          <h3 className="card-title">Circadian Wellness 🌙</h3>
        </div>

        {/* Current Status */}
        <div className="alert alert-info mb-4">
          <div className="flex items-center gap-2">
            {timeOfDay === 'morning' && <Coffee className="w-4 h-4" />}
            {timeOfDay === 'afternoon' && <Sun className="w-4 h-4" />}
            {timeOfDay === 'evening' && <Sun className="w-4 h-4 text-orange-500" />}
            {timeOfDay === 'night' && <Moon className="w-4 h-4" />}
            <div>
              <div className="font-medium capitalize">Current: {timeOfDay}</div>
              <div className="text-xs">{currentRecommendations?.chatSuggestion}</div>
            </div>
          </div>
        </div>

        {/* Settings */}
        <div className="space-y-4">
          <div className="form-control">
            <label className="label cursor-pointer">
              <span className="label-text flex items-center gap-2">
                <Sun className="w-4 h-4" />
                Auto Theme Adjustment
              </span>
              <input 
                type="checkbox" 
                className="toggle toggle-primary" 
                checked={circadianSettings.autoTheme}
                onChange={() => toggleSetting('autoTheme')}
              />
            </label>
            <div className="label">
              <span className="label-text-alt">Automatically adjust theme based on time of day</span>
            </div>
          </div>

          <div className="form-control">
            <label className="label cursor-pointer">
              <span className="label-text flex items-center gap-2">
                <Bell className="w-4 h-4" />
                Adaptive Notifications
              </span>
              <input 
                type="checkbox" 
                className="toggle toggle-primary" 
                checked={circadianSettings.adaptiveNotifications}
                onChange={() => toggleSetting('adaptiveNotifications')}
              />
            </label>
            <div className="label">
              <span className="label-text-alt">Reduce notifications during night hours</span>
            </div>
          </div>

          <div className="form-control">
            <label className="label cursor-pointer">
              <span className="label-text flex items-center gap-2">
                <Coffee className="w-4 h-4" />
                Smart Break Timing
              </span>
              <input 
                type="checkbox" 
                className="toggle toggle-primary" 
                checked={circadianSettings.smartBreaks}
                onChange={() => toggleSetting('smartBreaks')}
              />
            </label>
            <div className="label">
              <span className="label-text-alt">Adjust break intervals based on your natural rhythm</span>
            </div>
          </div>

          <div className="form-control">
            <label className="label cursor-pointer">
              <span className="label-text flex items-center gap-2">
                <Moon className="w-4 h-4" />
                Sleep Mode
              </span>
              <input 
                type="checkbox" 
                className="toggle toggle-primary" 
                checked={circadianSettings.sleepMode}
                onChange={() => toggleSetting('sleepMode')}
              />
            </label>
            <div className="label">
              <span className="label-text-alt">Enable sleep-friendly features at night</span>
            </div>
          </div>
        </div>

        {/* Current Recommendations */}
        {currentRecommendations && (
          <div className="mt-6 p-3 bg-base-200 rounded-lg">
            <div className="text-sm font-medium mb-2">Current Wellness Tip:</div>
            <div className="text-xs text-base-content/70">
              {currentRecommendations.wellnessTip}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CircadianSettings;