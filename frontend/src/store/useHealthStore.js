import { create } from 'zustand';
import { axiosInstance } from '../lib/axios';

export const useHealthStore = create((set, get) => ({
  healthData: null,
  connectedDevices: [],
  healthInsights: null,
  isConnecting: false,
  
  connectDevice: async (deviceType, data) => {
    set({ isConnecting: true });
    try {
      const res = await axiosInstance.post('/health/connect', {
        deviceType,
        ...data
      });
      
      await get().fetchHealthData();
      return res.data;
    } catch (error) {
      throw error;
    } finally {
      set({ isConnecting: false });
    }
  },
  
  disconnectDevice: async (deviceType) => {
    try {
      await axiosInstance.delete(`/health/disconnect/${deviceType}`);
      await get().fetchHealthData();
    } catch (error) {
      console.error('Failed to disconnect device:', error);
    }
  },
  
  fetchHealthData: async (days = 7) => {
    try {
      const res = await axiosInstance.get(`/health/data?days=${days}`);
      set({ healthData: res.data });
    } catch (error) {
      console.error('Failed to fetch health data:', error);
    }
  },
  
  fetchHealthInsights: async () => {
    try {
      const res = await axiosInstance.get('/health/insights');
      set({ healthInsights: res.data });
    } catch (error) {
      console.error('Failed to fetch health insights:', error);
    }
  },
  
  syncHealthData: async (deviceType) => {
    try {
      await axiosInstance.post('/health/sync', { deviceType });
      await get().fetchHealthData();
      await get().fetchHealthInsights();
    } catch (error) {
      console.error('Failed to sync health data:', error);
    }
  },
  
  // Simulate device connections for demo
  simulateDeviceConnection: async (deviceType) => {
    // Show actual connection flow instead of auto-connecting
    const authUrl = `https://api.${deviceType}.com/oauth/authorize?client_id=demo&redirect_uri=app://callback`;
    
    // In real app, this would open OAuth flow
    const confirmed = window.confirm(`This would redirect you to ${deviceType} to authorize access. Simulate successful connection?`);
    
    if (confirmed) {
      const mockData = {
        fitbit: {
          accessToken: 'mock_fitbit_token',
          healthData: {
            steps: Math.floor(Math.random() * 5000) + 5000,
            calories: Math.floor(Math.random() * 1000) + 1500,
            sleep: { duration: Math.floor(Math.random() * 120) + 360 }
          }
        },
        apple_health: {
          healthData: {
            stepCount: Math.floor(Math.random() * 8000) + 4000,
            heartRate: Math.floor(Math.random() * 20) + 70,
            sleepAnalysis: { duration: Math.floor(Math.random() * 60) + 420 }
          }
        }
      };
      
      return get().connectDevice(deviceType, mockData[deviceType]);
    }
    
    throw new Error('User cancelled connection');
  }
}));