import { useState, useEffect, useRef, Suspense } from "react";
import { Zap, Shield, Heart, Target, Crosshair, Bomb, Activity } from "lucide-react";
import toast from "react-hot-toast";
import * as THREE from "three";
import { Canvas, useFrame, useLoader } from '@react-three/fiber';
import { Sky, useFBX, useGLTF, useAnimations } from '@react-three/drei';
import { Physics, RigidBody, CapsuleCollider, BallCollider } from '@react-three/rapier';

const WEAPONS = [
  { id: 'pistol', name: 'Pistol', key: '1', icon: Zap, ammo: 12, damage: [15, 25], fireRate: 500 },
  { id: 'shotgun', name: 'Shotgun', key: '2', icon: Target, ammo: 6, damage: [35, 50], fireRate: 1000 },
  { id: 'sniper', name: 'Sniper Rifle', key: '3', icon: Crosshair, ammo: 5, damage: [60, 80], fireRate: 1500 },
  { id: 'grenade', name: 'Grenade', key: '4', icon: Bomb, ammo: 3, damage: [40, 60], fireRate: 2000 },
  { id: 'armor', name: 'Body Armor', key: '5', icon: Shield, ammo: 1 },
  { id: 'medkit', name: 'Med Kit', key: '6', icon: Heart, ammo: 2, heal: [30, 50] },
];

// Animation Manager
const ANIMATIONS = {
  idle: '/models/standing idle.fbx',
  walk: '/models/Unarmed Walk Forward.fbx',
  shoot: '/models/standing melee attack horizontal.fbx',
  reload: '/models/Crouch To Stand.fbx',
  hit: '/models/Shoved Reaction With Spin.fbx',
  death: '/models/Dying.fbx',
  victory: '/models/Hip Hop Dancing.fbx'
};

