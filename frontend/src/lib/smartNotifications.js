// Smart notification filtering - only notify for important messages

const IMPORTANT_KEYWORDS = [
  'urgent', 'important', 'asap', 'emergency', 'help', 'please', 'need',
  'call me', 'call back', 'meeting', 'deadline', 'today', 'now', 'quick'
];

const QUESTION_INDICATORS = ['?', 'what', 'when', 'where', 'who', 'why', 'how', 'can you', 'could you', 'would you'];

export const isImportantMessage = (message, userPreferences = {}) => {
  const {
    notifyAll = false,
    notifyMentions = true,
    notifyQuestions = true,
    notifyKeywords = true,
    notifyMedia = true,
  } = userPreferences;

  // Always notify if user wants all notifications
  if (notifyAll) return true;

  const text = message.text?.toLowerCase() || '';

  // Always notify for media if enabled
  if (notifyMedia && (message.image || message.video || message.voice || message.file)) {
    return true;
  }

  // Check for @mentions (if username is in message)
  if (notifyMentions && text.includes('@')) {
    return true;
  }

  // Check for questions
  if (notifyQuestions && QUESTION_INDICATORS.some(indicator => text.includes(indicator))) {
    return true;
  }

  // Check for important keywords
  if (notifyKeywords && IMPORTANT_KEYWORDS.some(keyword => text.includes(keyword))) {
    return true;
  }

  // Check message length - very short messages might be important
  if (text.length > 0 && text.length <= 20) {
    return true;
  }

  // Default: don't notify for regular messages
  return false;
};

export const getNotificationPriority = (message) => {
  const text = message.text?.toLowerCase() || '';
  
  if (text.includes('urgent') || text.includes('emergency')) return 'high';
  if (text.includes('important') || text.includes('asap')) return 'medium';
  return 'low';
};
