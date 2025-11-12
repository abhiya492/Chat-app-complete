import { useEffect, useState } from "react";

const ParticleBurst = ({ x, y, color = "#ff6b6b", trigger }) => {
  const [particles, setParticles] = useState([]);

  useEffect(() => {
    if (trigger) {
      const newParticles = Array.from({ length: 12 }, (_, i) => {
        const angle = (i * 360) / 12;
        const distance = 50 + Math.random() * 30;
        return {
          id: i,
          tx: Math.cos(angle * Math.PI / 180) * distance,
          ty: Math.sin(angle * Math.PI / 180) * distance,
          delay: Math.random() * 0.1,
          color: ['#ff6b6b', '#4ecdc4', '#45b7d1', '#f9ca24', '#6c5ce7', '#ff85a2'][Math.floor(Math.random() * 6)]
        };
      });
      setParticles(newParticles);
      setTimeout(() => setParticles([]), 800);
    }
  }, [trigger]);

  if (!trigger) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-50">
      {particles.map(p => (
        <div
          key={p.id}
          className="absolute w-3 h-3 rounded-full"
          style={{
            left: `${x}px`,
            top: `${y}px`,
            backgroundColor: p.color,
            animation: `particle-burst 0.6s ease-out forwards`,
            animationDelay: `${p.delay}s`,
            '--tx': `${p.tx}px`,
            '--ty': `${p.ty}px`,
          }}
        />
      ))}
    </div>
  );
};

export default ParticleBurst;