// 3D Character Model Component
function Character3D({ position, color, health, animating, isPlayer, currentAnimation = 'idle', selectedCharacter = 'X Bot' }) {
  const groupRef = useRef();
  const mixerRef = useRef();
  const actionsRef = useRef({});
  const [currentAction, setCurrentAction] = useState(null);
  
  // Load character model
  let fbx = null;
  try {
    fbx = useFBX(`/models/${selectedCharacter}.fbx`);
  } catch (error) {
    console.log('Character model not found, using X Bot');
    try {
      fbx = useFBX('/models/X Bot.fbx');
    } catch (fallbackError) {
      console.log('FBX model not found, using fallback');
    }
  }
  
  // Load animations
  const animations = {};
  Object.entries(ANIMATIONS).forEach(([key, path]) => {
    try {
      animations[key] = useFBX(path);
    } catch (error) {
      console.log(`Animation ${key} not found`);
    }
  });
  
  useFrame((state, delta) => {
    if (groupRef.current) {
      // Subtle breathing animation when idle
      if (currentAnimation === 'idle') {
        groupRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 2) * 0.02;
      }
      
      // Walking animation movement
      if (currentAnimation === 'walk') {
        groupRef.current.position.z = Math.sin(state.clock.elapsedTime * 4) * 0.1;
      }
    }
    
    // Update animation mixer
    if (mixerRef.current) {
      mixerRef.current.update(delta);
    }
  });
  
  // Play animation
  const playAnimation = (animName) => {
    if (!mixerRef.current || !actionsRef.current[animName]) return;
    
    // Stop current animation
    if (currentAction) {
      currentAction.fadeOut(0.3);
    }
    
    // Play new animation
    const action = actionsRef.current[animName];
    action.reset().fadeIn(0.3).play();
    setCurrentAction(action);
    
    // Auto-return to idle for non-looping animations
    if (['shoot', 'reload', 'hit'].includes(animName)) {
      setTimeout(() => {
        playAnimation('idle');
      }, animName === 'reload' ? 2000 : 1000);
    }
  };
  
  // Animation effect when currentAnimation changes
  useEffect(() => {
    playAnimation(currentAnimation);
  }, [currentAnimation]);
  
  useEffect(() => {
    if (fbx) {
      // Setup 3D model
      fbx.scale.setScalar(0.01);
      fbx.position.set(0, 0, 0);
      
      // Apply team color
      fbx.traverse((child) => {
        if (child.isMesh) {
          child.castShadow = true;
          child.receiveShadow = true;
          if (child.material) {
            child.material = child.material.clone();
            child.material.color.multiplyScalar(0.7).add(new THREE.Color(color).multiplyScalar(0.3));
            child.material.roughness = 0.8;
            child.material.metalness = 0.2;
          }
        }
      });
      
      // Setup animation mixer
      mixerRef.current = new THREE.AnimationMixer(fbx);
      actionsRef.current = {};
      
      // Load all animations
      Object.entries(animations).forEach(([key, animFbx]) => {
        if (animFbx && animFbx.animations && animFbx.animations.length > 0) {
          const action = mixerRef.current.clipAction(animFbx.animations[0]);
          action.setLoop(key === 'idle' || key === 'walk' ? THREE.LoopRepeat : THREE.LoopOnce);
          actionsRef.current[key] = action;
        }
      });
      
      // Start with idle animation
      playAnimation('idle');
    }
  }, [fbx, color, animations]);

  return (
    <RigidBody position={position} type="fixed">
      <CapsuleCollider args={[0.6, 0.4]} />
      <group ref={groupRef}>
        {fbx ? (
          // 3D Model
          <primitive object={fbx.clone()} />
        ) : (
          // Fallback basic geometry
          <>
            <mesh castShadow>
              <capsuleGeometry args={[0.4, 1.2, 4, 8]} />
              <meshStandardMaterial color={color} roughness={0.7} metalness={0.3} />
            </mesh>
            <mesh position={[0, 1, 0]} castShadow>
              <sphereGeometry args={[0.35, 16, 16]} />
              <meshStandardMaterial color={0x2c3e50} roughness={0.8} />
            </mesh>
            <mesh position={[0.5, 0.3, 0.3]} rotation={[0, 0, Math.PI / 6]} castShadow>
              <boxGeometry args={[0.1, 0.6, 0.1]} />
              <meshStandardMaterial color={0x1a1a1a} metalness={0.9} />
            </mesh>
          </>
        )}
        
        {/* 3D Health Bar */}
        <group position={[0, 2.5, 0]}>
          {/* Background */}
          <mesh>
            <boxGeometry args={[1.5, 0.1, 0.05]} />
            <meshStandardMaterial color={0x333333} transparent opacity={0.8} />
          </mesh>
          {/* Health Fill */}
          <mesh position={[-(1.5 - (1.5 * health / 100)) / 2, 0.01, 0]}>
            <boxGeometry args={[1.5 * (health / 100), 0.12, 0.06]} />
            <meshStandardMaterial 
              color={health > 50 ? 0x00ff00 : health > 25 ? 0xffaa00 : 0xff0000}
              emissive={health > 50 ? 0x002200 : health > 25 ? 0x221100 : 0x220000}
              emissiveIntensity={0.3}
            />
          </mesh>
          {/* Health Text */}
          <mesh position={[0, 0.3, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[0.8, 0.2]} />
            <meshBasicMaterial color={0xffffff} transparent opacity={0.9} />
          </mesh>
        </group>
      </group>
    </RigidBody>
  );
}

// Enhanced Physics Soldier Component
function PhysicsSoldier({ position, color, health, animating, currentAnimation, selectedCharacter, isPlayer }) {
  return (
    <Suspense fallback={
      <RigidBody position={position} type="fixed">
        <CapsuleCollider args={[0.6, 0.4]} />
        <mesh castShadow>
          <capsuleGeometry args={[0.4, 1.2, 4, 8]} />
          <meshStandardMaterial color={color} roughness={0.7} metalness={0.3} />
        </mesh>
      </RigidBody>
    }>
      <Character3D 
        position={position} 
        color={color} 
        health={health} 
        animating={animating}
        currentAnimation={currentAnimation}
        selectedCharacter={selectedCharacter}
        isPlayer={isPlayer}
      />
    </Suspense>
  );
}

