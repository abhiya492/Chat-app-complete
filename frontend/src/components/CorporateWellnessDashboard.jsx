import { useState, useEffect } from 'react';
import { axiosInstance } from '../lib/axios';
import { Building2, Users, TrendingUp, AlertTriangle, CheckCircle, BarChart3 } from 'lucide-react';

const CorporateWellnessDashboard = () => {
  const [organizationData, setOrganizationData] = useState(null);
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [teamData, setTeamData] = useState(null);
  const [trends, setTrends] = useState([]);
  const [loading, setLoading] = useState(true);

  // Mock organization ID - in real app, get from auth context
  const organizationId = 'org_123';

  useEffect(() => {
    fetchOrganizationData();
    fetchTrends();
  }, []);

  const fetchOrganizationData = async () => {
    try {
      const res = await axiosInstance.get(`/corporate-wellness/organization/${organizationId}`);
      setOrganizationData(res.data);
    } catch (error) {
      console.error('Failed to fetch organization data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTeamData = async (teamId) => {
    try {
      const res = await axiosInstance.get(`/corporate-wellness/team/${organizationId}/${teamId}`);
      setTeamData(res.data);
    } catch (error) {
      console.error('Failed to fetch team data:', error);
    }
  };

  const fetchTrends = async () => {
    try {
      const res = await axiosInstance.get(`/corporate-wellness/trends/${organizationId}?days=7`);
      setTrends(res.data);
    } catch (error) {
      console.error('Failed to fetch trends:', error);
    }
  };

  const getScoreColor = (score, type) => {
    const benchmarks = organizationData?.benchmarks?.[type];
    if (!benchmarks) return 'text-base-content';
    
    if (score >= benchmarks.excellent) return 'text-success';
    if (score >= benchmarks.good) return 'text-info';
    if (score >= benchmarks.fair) return 'text-warning';
    return 'text-error';
  };

  if (loading) {
    return <div className="loading loading-spinner loading-lg"></div>;
  }

  return (
    <div className="space-y-6">
      {/* Organization Overview */}
      <div className="card bg-base-100 shadow-lg">
        <div className="card-body">
          <div className="flex items-center gap-2 mb-4">
            <Building2 className="w-6 h-6 text-primary" />
            <h2 className="card-title">Organization Wellness Overview</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="stat bg-base-200 rounded-lg">
              <div className="stat-figure text-primary">
                <Users className="w-8 h-8" />
              </div>
              <div className="stat-title">Total Employees</div>
              <div className="stat-value text-primary">{organizationData?.totalEmployees || 0}</div>
              <div className="stat-desc">{organizationData?.totalTeams || 0} teams</div>
            </div>

            <div className="stat bg-base-200 rounded-lg">
              <div className="stat-title">Avg Mood Score</div>
              <div className={`stat-value ${getScoreColor(organizationData?.organizationMood, 'moodScore')}`}>
                {organizationData?.organizationMood?.toFixed(1) || '3.0'}/5
              </div>
              <div className="stat-desc">Organization-wide</div>
            </div>

            <div className="stat bg-base-200 rounded-lg">
              <div className="stat-title">Avg Stress Level</div>
              <div className={`stat-value ${getScoreColor(organizationData?.organizationStress, 'stressLevel')}`}>
                {organizationData?.organizationStress?.toFixed(0) || '0'}%
              </div>
              <div className="stat-desc">Needs attention if >60%</div>
            </div>

            <div className="stat bg-base-200 rounded-lg">
              <div className="stat-title">Wellness Engagement</div>
              <div className={`stat-value ${getScoreColor(organizationData?.avgEngagement, 'engagement')}`}>
                {organizationData?.avgEngagement?.toFixed(0) || '0'}%
              </div>
              <div className="stat-desc">Feature adoption rate</div>
            </div>
          </div>

          {/* Team Breakdown */}
          <div>
            <h3 className="font-semibold mb-3">Team Performance</h3>
            <div className="overflow-x-auto">
              <table className="table table-sm">
                <thead>
                  <tr>
                    <th>Team</th>
                    <th>Members</th>
                    <th>Mood</th>
                    <th>Stress</th>
                    <th>Engagement</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {organizationData?.teams?.map((team, index) => (
                    <tr key={team._id}>
                      <td>Team {team._id}</td>
                      <td>{team.totalMembers}</td>
                      <td>
                        <span className={getScoreColor(team.avgMood, 'moodScore')}>
                          {team.avgMood?.toFixed(1)}/5
                        </span>
                      </td>
                      <td>
                        <span className={getScoreColor(team.avgStress, 'stressLevel')}>
                          {team.avgStress?.toFixed(0)}%
                        </span>
                      </td>
                      <td>
                        <span className={getScoreColor(team.engagement, 'engagement')}>
                          {team.engagement?.toFixed(0)}%
                        </span>
                      </td>
                      <td>
                        <button 
                          onClick={() => {
                            setSelectedTeam(team._id);
                            fetchTeamData(team._id);
                          }}
                          className="btn btn-xs btn-primary"
                        >
                          View Details
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Team Details Modal */}
      {selectedTeam && teamData && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-base-100 rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">Team {selectedTeam} Wellness Report</h3>
              <button 
                onClick={() => setSelectedTeam(null)}
                className="btn btn-ghost btn-sm"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
              <div className="stat bg-base-200 rounded p-3">
                <div className="stat-title text-xs">Active Members</div>
                <div className="stat-value text-sm">{teamData.teamMetrics?.activeMembers}/{teamData.teamMetrics?.totalMembers}</div>
              </div>
              <div className="stat bg-base-200 rounded p-3">
                <div className="stat-title text-xs">Breaks Taken</div>
                <div className="stat-value text-sm">{teamData.teamMetrics?.breaksTaken}</div>
              </div>
              <div className="stat bg-base-200 rounded p-3">
                <div className="stat-title text-xs">Mindfulness</div>
                <div className="stat-value text-sm">{teamData.teamMetrics?.mindfulnessMinutes}min</div>
              </div>
            </div>

            {/* Recommendations */}
            {teamData.recommendations?.length > 0 && (
              <div className="mb-4">
                <h4 className="font-semibold mb-3 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4" />
                  Wellness Recommendations
                </h4>
                <div className="space-y-3">
                  {teamData.recommendations.map((rec, index) => (
                    <div key={index} className={`alert ${
                      rec.priority === 'high' ? 'alert-warning' : 
                      rec.priority === 'critical' ? 'alert-error' : 'alert-info'
                    }`}>
                      <div className="flex-1">
                        <div className="font-medium text-sm">{rec.description}</div>
                        <div className="text-xs mt-1">
                          Suggested actions:
                          <ul className="list-disc list-inside mt-1">
                            {rec.suggestedActions?.slice(0, 2).map((action, i) => (
                              <li key={i}>{action}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex gap-2">
              <button className="btn btn-primary btn-sm">
                <BarChart3 className="w-4 h-4" />
                Generate Full Report
              </button>
              <button 
                onClick={() => setSelectedTeam(null)}
                className="btn btn-ghost btn-sm"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Wellness Benchmarks */}
      <div className="card bg-base-100 shadow-lg">
        <div className="card-body">
          <h3 className="card-title mb-4">Wellness Benchmarks</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="text-sm font-medium">Mood Score Ranges</div>
              <div className="space-y-1 text-xs">
                <div className="flex justify-between"><span>Excellent:</span><span className="text-success">4.5+ / 5</span></div>
                <div className="flex justify-between"><span>Good:</span><span className="text-info">3.5 - 4.4</span></div>
                <div className="flex justify-between"><span>Fair:</span><span className="text-warning">2.5 - 3.4</span></div>
                <div className="flex justify-between"><span>Poor:</span><span className="text-error">&lt; 2.5</span></div>
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="text-sm font-medium">Stress Level Ranges</div>
              <div className="space-y-1 text-xs">
                <div className="flex justify-between"><span>Excellent:</span><span className="text-success">&lt; 30%</span></div>
                <div className="flex justify-between"><span>Good:</span><span className="text-info">30 - 50%</span></div>
                <div className="flex justify-between"><span>Fair:</span><span className="text-warning">50 - 70%</span></div>
                <div className="flex justify-between"><span>Poor:</span><span className="text-error">&gt; 70%</span></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CorporateWellnessDashboard;