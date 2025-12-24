class AITherapistService {
  static getCBTTechniques(moodScore, stressLevel, emotion) {
    const techniques = {
      anxiety: [
        {
          name: "5-4-3-2-1 Grounding",
          description: "Name 5 things you see, 4 you can touch, 3 you hear, 2 you smell, 1 you taste",
          steps: ["Look around and name 5 things you can see", "Touch 4 different textures", "Listen for 3 sounds", "Notice 2 scents", "Identify 1 taste"],
          duration: "3-5 minutes"
        },
        {
          name: "Box Breathing",
          description: "Breathe in a 4-4-4-4 pattern to calm your nervous system",
          steps: ["Inhale for 4 counts", "Hold for 4 counts", "Exhale for 4 counts", "Hold empty for 4 counts", "Repeat 4-6 times"],
          duration: "2-3 minutes"
        }
      ],
      depression: [
        {
          name: "Thought Record",
          description: "Challenge negative thoughts with evidence",
          steps: ["Write down the negative thought", "Rate how much you believe it (1-10)", "List evidence for and against", "Create a balanced thought", "Re-rate your belief"],
          duration: "5-10 minutes"
        },
        {
          name: "Behavioral Activation",
          description: "Plan one small, meaningful activity",
          steps: ["Choose one small activity you used to enjoy", "Break it into tiny steps", "Commit to just the first step", "Notice how you feel after", "Plan the next small step"],
          duration: "15-30 minutes"
        }
      ],
      anger: [
        {
          name: "STOP Technique",
          description: "Pause before reacting to anger",
          steps: ["STOP what you're doing", "Take a deep breath", "Observe your thoughts and feelings", "Proceed with intention"],
          duration: "1-2 minutes"
        },
        {
          name: "Progressive Muscle Relaxation",
          description: "Release physical tension from anger",
          steps: ["Tense your fists for 5 seconds, then release", "Tense your shoulders, then release", "Work through each muscle group", "Notice the contrast between tension and relaxation"],
          duration: "10-15 minutes"
        }
      ]
    };

    // Determine primary emotion
    let primaryEmotion = 'anxiety';
    if (moodScore <= 2) primaryEmotion = 'depression';
    if (stressLevel > 70) primaryEmotion = 'anxiety';
    if (emotion === 'anger') primaryEmotion = 'anger';

    return techniques[primaryEmotion] || techniques.anxiety;
  }

  static getCopingStrategies(situation) {
    const strategies = {
      immediate: [
        "Take 3 deep breaths right now",
        "Drink a glass of water slowly",
        "Step outside for fresh air",
        "Listen to calming music",
        "Text a supportive friend"
      ],
      shortTerm: [
        "Go for a 10-minute walk",
        "Write in a journal for 5 minutes",
        "Do a quick meditation",
        "Take a warm shower",
        "Practice gratitude - list 3 good things"
      ],
      longTerm: [
        "Establish a daily mindfulness routine",
        "Build a support network",
        "Develop healthy sleep habits",
        "Create boundaries with stressors",
        "Consider professional therapy"
      ]
    };

    return strategies;
  }

  static generateTherapistResponse(userMessage, moodScore, stressLevel) {
    const responses = {
      validation: [
        "I hear that you're going through a difficult time. Your feelings are completely valid.",
        "It sounds like you're dealing with a lot right now. That must feel overwhelming.",
        "Thank you for sharing that with me. It takes courage to express these feelings."
      ],
      coping: [
        "Let's try a quick technique that might help you feel more grounded.",
        "I'd like to suggest a coping strategy that many people find helpful.",
        "Would you be open to trying a brief exercise that could provide some relief?"
      ],
      encouragement: [
        "Remember, difficult emotions are temporary. You've gotten through hard times before.",
        "You're taking positive steps by reaching out and being aware of your feelings.",
        "Small steps toward wellness are still meaningful progress."
      ]
    };

    // Analyze user message for emotional content
    const distressWords = ['anxious', 'worried', 'scared', 'panic', 'overwhelmed'];
    const sadWords = ['sad', 'depressed', 'hopeless', 'empty', 'worthless'];
    const angerWords = ['angry', 'frustrated', 'furious', 'irritated', 'mad'];

    let responseType = 'validation';
    if (moodScore <= 2 || stressLevel > 60) responseType = 'coping';
    if (moodScore >= 4) responseType = 'encouragement';

    const baseResponse = responses[responseType][Math.floor(Math.random() * responses[responseType].length)];
    
    return {
      message: baseResponse,
      type: responseType,
      suggestedTechnique: this.getCBTTechniques(moodScore, stressLevel)[0],
      copingStrategies: this.getCopingStrategies('immediate')
    };
  }

  static getThoughtChallengingQuestions() {
    return [
      "What evidence do I have for this thought?",
      "What evidence do I have against this thought?",
      "What would I tell a friend in this situation?",
      "Is this thought helpful or harmful?",
      "What's the worst that could realistically happen?",
      "What's the best that could happen?",
      "What's most likely to happen?",
      "How will this matter in 5 years?"
    ];
  }

  static getCrisisResources() {
    return {
      immediate: {
        text: "988",
        description: "Suicide & Crisis Lifeline (US)"
      },
      chat: {
        url: "https://suicidepreventionlifeline.org/chat/",
        description: "Crisis Chat Support"
      },
      international: {
        url: "https://findahelpline.com/",
        description: "International Crisis Lines"
      }
    };
  }
}

export default AITherapistService;