// Physics Bullet Component
function PhysicsBullet({ start, end, onComplete }) {
  const rigidBodyRef = useRef();
  const [active, setActive] = useState(true);
  
  useEffect(() => {
    if (rigidBodyRef.current) {
      const direction = new THREE.Vector3().subVectors(end, start).normalize();
      rigidBodyRef.current.setLinvel(direction.multiplyScalar(30), true);
      
      // Auto-remove after 3 seconds
      setTimeout(() => {
        setActive(false);
        onComplete();
      }, 3000);
    }
  }, []);

  if (!active) return null;

  return (
    <RigidBody ref={rigidBodyRef} position={start}>
      <BallCollider args={[0.05]} />
      <mesh>
        <sphereGeometry args={[0.05, 8, 8]} />
        <meshStandardMaterial color={0xffff00} emissive={0xffaa00} emissiveIntensity={3} />
      </mesh>
      <pointLight intensity={2} distance={3} color={0xffaa00} />
    </RigidBody>
  );
}

// Physics Explosion Component
function PhysicsExplosion({ position, onComplete }) {
  const [scale, setScale] = useState(0.1);
  const [opacity, setOpacity] = useState(1);
  
  useFrame((state, delta) => {
    setScale(prev => prev + delta * 8);
    setOpacity(prev => {
      const newOpacity = prev - delta * 3;
      if (newOpacity <= 0) {
        onComplete();
        return 0;
      }
      return newOpacity;
    });
  });

  return (
    <group position={position}>
      <mesh scale={scale}>
        <sphereGeometry args={[0.8, 16, 16]} />
        <meshBasicMaterial color={0xff4500} transparent opacity={opacity} />
      </mesh>
      <pointLight intensity={10} distance={15} color={0xff4500} />
      {/* Particle effects */}
      {[...Array(6)].map((_, i) => (
        <mesh 
          key={i} 
          position={[
            (Math.random() - 0.5) * scale * 2,
            (Math.random() - 0.5) * scale * 2,
            (Math.random() - 0.5) * scale * 2
          ]} 
          scale={scale * 0.3}
        >
          <sphereGeometry args={[0.1, 8, 8]} />
          <meshBasicMaterial 
            color={new THREE.Color().setHSL(0.1, 1, 0.5 + Math.random() * 0.5)} 
            transparent 
            opacity={opacity} 
          />
        </mesh>
      ))}
    </group>
  );
}

// Enhanced 3D Environment
function Environment3D() {
  return (
    <>
      {/* Advanced Lighting Setup */}
      <ambientLight intensity={0.4} color={0x404040} />
      
      {/* Main Sun Light */}
      <directionalLight 
        position={[20, 30, 10]} 
        intensity={2} 
        castShadow 
        shadow-mapSize={[4096, 4096]}
        shadow-camera-far={50}
        shadow-camera-left={-20}
        shadow-camera-right={20}
        shadow-camera-top={20}
        shadow-camera-bottom={-20}
        color={0xffffff}
      />
      
      {/* Fill Lights */}
      <pointLight position={[-10, 15, 5]} intensity={0.8} color={0x4080ff} />
      <pointLight position={[10, 15, -5]} intensity={0.8} color={0xff8040} />
      
      {/* Rim Light */}
      <directionalLight 
        position={[-20, 10, -10]} 
        intensity={0.5} 
        color={0x8080ff}
      />
      
      {/* Sky with dynamic colors */}
      <Sky 
        sunPosition={[100, 20, 100]}
        inclination={0.6}
        azimuth={0.25}
        turbidity={10}
        rayleigh={2}
      />
      
      {/* Fog for depth */}
      <fog attach="fog" args={[0x87ceeb, 20, 100]} />
    </>
  );
}

