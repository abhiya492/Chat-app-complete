import { useState, useEffect } from "react";
import { BarChart3, Activity, Users, MessageSquare } from "lucide-react";
import { axiosInstance } from "../lib/axios";

const AnalyticsDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await axiosInstance.get("/analytics/stats");
      setStats(res.data);
    } catch (error) {
      console.error("Failed to fetch stats:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-4">
        <BarChart3 className="text-primary" size={24} />
        <h2 className="text-2xl font-bold">Analytics Dashboard</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="stat bg-base-200 rounded-lg">
          <div className="stat-figure text-primary">
            <Users size={32} />
          </div>
          <div className="stat-title">Total Users</div>
          <div className="stat-value text-primary">{stats?.totalUsers || 0}</div>
        </div>

        <div className="stat bg-base-200 rounded-lg">
          <div className="stat-figure text-secondary">
            <Activity size={32} />
          </div>
          <div className="stat-title">Total Events</div>
          <div className="stat-value text-secondary">{stats?.totalEvents || 0}</div>
        </div>

        <div className="stat bg-base-200 rounded-lg">
          <div className="stat-figure text-accent">
            <MessageSquare size={32} />
          </div>
          <div className="stat-title">Event Types</div>
          <div className="stat-value text-accent">{stats?.eventStats?.length || 0}</div>
        </div>
      </div>

      <div className="bg-base-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4">Top Events</h3>
        <div className="space-y-2">
          {stats?.eventStats?.slice(0, 5).map((stat, idx) => (
            <div key={idx} className="flex justify-between items-center p-3 bg-base-100 rounded">
              <span className="font-medium">{stat._id}</span>
              <span className="badge badge-primary">{stat.count}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-base-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {stats?.recentActivity?.map((activity, idx) => (
            <div key={idx} className="flex justify-between items-center p-2 text-sm">
              <span>{activity.userId?.fullName || 'Unknown'}</span>
              <span className="text-base-content/60">{activity.event}</span>
              <span className="text-xs text-base-content/50">
                {new Date(activity.createdAt).toLocaleTimeString()}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;
