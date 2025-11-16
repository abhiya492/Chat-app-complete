// Network quality detection for calls

export const checkNetworkQuality = async () => {
  const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
  
  let quality = 'good';
  let details = {};

  // Check connection type
  if (connection) {
    const effectiveType = connection.effectiveType;
    details.type = effectiveType;
    
    if (effectiveType === 'slow-2g' || effectiveType === '2g') {
      quality = 'poor';
    } else if (effectiveType === '3g') {
      quality = 'fair';
    } else if (effectiveType === '4g') {
      quality = 'good';
    }

    details.downlink = connection.downlink; // Mbps
    details.rtt = connection.rtt; // ms
  }

  // Ping test for latency
  try {
    const start = Date.now();
    await fetch('/health', { method: 'HEAD' });
    const latency = Date.now() - start;
    details.latency = latency;

    if (latency > 300) quality = 'poor';
    else if (latency > 150) quality = 'fair';
  } catch (error) {
    quality = 'poor';
  }

  return { quality, details };
};

export const getQualityColor = (quality) => {
  switch (quality) {
    case 'good': return 'text-success';
    case 'fair': return 'text-warning';
    case 'poor': return 'text-error';
    default: return 'text-base-content';
  }
};

export const getQualityIcon = (quality) => {
  switch (quality) {
    case 'good': return '●●●●';
    case 'fair': return '●●●○';
    case 'poor': return '●●○○';
    default: return '●○○○';
  }
};

export const getQualityMessage = (quality) => {
  switch (quality) {
    case 'good': return 'Excellent connection for calls';
    case 'fair': return 'Fair connection - calls may have issues';
    case 'poor': return 'Poor connection - calls not recommended';
    default: return 'Checking connection...';
  }
};