// Main Battle Scene Component
function BattleScene({ gameState, authUser, opponent, effects, animating, playerAnimations, selectedCharacters }) {
  const myStats = gameState.players[authUser._id];
  const enemyStats = gameState.players[opponent._id];

  return (
    <>
      <Environment3D />
      
      {/* Enhanced Ground */}
      <RigidBody type="fixed">
        <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
          <planeGeometry args={[100, 100]} />
          <meshStandardMaterial 
            color={0x2d4a2d}
            roughness={0.95}
            metalness={0.05}
          />
        </mesh>
      </RigidBody>
      
      {/* Battle Arena Boundaries */}
      {[...Array(4)].map((_, i) => {
        const positions = [
          [0, 1, -15], [0, 1, 15], [-15, 1, 0], [15, 1, 0]
        ];
        const rotations = [
          [0, 0, 0], [0, 0, 0], [0, Math.PI/2, 0], [0, Math.PI/2, 0]
        ];
        return (
          <RigidBody key={i} type="fixed">
            <mesh 
              position={positions[i]} 
              rotation={rotations[i]}
              castShadow
            >
              <boxGeometry args={[30, 2, 0.5]} />
              <meshStandardMaterial 
                color={0x666666} 
                roughness={0.8} 
                metalness={0.3}
              />
            </mesh>
          </RigidBody>
        );
      })}
      
      {/* Enhanced Cover Objects */}
      {[...Array(6)].map((_, i) => {
        const positions = [
          [-8, 0.75, -5], [8, 0.75, -5],
          [-4, 0.75, 0], [4, 0.75, 0],
          [-8, 0.75, 5], [8, 0.75, 5]
        ];
        return (
          <RigidBody key={i} type="fixed">
            <group position={positions[i]}>
              {/* Main cover */}
              <mesh castShadow>
                <boxGeometry args={[2, 1.5, 0.8]} />
                <meshStandardMaterial 
                  color={0x606060} 
                  roughness={0.9} 
                  metalness={0.1}
                />
              </mesh>
              {/* Top detail */}
              <mesh position={[0, 0.9, 0]} castShadow>
                <boxGeometry args={[2.2, 0.1, 1]} />
                <meshStandardMaterial 
                  color={0x404040} 
                  roughness={0.7} 
                  metalness={0.3}
                />
              </mesh>
            </group>
          </RigidBody>
        );
      })}
      
      {/* Decorative Elements */}
      {[...Array(4)].map((_, i) => (
        <mesh 
          key={i}
          position={[
            (Math.random() - 0.5) * 30,
            0.1,
            (Math.random() - 0.5) * 30
          ]}
          rotation={[0, Math.random() * Math.PI * 2, 0]}
        >
          <cylinderGeometry args={[0.1, 0.2, 0.5, 8]} />
          <meshStandardMaterial color={0x2d4a2d} roughness={0.9} />
        </mesh>
      ))}
      
      {/* Players with Enhanced Positioning */}
      <PhysicsSoldier
        position={[-8, 0, 0]}
        color={0x1e3a8a}
        health={myStats.health}
        animating={animating && gameState.currentTurn === authUser._id}
        currentAnimation={playerAnimations?.[authUser._id] || 'idle'}
        selectedCharacter={selectedCharacters?.[authUser._id] || 'X Bot'}
        isPlayer={true}
      />
      <PhysicsSoldier
        position={[8, 0, 0]}
        color={0x991b1b}
        health={enemyStats.health}
        animating={animating && gameState.currentTurn === opponent._id}
        currentAnimation={playerAnimations?.[opponent._id] || 'idle'}
        selectedCharacter={selectedCharacters?.[opponent._id] || 'X Bot'}
        isPlayer={false}
      />
      
      {/* Player Spotlights */}
      <spotLight 
        position={[-8, 10, -5]} 
        target-position={[-8, 0, 0]}
        intensity={2}
        angle={Math.PI / 6}
        penumbra={0.5}
        color={0x4080ff}
        castShadow
      />
      <spotLight 
        position={[8, 10, -5]} 
        target-position={[8, 0, 0]}
        intensity={2}
        angle={Math.PI / 6}
        penumbra={0.5}
        color={0xff4080}
        castShadow
      />
      
      {/* Bullets */}
      {effects.bullets.map((bullet) => (
        <PhysicsBullet
          key={bullet.id}
          start={bullet.start}
          end={bullet.end}
          onComplete={() => effects.removeBullet(bullet.id)}
        />
      ))}
      
      {/* Explosions */}
      {effects.explosions.map((explosion) => (
        <PhysicsExplosion
          key={explosion.id}
          position={explosion.position}
          onComplete={() => effects.removeExplosion(explosion.id)}
        />
      ))}
    </>
  );
}

