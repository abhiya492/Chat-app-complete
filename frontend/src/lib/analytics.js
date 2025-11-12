class Analytics {
  constructor() {
    this.events = [];
    this.sessionStart = Date.now();
  }

  track(event, data = {}) {
    const eventData = {
      event,
      data,
      timestamp: Date.now(),
      sessionDuration: Date.now() - this.sessionStart,
    };
    
    this.events.push(eventData);
    
    if (import.meta.env.DEV) {
      console.log('📊 Analytics:', event, data);
    }
    
    // Send to backend if needed
    if (this.events.length >= 10) {
      this.flush();
    }
  }

  flush() {
    if (this.events.length === 0) return;
    
    // Store in localStorage for now
    const stored = JSON.parse(localStorage.getItem('analytics') || '[]');
    localStorage.setItem('analytics', JSON.stringify([...stored, ...this.events].slice(-100)));
    this.events = [];
  }

  getStats() {
    const stored = JSON.parse(localStorage.getItem('analytics') || '[]');
    return {
      totalEvents: stored.length,
      events: stored,
      sessionDuration: Date.now() - this.sessionStart,
    };
  }
}

export const analytics = new Analytics();

// Track page views
export const trackPageView = (page) => {
  analytics.track('page_view', { page });
};

// Track user actions
export const trackEvent = (action, data) => {
  analytics.track(action, data);
};
