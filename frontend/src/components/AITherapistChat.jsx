import { useState, useEffect, useRef } from 'react';
import { useWellnessStore } from '../store/useWellnessStore';
import AITherapistService from '../lib/aiTherapist.service';
import { Brain, Send, X, Heart, AlertTriangle } from 'lucide-react';

const AITherapistChat = () => {
  const { moodScore, stressLevel } = useWellnessStore();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [currentTechnique, setCurrentTechnique] = useState(null);
  const [showCrisisHelp, setShowCrisisHelp] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      // Initial greeting
      const greeting = {
        id: Date.now(),
        type: 'therapist',
        content: "Hello! I'm here to support you with evidence-based wellness techniques. How are you feeling right now?",
        timestamp: new Date()
      };
      setMessages([greeting]);
    }
  }, [isOpen]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    // Show crisis help for very low mood + high stress
    if (moodScore <= 1 && stressLevel > 80) {
      setShowCrisisHelp(true);
    }
  }, [moodScore, stressLevel]);

  const handleSendMessage = () => {
    if (!inputText.trim()) return;

    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: inputText,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);

    // Generate AI response
    setTimeout(() => {
      const aiResponse = AITherapistService.generateTherapistResponse(
        inputText, 
        moodScore, 
        stressLevel
      );

      const therapistMessage = {
        id: Date.now() + 1,
        type: 'therapist',
        content: aiResponse.message,
        technique: aiResponse.suggestedTechnique,
        coping: aiResponse.copingStrategies,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, therapistMessage]);
    }, 1000);

    setInputText('');
  };

  const startTechnique = (technique) => {
    setCurrentTechnique(technique);
  };

  const completeTechnique = () => {
    setCurrentTechnique(null);
    const completionMessage = {
      id: Date.now(),
      type: 'therapist',
      content: "Great job completing that exercise! How are you feeling now? Remember, these techniques get more effective with practice.",
      timestamp: new Date()
    };
    setMessages(prev => [...prev, completionMessage]);
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 left-4 btn btn-circle btn-primary shadow-lg z-40"
        title="AI Wellness Support"
      >
        <Brain className="w-5 h-5" />
      </button>
    );
  }

  return (
    <>
      <div className="fixed bottom-4 left-4 w-80 h-96 bg-base-100 rounded-lg shadow-xl border z-50">
        <div className="flex items-center justify-between p-3 border-b bg-primary text-primary-content rounded-t-lg">
          <div className="flex items-center gap-2">
            <Brain className="w-5 h-5" />
            <span className="font-medium">AI Wellness Support</span>
          </div>
          <button onClick={() => setIsOpen(false)} className="btn btn-ghost btn-xs">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex flex-col h-80">
          <div className="flex-1 overflow-y-auto p-3 space-y-3">
            {messages.map(message => (
              <div key={message.id} className={`chat ${message.type === 'user' ? 'chat-end' : 'chat-start'}`}>
                <div className={`chat-bubble text-xs ${message.type === 'user' ? 'chat-bubble-primary' : 'chat-bubble-secondary'}`}>
                  {message.content}
                  
                  {message.technique && (
                    <div className="mt-2 p-2 bg-base-200 rounded">
                      <div className="font-medium text-xs">{message.technique.name}</div>
                      <div className="text-xs opacity-80 mb-2">{message.technique.description}</div>
                      <button 
                        onClick={() => startTechnique(message.technique)}
                        className="btn btn-xs btn-primary"
                      >
                        Try This Technique
                      </button>
                    </div>
                  )}
                  
                  {message.coping && (
                    <div className="mt-2">
                      <div className="text-xs font-medium mb-1">Quick coping strategies:</div>
                      {message.coping.slice(0, 2).map((strategy, index) => (
                        <div key={index} className="text-xs opacity-80">• {strategy}</div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          <div className="p-3 border-t">
            <div className="flex gap-2">
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder="Share how you're feeling..."
                className="input input-sm input-bordered flex-1 text-xs"
              />
              <button onClick={handleSendMessage} className="btn btn-sm btn-primary">
                <Send className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* CBT Technique Modal */}
      {currentTechnique && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-base-100 rounded-lg p-6 max-w-md mx-4">
            <h3 className="text-lg font-bold mb-3">{currentTechnique.name}</h3>
            <p className="text-sm text-base-content/80 mb-4">{currentTechnique.description}</p>
            
            <div className="space-y-2 mb-4">
              <div className="text-sm font-medium">Steps:</div>
              {currentTechnique.steps.map((step, index) => (
                <div key={index} className="text-sm flex items-start gap-2">
                  <span className="badge badge-primary badge-sm">{index + 1}</span>
                  <span>{step}</span>
                </div>
              ))}
            </div>
            
            <div className="text-xs text-base-content/60 mb-4">
              Duration: {currentTechnique.duration}
            </div>
            
            <div className="flex gap-2">
              <button onClick={completeTechnique} className="btn btn-primary flex-1">
                I've Completed This
              </button>
              <button onClick={() => setCurrentTechnique(null)} className="btn btn-ghost">
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Crisis Support Modal */}
      {showCrisisHelp && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-base-100 rounded-lg p-6 max-w-md mx-4">
            <div className="flex items-center gap-2 mb-4">
              <AlertTriangle className="w-6 h-6 text-error" />
              <h3 className="text-lg font-bold">Immediate Support Available</h3>
            </div>
            
            <p className="text-sm mb-4">
              It seems like you might be going through a really difficult time. 
              Please know that support is available 24/7.
            </p>
            
            <div className="space-y-3 mb-4">
              <div className="p-3 bg-error/10 rounded-lg">
                <div className="font-medium">Crisis Text Line</div>
                <div className="text-sm">Text 988 for immediate support</div>
              </div>
              
              <div className="p-3 bg-info/10 rounded-lg">
                <div className="font-medium">Crisis Chat</div>
                <div className="text-sm">Available at suicidepreventionlifeline.org</div>
              </div>
            </div>
            
            <div className="flex gap-2">
              <button 
                onClick={() => window.open('tel:988')}
                className="btn btn-error flex-1"
              >
                <Heart className="w-4 h-4" />
                Call 988
              </button>
              <button 
                onClick={() => setShowCrisisHelp(false)}
                className="btn btn-ghost"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AITherapistChat;