// Character Selection Component
function CharacterSelection({ onSelect, onClose }) {
  const characters = [
    { id: 'X Bot', name: 'X Bot', description: 'Balanced fighter' },
    { id: 'Mutant', name: 'Mutant', description: 'Heavy damage dealer' },
    { id: 'Soldier', name: 'Soldier', description: 'Tactical specialist' }
  ];
  
  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur flex items-center justify-center z-50">
      <div className="bg-gray-900 border-2 border-cyan-500 rounded-lg p-6 max-w-4xl">
        <h2 className="text-2xl font-bold text-cyan-400 mb-6 text-center">SELECT YOUR FIGHTER</h2>
        <div className="grid grid-cols-3 gap-6">
          {characters.map((char) => (
            <div key={char.id} className="text-center">
              <div className="w-48 h-64 bg-gray-800 border-2 border-gray-600 rounded-lg mb-4 relative overflow-hidden hover:border-cyan-400 transition-colors cursor-pointer"
                   onClick={() => onSelect(char.id)}>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-6xl">🤖</div>
                </div>
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
                  <h3 className="text-white font-bold">{char.name}</h3>
                  <p className="text-gray-300 text-sm">{char.description}</p>
                </div>
              </div>
              <button 
                onClick={() => onSelect(char.id)}
                className="bg-cyan-600 hover:bg-cyan-500 text-white px-6 py-2 rounded font-bold transition-colors"
              >
                SELECT
              </button>
            </div>
          ))}
        </div>
        <button 
          onClick={onClose}
          className="mt-6 bg-gray-600 hover:bg-gray-500 text-white px-6 py-2 rounded font-bold transition-colors mx-auto block"
        >
          CANCEL
        </button>
      </div>
    </div>
  );
}

