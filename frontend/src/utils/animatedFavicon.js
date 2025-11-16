// Animated Favicon with heartbeat effect and color transitions
export const initAnimatedFavicon = () => {
  const canvas = document.createElement('canvas');
  canvas.width = 64;
  canvas.height = 64;
  const ctx = canvas.getContext('2d');
  
  const colors = ['#6366f1', '#7c3aed', '#8b5cf6', '#a78bfa', '#8b5cf6', '#7c3aed'];
  let colorIndex = 0;
  let scale = 1;
  let growing = true;
  let dotOpacity = [1, 0.5, 0.3];
  
  const drawIcon = () => {
    ctx.clearRect(0, 0, 64, 64);
    
    // Gradient background with color transition
    const gradient = ctx.createLinearGradient(0, 0, 64, 64);
    gradient.addColorStop(0, colors[colorIndex]);
    gradient.addColorStop(1, colors[(colorIndex + 1) % colors.length]);
    
    // Rounded rectangle background with scale
    const centerX = 32;
    const centerY = 32;
    
    ctx.save();
    ctx.translate(centerX, centerY);
    ctx.scale(scale, scale);
    ctx.translate(-centerX, -centerY);
    
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.roundRect(4, 4, 56, 56, 12);
    ctx.fill();
    
    // Chat bubble
    ctx.fillStyle = 'white';
    ctx.beginPath();
    ctx.roundRect(14, 18, 36, 22, 6);
    ctx.fill();
    
    // Tail
    ctx.beginPath();
    ctx.moveTo(20, 40);
    ctx.lineTo(16, 48);
    ctx.lineTo(24, 40);
    ctx.fill();
    
    // Typing dots with animated opacity
    ctx.fillStyle = colors[colorIndex];
    [0, 1, 2].forEach((i) => {
      ctx.globalAlpha = dotOpacity[i];
      ctx.beginPath();
      ctx.arc(24 + i * 8, 29, 2.5, 0, Math.PI * 2);
      ctx.fill();
    });
    
    ctx.globalAlpha = 1;
    
    // Online indicator
    ctx.fillStyle = '#10b981';
    ctx.beginPath();
    ctx.arc(50, 50, 4, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.restore();
    
    // Update favicon
    const link = document.querySelector("link[rel*='icon']") || document.createElement('link');
    link.type = 'image/x-icon';
    link.rel = 'shortcut icon';
    link.href = canvas.toDataURL();
    document.getElementsByTagName('head')[0].appendChild(link);
  };
  
  // Animation loop
  let frame = 0;
  setInterval(() => {
    frame++;
    
    // Heartbeat scale animation
    if (growing) {
      scale += 0.02;
      if (scale >= 1.08) growing = false;
    } else {
      scale -= 0.02;
      if (scale <= 1) growing = true;
    }
    
    // Color transition (slower)
    if (frame % 60 === 0) {
      colorIndex = (colorIndex + 1) % colors.length;
    }
    
    // Typing dots animation
    dotOpacity = dotOpacity.map((_, i) => {
      const offset = (frame + i * 10) % 30;
      return 0.3 + 0.7 * Math.sin((offset / 30) * Math.PI);
    });
    
    drawIcon();
  }, 50);
};
