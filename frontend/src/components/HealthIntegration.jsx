import { useState, useEffect } from 'react';
import { useHealthStore } from '../store/useHealthStore';
import { Activity, Heart, Moon, Smartphone, Watch, Zap } from 'lucide-react';

const HealthIntegration = () => {
  const { 
    healthData, 
    healthInsights, 
    isConnecting, 
    connectDevice, 
    fetchHealthData, 
    fetchHealthInsights,
    simulateDeviceConnection,
    disconnectDevice
  } = useHealthStore();
  
  const [showConnectModal, setShowConnectModal] = useState(false);

  useEffect(() => {
    fetchHealthData();
    fetchHealthInsights();
  }, []);

  const devices = [
    { id: 'fitbit', name: 'Fitbit', icon: Watch, color: 'text-green-500' },
    { id: 'apple_health', name: 'Apple Health', icon: Heart, color: 'text-red-500' },
    { id: 'google_fit', name: 'Google Fit', icon: Activity, color: 'text-blue-500' },
    { id: 'samsung_health', name: 'Samsung Health', icon: Smartphone, color: 'text-purple-500' },
  ];

  const latestData = healthData?.[0];

  return (
    <div className="space-y-6">
      {/* Connection Status */}
      <div className="card bg-base-100 shadow-lg">
        <div className="card-body">
          <div className="flex justify-between items-center mb-4">
            <h3 className="card-title">Health Devices 🩺</h3>
            <button 
              onClick={() => setShowConnectModal(true)}
              className="btn btn-primary btn-sm"
            >
              Connect Device
            </button>
          </div>

          {latestData?.connectedDevices?.length > 0 ? (
            <div className="space-y-2">
              {latestData.connectedDevices.map((device, index) => {
                const deviceInfo = devices.find(d => d.id === device.type);
                return (
                  <div key={index} className="flex items-center justify-between p-3 bg-base-200 rounded-lg">
                    <div className="flex items-center gap-3">
                      {deviceInfo && <deviceInfo.icon className={`w-5 h-5 ${deviceInfo.color}`} />}
                      <div>
                        <div className="font-medium">{deviceInfo?.name || device.type}</div>
                        <div className="text-xs text-base-content/60">
                          Last sync: {new Date(device.lastSync).toLocaleTimeString()}
                        </div>
                      </div>
                    </div>
                    <button 
                      onClick={() => disconnectDevice(device.type)}
                      className="btn btn-error btn-xs"
                    >
                      Remove
                    </button>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-4 text-base-content/60">
              <Activity className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>No devices connected</p>
              <p className="text-xs">Connect your fitness tracker to get personalized wellness insights</p>
            </div>
          )}
        </div>
      </div>

      {/* Health Overview */}
      {latestData && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="stat bg-base-200 rounded-lg">
            <div className="stat-figure text-primary">
              <Activity className="w-8 h-8" />
            </div>
            <div className="stat-title">Steps Today</div>
            <div className="stat-value text-primary">{latestData.fitness?.steps?.toLocaleString() || 0}</div>
            <div className="stat-desc">Goal: 10,000 steps</div>
          </div>

          <div className="stat bg-base-200 rounded-lg">
            <div className="stat-figure text-secondary">
              <Moon className="w-8 h-8" />
            </div>
            <div className="stat-title">Sleep Quality</div>
            <div className="stat-value text-secondary">
              {latestData.sleep?.quality ? `${latestData.sleep.quality}/5` : 'N/A'}
            </div>
            <div className="stat-desc">
              {latestData.sleep?.duration ? `${Math.floor(latestData.sleep.duration / 60)}h ${latestData.sleep.duration % 60}m` : 'No data'}
            </div>
          </div>

          <div className="stat bg-base-200 rounded-lg">
            <div className="stat-figure text-accent">
              <Zap className="w-8 h-8" />
            </div>
            <div className="stat-title">Energy Level</div>
            <div className="stat-value text-accent">
              {latestData.wellnessImpact?.energyLevel || 5}/10
            </div>
            <div className="stat-desc">Based on health data</div>
          </div>
        </div>
      )}

      {/* Health Insights */}
      {healthInsights?.recommendations?.length > 0 && (
        <div className="card bg-base-100 shadow-lg">
          <div className="card-body">
            <h3 className="card-title">Health-Based Recommendations 💡</h3>
            <div className="space-y-3">
              {healthInsights.recommendations.map((rec, index) => (
                <div 
                  key={index}
                  className={`alert ${rec.priority === 'high' ? 'alert-warning' : 'alert-info'}`}
                >
                  <span className="text-sm">{rec.message}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Connect Device Modal */}
      {showConnectModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-base-100 rounded-2xl p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-bold mb-4">Connect Health Device</h3>
            
            <div className="space-y-3">
              {devices.map(device => (
                <button
                  key={device.id}
                  onClick={async () => {
                    try {
                      await simulateDeviceConnection(device.id);
                      setShowConnectModal(false);
                    } catch (error) {
                      console.log('Connection cancelled or failed');
                    }
                  }}
                  disabled={isConnecting}
                  className="btn btn-ghost w-full justify-start gap-3"
                >
                  <device.icon className={`w-5 h-5 ${device.color}`} />
                  Connect {device.name}
                  {isConnecting && <span className="loading loading-spinner loading-sm"></span>}
                </button>
              ))}
            </div>

            <div className="flex gap-2 mt-6">
              <button 
                onClick={() => setShowConnectModal(false)}
                className="btn btn-ghost flex-1"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HealthIntegration;