const ModernBattleGame = ({ challenge, authUser, opponent, socket, onGameEnd }) => {
  const [effects, setEffects] = useState({
    bullets: [],
    explosions: [],
    removeBullet: (id) => setEffects(prev => ({ 
      ...prev, 
      bullets: prev.bullets.filter(b => b.id !== id) 
    })),
    removeExplosion: (id) => setEffects(prev => ({ 
      ...prev, 
      explosions: prev.explosions.filter(e => e.id !== id) 
    }))
  });
  
  const [showCharacterSelection, setShowCharacterSelection] = useState(false);
  const [selectedCharacters, setSelectedCharacters] = useState({
    [authUser._id]: 'X Bot',
    [opponent._id]: 'X Bot'
  });
  const [playerAnimations, setPlayerAnimations] = useState({
    [authUser._id]: 'idle',
    [opponent._id]: 'idle'
  });

  const [gameState, setGameState] = useState({
    players: {
      [challenge.challengerId._id]: { 
        health: 100, maxHealth: 100, armor: 0, kills: 0,
        inventory: { pistol: 36, shotgun: 12, sniper: 10, grenade: 3, armor: 1, medkit: 2 }
      },
      [challenge.opponentId._id]: { 
        health: 100, maxHealth: 100, armor: 0, kills: 0,
        inventory: { pistol: 36, shotgun: 12, sniper: 10, grenade: 3, armor: 1, medkit: 2 }
      },
    },
    currentTurn: challenge.challengerId._id,
    round: 1,
  });

  const [messages, setMessages] = useState([]);
  const [animating, setAnimating] = useState(false);
  const [selectedWeapon, setSelectedWeapon] = useState(0);
  const [lastShot, setLastShot] = useState(0);
  const [reloading, setReloading] = useState(false);

  const isMyTurn = gameState.currentTurn === authUser._id;
  const myStats = gameState.players[authUser._id];
  const enemyStats = gameState.players[opponent._id];

  const fireBullet = (start, end) => {
    const id = Date.now() + Math.random();
    setEffects(prev => ({
      ...prev,
      bullets: [...prev.bullets, { 
        id, 
        start: new THREE.Vector3(...start), 
        end: new THREE.Vector3(...end) 
      }]
    }));
  };

  const createExplosion = (position) => {
    const id = Date.now() + Math.random();
    setEffects(prev => ({
      ...prev,
      explosions: [...prev.explosions, { 
        id, 
        position: new THREE.Vector3(...position) 
      }]
    }));
  };

  // Socket events
  useEffect(() => {
    socket.emit("rpg:join", { gameRoomId: challenge.gameRoomId });

    socket.on("rpg:action", ({ data }) => {
      if (data.message) addMessage('opponent', data.message);
      if (data.newState) setGameState(data.newState);
      if (data.gameOver) {
        setTimeout(() => onGameEnd(data.winner), 2000);
        toast.success(data.winner === authUser._id ? "🏆 Victory!" : "💀 Defeated!");
      }
    });

    socket.on("rpg:turn-start", () => setAnimating(false));

    return () => {
      socket.off("rpg:action");
      socket.off("rpg:turn-start");
    };
  }, []);

  // Enhanced keyboard controls
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (!isMyTurn || animating) return;
      
      // Weapon selection
      const weaponIndex = parseInt(e.key) - 1;
      if (weaponIndex >= 0 && weaponIndex < WEAPONS.length) useWeapon(WEAPONS[weaponIndex]);
      
      // Navigation
      if (e.key === 'ArrowLeft') setSelectedWeapon(prev => Math.max(0, prev - 1));
      else if (e.key === 'ArrowRight') setSelectedWeapon(prev => Math.min(WEAPONS.length - 1, prev + 1));
      else if (e.key === 'Enter' || e.key === ' ') useWeapon(WEAPONS[selectedWeapon]);
      
      // Reload
      else if (e.key.toLowerCase() === 'r') reloadWeapon();
      
      // Character selection
      else if (e.key.toLowerCase() === 'c') setShowCharacterSelection(true);
      
      // Movement animations (for demo)
      else if (e.key.toLowerCase() === 'w') triggerAnimation(authUser._id, 'walk');
      else if (e.key.toLowerCase() === 's') triggerAnimation(authUser._id, 'idle');
    };
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [isMyTurn, animating, selectedWeapon, lastShot, myStats, enemyStats, reloading]);

  const addMessage = (type, text) => {
    setMessages(prev => [...prev.slice(-4), { type, text, timestamp: Date.now() }]);
  };

  const triggerAnimation = (playerId, animation) => {
    setPlayerAnimations(prev => ({ ...prev, [playerId]: animation }));
  };
  
  const reloadWeapon = () => {
    if (reloading || !isMyTurn) return;
    setReloading(true);
    triggerAnimation(authUser._id, 'reload');
    
    setTimeout(() => {
      // Reload ammo for current weapon
      const weapon = WEAPONS[selectedWeapon];
      if (weapon.damage) {
        setGameState(prev => ({
          ...prev,
          players: {
            ...prev.players,
            [authUser._id]: {
              ...prev.players[authUser._id],
              inventory: {
                ...prev.players[authUser._id].inventory,
                [weapon.id]: weapon.ammo
              }
            }
          }
        }));
        toast.success(`🔄 ${weapon.name} reloaded!`);
      }
      setReloading(false);
      triggerAnimation(authUser._id, 'idle');
    }, 2000);
  };

  const useWeapon = (weapon) => {
    if (!isMyTurn || animating || reloading) return;
    const now = Date.now();
    if (now - lastShot < weapon.fireRate) return toast.error("⏱️ Weapon cooldown!");
    if (myStats.inventory[weapon.id] <= 0) {
      if (weapon.damage) {
        toast.error("🚫 Out of ammo! Press R to reload");
        return;
      }
      return toast.error("🚫 Out of supplies!");
    }

    setAnimating(true);
    setLastShot(now);
    const newState = { ...gameState };
    let message = "";
    let gameOver = false;
    let winner = null;

    newState.players[authUser._id].inventory[weapon.id] -= 1;

    if (weapon.id === 'armor') {
      newState.players[authUser._id].armor = 50;
      triggerAnimation(authUser._id, 'idle');
      message = `🛡️ ${authUser.fullName} equipped armor!`;
    } else if (weapon.id === 'medkit') {
      const healAmount = weapon.heal[0] + Math.floor(Math.random() * (weapon.heal[1] - weapon.heal[0]));
      newState.players[authUser._id].health = Math.min(100, newState.players[authUser._id].health + healAmount);
      triggerAnimation(authUser._id, 'idle');
      message = `❤️ ${authUser.fullName} healed ${healAmount} HP!`;
    } else {
      // Shooting animation
      triggerAnimation(authUser._id, 'shoot');
      
      // Fire bullet with physics
      fireBullet([-6, 2, 0], [6, 2, 0]);
      
      // Calculate damage
      const baseDamage = weapon.damage[0] + Math.floor(Math.random() * (weapon.damage[1] - weapon.damage[0]));
      let actualDamage = Math.max(1, baseDamage - enemyStats.armor);
      
      if (enemyStats.armor > 0) {
        newState.players[opponent._id].armor = Math.max(0, enemyStats.armor - Math.floor(baseDamage * 0.3));
      }
      
      newState.players[opponent._id].health = Math.max(0, enemyStats.health - actualDamage);
      
      // Enemy hit animation
      setTimeout(() => {
        triggerAnimation(opponent._id, 'hit');
        createExplosion([6, 1, 0]);
      }, 800);
      
      message = `💥 ${authUser.fullName} dealt ${actualDamage} damage with ${weapon.name}!`;
      
      if (newState.players[opponent._id].health <= 0) {
        newState.players[authUser._id].kills += 1;
        gameOver = true;
        winner = authUser._id;
        message += ` 🏆 ${authUser.fullName} wins!`;
        // Death animation
        setTimeout(() => {
          triggerAnimation(opponent._id, 'death');
        }, 1000);
        // Victory animation
        setTimeout(() => {
          triggerAnimation(authUser._id, 'victory');
        }, 1500);
      }
    }
    
    // Switch turns
    if (!gameOver) {
      newState.currentTurn = newState.currentTurn === authUser._id ? opponent._id : authUser._id;
      if (newState.currentTurn === challenge.challengerId._id) {
        newState.round += 1;
      }
    }
    
    addMessage('self', message);
    setGameState(newState);
    
    socket.emit("rpg:action", {
      gameRoomId: challenge.gameRoomId,
      data: { message, newState, gameOver, winner }
    });
    
    setTimeout(() => {
      setAnimating(false);
      if (!gameOver) {
        triggerAnimation(authUser._id, 'idle');
        triggerAnimation(opponent._id, 'idle');
      }
    }, 1200);
    
    if (gameOver) setTimeout(() => onGameEnd(winner), 3000);
  };
  
  const handleCharacterSelect = (characterId) => {
    setSelectedCharacters(prev => ({ ...prev, [authUser._id]: characterId }));
    setShowCharacterSelection(false);
    toast.success(`Selected ${characterId}!`);
  };

  return (
    <div className="relative w-full h-screen bg-black">
      {/* Character Selection Modal */}
      {showCharacterSelection && (
        <CharacterSelection 
          onSelect={handleCharacterSelect}
          onClose={() => setShowCharacterSelection(false)}
        />
      )}
      {/* Enhanced 3D Canvas with Physics */}
      <Canvas
        camera={{ 
          position: [0, 12, 20], 
          fov: 60,
          near: 0.1,
          far: 1000
        }}
        shadows="soft"
        gl={{ 
          antialias: true, 
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.2,
          shadowMap: { enabled: true, type: THREE.PCFSoftShadowMap }
        }}
      >
        <Suspense fallback={null}>
          <Physics gravity={[0, -9.81, 0]} debug={false}>
            <BattleScene
              gameState={gameState}
              authUser={authUser}
              opponent={opponent}
              effects={effects}
              animating={animating}
              playerAnimations={playerAnimations}
              selectedCharacters={selectedCharacters}
            />
          </Physics>
        </Suspense>
      </Canvas>

      {/* UI Overlay */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Crosshair */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
          <div className="w-8 h-8 border-2 border-red-500 rounded-full opacity-50" />
        </div>

        {/* Player Stats */}
        <div className="absolute top-4 left-4 right-4 flex justify-between pointer-events-auto">
          <div className="bg-black/80 backdrop-blur border-2 border-blue-600 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse" />
              <span className="text-blue-400 font-bold text-sm">YOU</span>
            </div>
            <div className="flex items-center gap-2 mb-1">
              <Heart className="w-4 h-4 text-red-500" />
              <div className="w-40 h-4 bg-gray-800 border border-gray-600 rounded overflow-hidden">
                <div className="h-full bg-gradient-to-r from-red-600 to-red-400 transition-all" style={{ width: `${(myStats.health / myStats.maxHealth) * 100}%` }} />
              </div>
              <span className="text-white font-mono text-sm">{myStats.health}</span>
            </div>
            {myStats.armor > 0 && (
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-blue-400" />
                <div className="w-40 h-4 bg-gray-800 border border-gray-600 rounded overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-blue-600 to-blue-400 transition-all" style={{ width: `${(myStats.armor / 50) * 100}%` }} />
                </div>
                <span className="text-white font-mono text-sm">{myStats.armor}</span>
              </div>
            )}
          </div>

          <div className="bg-black/80 backdrop-blur border-2 border-yellow-500 rounded-lg px-4 py-2">
            <div className="text-yellow-400 font-bold">ROUND {Math.ceil(gameState.round)}</div>
          </div>

          <div className="bg-black/80 backdrop-blur border-2 border-red-600 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
              <span className="text-red-400 font-bold text-sm">ENEMY</span>
            </div>
            <div className="flex items-center gap-2 mb-1">
              <Heart className="w-4 h-4 text-red-500" />
              <div className="w-40 h-4 bg-gray-800 border border-gray-600 rounded overflow-hidden">
                <div className="h-full bg-gradient-to-r from-red-600 to-red-400 transition-all" style={{ width: `${(enemyStats.health / enemyStats.maxHealth) * 100}%` }} />
              </div>
              <span className="text-white font-mono text-sm">{enemyStats.health}</span>
            </div>
            {enemyStats.armor > 0 && (
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-blue-400" />
                <div className="w-40 h-4 bg-gray-800 border border-gray-600 rounded overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-blue-600 to-blue-400 transition-all" style={{ width: `${(enemyStats.armor / 50) * 100}%` }} />
                </div>
                <span className="text-white font-mono text-sm">{enemyStats.armor}</span>
              </div>
            )}
          </div>
        </div>

        {/* Messages */}
        <div className="absolute top-32 left-4 bg-black/70 backdrop-blur border border-green-500 rounded-lg p-2 max-w-md pointer-events-auto">
          <div className="space-y-1 max-h-32 overflow-y-auto">
            {messages.map((msg, idx) => (
              <div key={idx} className="text-xs p-1 rounded bg-green-900/30 text-green-300 font-mono">{msg.text}</div>
            ))}
          </div>
        </div>

        {/* Weapons */}
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 pointer-events-auto">
          <div className="bg-black/90 backdrop-blur border-2 border-gray-600 rounded-lg p-3">
            <div className="flex gap-2">
              {WEAPONS.map((weapon, idx) => {
                const Icon = weapon.icon;
                const ammo = myStats.inventory[weapon.id] || 0;
                const canUse = isMyTurn && !animating && ammo > 0;
                const isSelected = selectedWeapon === idx;
                
                return (
                  <button
                    key={weapon.id}
                    onClick={() => useWeapon(weapon)}
                    disabled={!canUse}
                    className={`flex flex-col items-center gap-1 px-3 py-2 rounded transition-all ${
                      isSelected ? 'bg-yellow-500/30 border-2 border-yellow-400' : 'bg-gray-800/50 border border-gray-600'
                    } ${canUse ? 'hover:bg-gray-700' : 'opacity-40 cursor-not-allowed'}`}
                  >
                    <Icon className={`w-6 h-6 ${ammo > 0 ? 'text-white' : 'text-gray-600'}`} />
                    <span className="text-xs font-bold text-white">{weapon.name}</span>
                    <span className="text-xs text-gray-400">[{weapon.key}]</span>
                    <span className={`text-xs font-mono ${ammo > 0 ? 'text-green-400' : 'text-red-400'}`}>{ammo}</span>
                  </button>
                );
              })}
            </div>
            <div className="text-center text-xs mt-2 text-gray-400 font-mono">
              [ 1-6 ] SELECT | [ ← → ENTER ] FIRE | [ R ] RELOAD | [ C ] CHARACTER
            </div>
            {reloading && (
              <div className="text-center text-xs mt-1 text-yellow-400 font-mono animate-pulse">
                🔄 RELOADING...
              </div>
            )}
          </div>
        </div>

        {/* Turn Indicator */}
        {!isMyTurn && (
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <div className="bg-red-600 text-white px-8 py-4 rounded-lg border-2 border-red-400 flex items-center gap-3 animate-pulse">
              <Activity className="w-6 h-6 animate-spin" />
              <span className="font-bold text-lg">ENEMY TURN</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ModernBattleGame;