import React, { useRef, useEffect } from "react";
import * as THREE from "three";

export function Minimap({ players, authUser, size = 150 }) {
  const canvasRef = useRef();
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const draw = () => {
      ctx.clearRect(0, 0, size, size);
      ctx.fillStyle = "#0b1221";
      ctx.fillRect(0, 0, size, size);
      ctx.strokeStyle = "#14233a";
      ctx.lineWidth = 1;
      for (let i = 0; i <= 4; i++) {
        ctx.beginPath();
        ctx.moveTo((size / 4) * i, 0);
        ctx.lineTo((size / 4) * i, size);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(0, (size / 4) * i);
        ctx.lineTo(size, (size / 4) * i);
        ctx.stroke();
      }
      const center = players[authUser._id].position;
      const scale = 2.5;
      Object.values(players).forEach(p => {
        const dx = (p.position.x - center.x) * scale + size / 2;
        const dz = (p.position.z - center.z) * scale + size / 2;
        ctx.beginPath();
        ctx.fillStyle = p.id === authUser._id ? "#00ffcc" : "#ff6b35";
        ctx.arc(dx, dz, 4, 0, Math.PI * 2);
        ctx.fill();
      });
    };
    const id = setInterval(draw, 100);
    return () => clearInterval(id);
  }, [players, authUser._id, size]);
  return <canvas ref={canvasRef} width={size} height={size} style={{ borderRadius: 8, background: "rgba(0,0,0,0.45)" }} />;
}

export function GameUI({ players, authUser, pickups, pickupWeapon, phase, winner, onRestart }) {
  return (
    <>
      <div className="absolute top-4 left-4 z-50">
        <div className="bg-gradient-to-r from-blue-700/80 to-cyan-700/80 p-3 rounded-lg text-white font-bold shadow-lg">
          <div className="flex items-center gap-3">
            <div className="text-2xl">🎮</div>
            <div>
              <div className="text-sm">{players[authUser._id].name}</div>
              <div className="text-xs">Health: <strong>{Math.round(players[authUser._id].health)}</strong></div>
              <div className="text-xs">Weapon: <strong>{players[authUser._id].weapon?.name}</strong> ({players[authUser._id].weapon?.ammo}/{players[authUser._id].weapon?.maxAmmo})</div>
            </div>
          </div>
        </div>
      </div>

      <div className="absolute top-4 right-4 z-50">
        <div className="bg-black/60 p-3 rounded-lg text-white shadow-lg">
          <div className="mb-2 text-sm font-bold">Minimap</div>
          <Minimap players={players} authUser={authUser} />
        </div>
      </div>

      <div className="absolute bottom-6 left-4 z-50">
        <div className="bg-black/70 p-3 rounded-lg text-white text-sm font-medium shadow-lg">
          <div>Controls: WASD to move • Click / Space to shoot • R to reload</div>
        </div>
      </div>

      <div className="absolute top-16 left-4 z-50">
        {pickups.map(p => (
          <div key={p.id} className="mb-2">
            <button onClick={() => pickupWeapon(p.id)} className="bg-yellow-500/90 px-3 py-1 rounded-md text-black font-bold">
              Pickup {p.weapon.name}
            </button>
          </div>
        ))}
      </div>

      {phase === "ended" && winner && (
        <div className="absolute inset-0 z-60 flex items-center justify-center bg-black/80">
          <div className="text-center text-white p-8 rounded-xl">
            <h1 className="text-4xl font-extrabold mb-4">{winner === authUser._id ? "Victory!" : "Defeat"}</h1>
            <p className="mb-6">Winner: <strong>{players[winner]?.name}</strong></p>
            <button
              className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-3 rounded-full font-bold"
              onClick={onRestart}
            >
              Play Again
            </button>
          </div>
        </div>
      )}
    </>
  );
}