import toast from 'react-hot-toast';

export const handleApiError = (error, customMessage = null) => {
  if (!navigator.onLine) {
    toast.error('No internet connection. Please check your network.');
    return;
  }

  if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
    toast.error('Request timeout. Please try again.');
    return;
  }

  if (error.response) {
    const status = error.response.status;
    const message = error.response.data?.message;

    switch (status) {
      case 400:
        toast.error(message || 'Invalid request');
        break;
      case 401:
        toast.error('Session expired. Please login again.');
        setTimeout(() => window.location.href = '/login', 2000);
        break;
      case 403:
        toast.error('Access denied');
        break;
      case 404:
        toast.error(message || 'Resource not found');
        break;
      case 429:
        toast.error('Too many requests. Please slow down.');
        break;
      case 500:
      case 502:
      case 503:
        toast.error('Server error. Please try again later.');
        break;
      default:
        toast.error(customMessage || message || 'Something went wrong');
    }
  } else if (error.request) {
    toast.error('Network error. Please check your connection.');
  } else {
    toast.error(customMessage || error.message || 'An error occurred');
  }
};

export const retryWithBackoff = async (fn, maxRetries = 3, delay = 1000) => {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      await new Promise(resolve => setTimeout(resolve, delay * Math.pow(2, i)));
    }
  }
};
