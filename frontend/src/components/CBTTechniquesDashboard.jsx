import { useState } from 'react';
import { useWellnessStore } from '../store/useWellnessStore';
import AITherapistService from '../lib/aiTherapist.service';
import { Brain, Play, CheckCircle, Clock, HelpCircle } from 'lucide-react';

const CBTTechniquesDashboard = () => {
  const { moodScore, stressLevel } = useWellnessStore();
  const [activeTechnique, setActiveTechnique] = useState(null);
  const [completedTechniques, setCompletedTechniques] = useState([]);

  const allTechniques = [
    ...AITherapistService.getCBTTechniques(moodScore, stressLevel, 'anxiety'),
    ...AITherapistService.getCBTTechniques(moodScore, stressLevel, 'depression'),
    ...AITherapistService.getCBTTechniques(moodScore, stressLevel, 'anger')
  ];

  const thoughtChallengingQuestions = AITherapistService.getThoughtChallengingQuestions();
  const copingStrategies = AITherapistService.getCopingStrategies();

  const startTechnique = (technique) => {
    setActiveTechnique(technique);
  };

  const completeTechnique = (techniqueId) => {
    setCompletedTechniques(prev => [...prev, techniqueId]);
    setActiveTechnique(null);
  };

  return (
    <div className="card bg-base-100 shadow-lg">
      <div className="card-body">
        <div className="flex items-center gap-2 mb-4">
          <Brain className="w-5 h-5 text-primary" />
          <h3 className="card-title">CBT Techniques & Coping Strategies</h3>
        </div>

        {/* Current Mood Assessment */}
        <div className="alert alert-info mb-4">
          <div className="flex items-center gap-2">
            <span className="text-2xl">
              {moodScore <= 2 ? '😢' : moodScore <= 3 ? '😐' : '😊'}
            </span>
            <div>
              <div className="font-medium">Current State</div>
              <div className="text-xs">
                Mood: {moodScore}/5 • Stress: {stressLevel}% • 
                {stressLevel > 60 ? ' High stress detected' : ' Manageable stress levels'}
              </div>
            </div>
          </div>
        </div>

        {/* Recommended Techniques */}
        <div className="mb-6">
          <h4 className="font-semibold mb-3">Recommended for You</h4>
          <div className="grid gap-3">
            {allTechniques.slice(0, 3).map((technique, index) => (
              <div key={index} className="p-3 border border-base-300 rounded-lg">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <div className="font-medium text-sm">{technique.name}</div>
                    <div className="text-xs text-base-content/70">{technique.description}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-3 h-3" />
                    <span className="text-xs">{technique.duration}</span>
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <button 
                    onClick={() => startTechnique(technique)}
                    className="btn btn-xs btn-primary"
                  >
                    <Play className="w-3 h-3" />
                    Start
                  </button>
                  {completedTechniques.includes(technique.name) && (
                    <div className="flex items-center gap-1 text-success">
                      <CheckCircle className="w-3 h-3" />
                      <span className="text-xs">Completed</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Coping Strategies */}
        <div className="mb-6">
          <h4 className="font-semibold mb-3">Quick Coping Strategies</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-3 bg-success/10 rounded-lg">
              <div className="font-medium text-sm mb-2">Immediate (0-5 min)</div>
              {copingStrategies.immediate.slice(0, 3).map((strategy, index) => (
                <div key={index} className="text-xs mb-1">• {strategy}</div>
              ))}
            </div>
            
            <div className="p-3 bg-warning/10 rounded-lg">
              <div className="font-medium text-sm mb-2">Short-term (5-30 min)</div>
              {copingStrategies.shortTerm.slice(0, 3).map((strategy, index) => (
                <div key={index} className="text-xs mb-1">• {strategy}</div>
              ))}
            </div>
            
            <div className="p-3 bg-info/10 rounded-lg">
              <div className="font-medium text-sm mb-2">Long-term</div>
              {copingStrategies.longTerm.slice(0, 3).map((strategy, index) => (
                <div key={index} className="text-xs mb-1">• {strategy}</div>
              ))}
            </div>
          </div>
        </div>

        {/* Thought Challenging */}
        <div className="collapse collapse-arrow bg-base-200">
          <input type="checkbox" />
          <div className="collapse-title text-sm font-medium flex items-center gap-2">
            <HelpCircle className="w-4 h-4" />
            Thought Challenging Questions
          </div>
          <div className="collapse-content">
            <div className="grid gap-2 pt-2">
              {thoughtChallengingQuestions.slice(0, 4).map((question, index) => (
                <div key={index} className="text-xs p-2 bg-base-100 rounded">
                  {question}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Active Technique Modal */}
      {activeTechnique && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-base-100 rounded-lg p-6 max-w-md mx-4">
            <h3 className="text-lg font-bold mb-3">{activeTechnique.name}</h3>
            <p className="text-sm text-base-content/80 mb-4">{activeTechnique.description}</p>
            
            <div className="space-y-3 mb-4">
              <div className="text-sm font-medium">Follow these steps:</div>
              {activeTechnique.steps.map((step, index) => (
                <div key={index} className="flex items-start gap-3 p-2 bg-base-200 rounded">
                  <span className="badge badge-primary badge-sm mt-0.5">{index + 1}</span>
                  <span className="text-sm">{step}</span>
                </div>
              ))}
            </div>
            
            <div className="alert alert-info mb-4">
              <Clock className="w-4 h-4" />
              <span className="text-sm">Take your time: {activeTechnique.duration}</span>
            </div>
            
            <div className="flex gap-2">
              <button 
                onClick={() => completeTechnique(activeTechnique.name)}
                className="btn btn-success flex-1"
              >
                <CheckCircle className="w-4 h-4" />
                Mark Complete
              </button>
              <button 
                onClick={() => setActiveTechnique(null)}
                className="btn btn-ghost"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CBTTechniquesDashboard;