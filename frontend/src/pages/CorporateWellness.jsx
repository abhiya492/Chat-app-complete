import CorporateWellnessDashboard from '../components/CorporateWellnessDashboard';

const CorporateWellness = () => {
  return (
    <div className="min-h-screen bg-base-100 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">Corporate Wellness Dashboard</h1>
          <p className="text-base-content/70">
            Monitor and improve your organization's employee wellbeing with data-driven insights.
          </p>
        </div>
        
        <CorporateWellnessDashboard />
      </div>
    </div>
  );
};

export default CorporateWellness;