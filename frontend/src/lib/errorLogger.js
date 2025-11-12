class ErrorLogger {
  constructor() {
    this.errors = [];
    this.setupGlobalHandler();
  }

  setupGlobalHandler() {
    window.addEventListener('error', (event) => {
      this.log({
        type: 'error',
        message: event.message,
        stack: event.error?.stack,
        timestamp: Date.now(),
      });
    });

    window.addEventListener('unhandledrejection', (event) => {
      this.log({
        type: 'unhandled_rejection',
        message: event.reason?.message || 'Unhandled Promise Rejection',
        stack: event.reason?.stack,
        timestamp: Date.now(),
      });
    });
  }

  log(error) {
    this.errors.push(error);
    
    if (import.meta.env.DEV) {
      console.error('🔴 Error logged:', error);
    }
    
    // Keep last 50 errors
    if (this.errors.length > 50) {
      this.errors = this.errors.slice(-50);
    }
    
    // Store in localStorage
    localStorage.setItem('error_logs', JSON.stringify(this.errors));
  }

  getErrors() {
    return this.errors;
  }

  clear() {
    this.errors = [];
    localStorage.removeItem('error_logs');
  }
}

export const errorLogger = new ErrorLogger();
