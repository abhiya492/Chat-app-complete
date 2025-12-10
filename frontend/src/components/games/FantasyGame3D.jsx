import { useState, useEffect, useRef } from "react";
import { Shield, Sword, Heart, Droplet, Flame, Wind, Zap } from "lucide-react";
import toast from "react-hot-toast";
import * as THREE from "three";

const ABILITIES = [
  { id: 'attack', name: 'Sword Strike', key: '1', icon: Sword, cost: 0, damage: [10, 20] },
  { id: 'defend', name: 'Shield Block', key: '2', icon: Shield, cost: 0 },
  { id: 'fireball', name: 'Fireball', key: '3', icon: Flame, cost: 25, damage: [25, 40] },
  { id: 'lightning', name: 'Lightning Bolt', key: '4', icon: Zap, cost: 30, damage: [30, 50] },
  { id: 'heal', name: 'Divine Heal', key: '5', icon: Heart, cost: 20, heal: [25, 35] },
  { id: 'wind', name: 'Wind Slash', key: '6', icon: Wind, cost: 15, damage: [15, 25] },
];

const FantasyGame3D = ({ challenge, authUser, opponent, socket, onGameEnd }) => {
  const mountRef = useRef(null);
  const sceneRef = useRef(null);
  const rendererRef = useRef(null);
  const cameraRef = useRef(null);
  const playerRef = useRef(null);
  const opponentObjRef = useRef(null);
  const projectilesRef = useRef([]);
  const clockRef = useRef(new THREE.Clock());

  const [gameState, setGameState] = useState({
    players: {
      [challenge.challengerId._id]: { 
        health: 120, maxHealth: 120, mana: 100, maxMana: 100, 
        power: 15, defense: 10, defending: false 
      },
      [challenge.opponentId._id]: { 
        health: 120, maxHealth: 120, mana: 100, maxMana: 100, 
        power: 15, defense: 10, defending: false 
      },
    },
    currentTurn: challenge.challengerId._id,
    round: 1,
    combo: 0,
  });

  const [messages, setMessages] = useState([]);
  const [animating, setAnimating] = useState(false);
  const [selectedAbility, setSelectedAbility] = useState(0);

  const isMyTurn = gameState.currentTurn === authUser._id;
  const myStats = gameState.players[authUser._id];
  const opponentStats = gameState.players[opponent._id];

  // Initialize Three.js scene
  useEffect(() => {
    if (!mountRef.current) return;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x1a1a2e);
    scene.fog = new THREE.Fog(0x1a1a2e, 10, 50);
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(
      60,
      mountRef.current.clientWidth / mountRef.current.clientHeight,
      0.1,
      1000
    );
    camera.position.set(0, 5, 12);
    camera.lookAt(0, 2, 0);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    mountRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(5, 10, 5);
    directionalLight.castShadow = true;
    scene.add(directionalLight);

    const pointLight1 = new THREE.PointLight(0x4a90e2, 1, 10);
    pointLight1.position.set(-3, 3, 2);
    scene.add(pointLight1);

    const pointLight2 = new THREE.PointLight(0xe24a4a, 1, 10);
    pointLight2.position.set(3, 3, 2);
    scene.add(pointLight2);

    const floorGeometry = new THREE.PlaneGeometry(20, 20);
    const floorMaterial = new THREE.MeshStandardMaterial({ 
      color: 0x2d3748,
      roughness: 0.8,
      metalness: 0.2 
    });
    const floor = new THREE.Mesh(floorGeometry, floorMaterial);
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = -0.5;
    floor.receiveShadow = true;
    scene.add(floor);

    const wallGeometry = new THREE.BoxGeometry(20, 6, 0.5);
    const wallMaterial = new THREE.MeshStandardMaterial({ color: 0x1a202c });
    const wall = new THREE.Mesh(wallGeometry, wallMaterial);
    wall.position.set(0, 2.5, -8);
    scene.add(wall);

    const playerGroup = createCharacter(0x4a90e2);
    playerGroup.position.set(-4, 0, 0);
    scene.add(playerGroup);
    playerRef.current = playerGroup;

    const opponentGroup = createCharacter(0xe24a4a);
    opponentGroup.position.set(4, 0, 0);
    scene.add(opponentGroup);
    opponentObjRef.current = opponentGroup;

    let animationId;
    const animate = () => {
      animationId = requestAnimationFrame(animate);
      
      const elapsed = clockRef.current.getElapsedTime();

      if (playerRef.current) {
        playerRef.current.position.y = Math.sin(elapsed * 2) * 0.1;
        if (myStats.defending) {
          playerRef.current.scale.setScalar(0.9 + Math.sin(elapsed * 5) * 0.05);
        } else {
          playerRef.current.scale.setScalar(1);
        }
      }

      if (opponentObjRef.current) {
        opponentObjRef.current.position.y = Math.sin(elapsed * 2 + Math.PI) * 0.1;
        if (opponentStats.defending) {
          opponentObjRef.current.scale.setScalar(0.9 + Math.sin(elapsed * 5) * 0.05);
        } else {
          opponentObjRef.current.scale.setScalar(1);
        }
      }

      projectilesRef.current = projectilesRef.current.filter(proj => {
        proj.progress += 0.02;
        if (proj.progress >= 1) {
          scene.remove(proj.mesh);
          return false;
        }
        proj.mesh.position.lerpVectors(proj.start, proj.end, proj.progress);
        proj.mesh.rotation.y += 0.2;
        return true;
      });

      camera.position.x = Math.sin(elapsed * 0.2) * 0.5;
      camera.lookAt(0, 2, 0);

      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      if (!mountRef.current) return;
      camera.aspect = mountRef.current.clientWidth / mountRef.current.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', handleResize);
      if (mountRef.current && renderer.domElement) {
        mountRef.current.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  useEffect(() => {
    if (playerRef.current && myStats.defending) {
      updateCharacterShield(playerRef.current, true);
    } else if (playerRef.current) {
      updateCharacterShield(playerRef.current, false);
    }

    if (opponentObjRef.current && opponentStats.defending) {
      updateCharacterShield(opponentObjRef.current, true);
    } else if (opponentObjRef.current) {
      updateCharacterShield(opponentObjRef.current, false);
    }
  }, [myStats.defending, opponentStats.defending]);

  function createCharacter(color) {
    const group = new THREE.Group();

    const bodyGeometry = new THREE.BoxGeometry(1, 2, 1);
    const bodyMaterial = new THREE.MeshStandardMaterial({ 
      color: color,
      roughness: 0.5,
      metalness: 0.3
    });
    const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
    body.castShadow = true;
    body.position.y = 1;
    group.add(body);

    const headGeometry = new THREE.SphereGeometry(0.5, 32, 32);
    const headMaterial = new THREE.MeshStandardMaterial({ 
      color: color,
      roughness: 0.4,
      metalness: 0.2
    });
    const head = new THREE.Mesh(headGeometry, headMaterial);
    head.castShadow = true;
    head.position.y = 2.5;
    group.add(head);

    const armGeometry = new THREE.CylinderGeometry(0.15, 0.15, 1.5);
    const armMaterial = new THREE.MeshStandardMaterial({ color: color });
    
    const leftArm = new THREE.Mesh(armGeometry, armMaterial);
    leftArm.position.set(-0.7, 1, 0);
    leftArm.rotation.z = 0.3;
    leftArm.castShadow = true;
    group.add(leftArm);

    const rightArm = new THREE.Mesh(armGeometry, armMaterial);
    rightArm.position.set(0.7, 1, 0);
    rightArm.rotation.z = -0.3;
    rightArm.castShadow = true;
    group.add(rightArm);

    return group;
  }

  function updateCharacterShield(characterGroup, show) {
    const existingShield = characterGroup.getObjectByName('shield');
    
    if (show && !existingShield) {
      const shieldGeometry = new THREE.CylinderGeometry(0.8, 0.8, 0.1, 32);
      const shieldMaterial = new THREE.MeshStandardMaterial({ 
        color: 0x4a90e2,
        metalness: 0.8,
        roughness: 0.2,
        emissive: 0x2266aa,
        emissiveIntensity: 0.3
      });
      const shield = new THREE.Mesh(shieldGeometry, shieldMaterial);
      shield.name = 'shield';
      shield.position.set(0.7, 1.5, 0);
      shield.rotation.z = Math.PI / 4;
      shield.castShadow = true;
      characterGroup.add(shield);
    } else if (!show && existingShield) {
      characterGroup.remove(existingShield);
    }
  }

  function createProjectile(start, end, type) {
    const colors = {
      fire: 0xff4500,
      lightning: 0xffff00,
      wind: 0x00ffff
    };

    const geometry = new THREE.SphereGeometry(0.3, 16, 16);
    const material = new THREE.MeshStandardMaterial({ 
      color: colors[type],
      emissive: colors[type],
      emissiveIntensity: 2
    });
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.copy(start);

    const light = new THREE.PointLight(colors[type], 2, 5);
    mesh.add(light);

    sceneRef.current.add(mesh);

    projectilesRef.current.push({
      mesh,
      start: start.clone(),
      end: end.clone(),
      progress: 0
    });
  }

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

  useEffect(() => {
    const handleKeyPress = (e) => {
      if (!isMyTurn || animating) return;

      const abilityIndex = parseInt(e.key) - 1;
      if (abilityIndex >= 0 && abilityIndex < ABILITIES.length) {
        useAbility(ABILITIES[abilityIndex]);
      }

      if (e.key === 'ArrowLeft') {
        setSelectedAbility(prev => Math.max(0, prev - 1));
      } else if (e.key === 'ArrowRight') {
        setSelectedAbility(prev => Math.min(ABILITIES.length - 1, prev + 1));
      } else if (e.key === 'Enter' || e.key === ' ') {
        useAbility(ABILITIES[selectedAbility]);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [isMyTurn, animating, selectedAbility, myStats, opponentStats]);

  const addMessage = (type, text) => {
    setMessages(prev => [...prev.slice(-5), { type, text, timestamp: Date.now() }]);
  };

  const useAbility = (ability) => {
    if (!isMyTurn || animating) return;
    if (ability.cost > myStats.mana) {
      toast.error("Not enough mana!");
      return;
    }

    setAnimating(true);
    const newState = { ...gameState };
    let message = "";
    let gameOver = false;
    let winner = null;

    newState.players[authUser._id].defending = false;

    if (ability.id === 'defend') {
      newState.players[authUser._id].defending = true;
      message = `🛡️ ${authUser.fullName} raises their shield!`;
    } else if (ability.damage) {
      if (['fireball', 'lightning', 'wind'].includes(ability.id)) {
        const type = ability.id === 'fireball' ? 'fire' : ability.id === 'lightning' ? 'lightning' : 'wind';
        createProjectile(
          new THREE.Vector3(-4, 2, 0),
          new THREE.Vector3(4, 2, 0),
          type
        );
      }

      const [min, max] = ability.damage;
      let damage = Math.floor(Math.random() * (max - min + 1)) + min;
      damage += myStats.power;
      
      if (opponentStats.defending) damage = Math.floor(damage * 0.4);
      else damage = Math.max(1, damage - opponentStats.defense);

      if (newState.combo > 0) {
        damage = Math.floor(damage * (1 + newState.combo * 0.1));
        message = `💥 ${newState.combo}x COMBO! `;
      }

      newState.players[opponent._id].health = Math.max(0, opponentStats.health - damage);
      newState.players[authUser._id].mana -= ability.cost;
      newState.combo += 1;

      message += `⚔️ ${authUser.fullName} used ${ability.name} for ${damage} damage!`;
      
      if (newState.players[opponent._id].health <= 0) {
        gameOver = true;
        winner = authUser._id;
        message += " 💀 VICTORY!";
      }
    } else if (ability.heal) {
      const [min, max] = ability.heal;
      const healAmount = Math.floor(Math.random() * (max - min + 1)) + min;
      newState.players[authUser._id].health = Math.min(myStats.maxHealth, myStats.health + healAmount);
      newState.players[authUser._id].mana -= ability.cost;
      message = `💚 ${authUser.fullName} healed ${healAmount} HP!`;
      newState.combo = 0;
    }

    newState.players[authUser._id].mana = Math.min(myStats.maxMana, newState.players[authUser._id].mana + 10);
    newState.currentTurn = opponent._id;
    newState.round += 0.5;

    socket.emit("rpg:action", {
      gameRoomId: challenge.gameRoomId,
      data: { message, newState, gameOver, winner }
    });

    addMessage('player', message);
    setGameState(newState);
    
    setTimeout(() => {
      setAnimating(false);
      if (!gameOver) {
        socket.emit("rpg:turn-end", { gameRoomId: challenge.gameRoomId });
      }
    }, 500);

    if (gameOver) {
      setTimeout(() => onGameEnd(winner), 2000);
    }
  };

  return (
    <div className="relative w-full h-screen bg-gray-900">
      <div ref={mountRef} className="w-full h-full" />

      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-4 left-4 right-4 flex justify-between pointer-events-auto">
          <div className="bg-gray-800/90 backdrop-blur rounded-lg p-3 shadow-lg">
            <h3 className="font-bold text-sm mb-2 text-white">You</h3>
            <div className="flex items-center gap-2 mb-1">
              <Heart className="w-4 h-4 text-red-500" />
              <div className="w-32 h-3 bg-gray-700 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-green-500 transition-all"
                  style={{ width: `${(myStats.health / myStats.maxHealth) * 100}%` }}
                />
              </div>
              <span className="text-xs text-white">{myStats.health}/{myStats.maxHealth}</span>
            </div>
            <div className="flex items-center gap-2">
              <Droplet className="w-4 h-4 text-blue-500" />
              <div className="w-32 h-3 bg-gray-700 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-blue-500 transition-all"
                  style={{ width: `${(myStats.mana / myStats.maxMana) * 100}%` }}
                />
              </div>
              <span className="text-xs text-white">{myStats.mana}/{myStats.maxMana}</span>
            </div>
          </div>

          <div className="text-center">
            <div className="bg-purple-600 text-white px-4 py-2 rounded-lg font-bold">
              Round {Math.ceil(gameState.round)}
            </div>
            {gameState.combo > 0 && (
              <div className="bg-yellow-500 text-black px-3 py-1 rounded-lg font-bold mt-2">
                {gameState.combo}x COMBO!
              </div>
            )}
          </div>

          <div className="bg-gray-800/90 backdrop-blur rounded-lg p-3 shadow-lg">
            <h3 className="font-bold text-sm mb-2 text-white">{opponent.fullName}</h3>
            <div className="flex items-center gap-2 mb-1">
              <Heart className="w-4 h-4 text-red-500" />
              <div className="w-32 h-3 bg-gray-700 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-green-500 transition-all"
                  style={{ width: `${(opponentStats.health / opponentStats.maxHealth) * 100}%` }}
                />
              </div>
              <span className="text-xs text-white">{opponentStats.health}/{opponentStats.maxHealth}</span>
            </div>
            <div className="flex items-center gap-2">
              <Droplet className="w-4 h-4 text-blue-500" />
              <div className="w-32 h-3 bg-gray-700 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-blue-500 transition-all"
                  style={{ width: `${(opponentStats.mana / opponentStats.maxMana) * 100}%` }}
                />
              </div>
              <span className="text-xs text-white">{opponentStats.mana}/{opponentStats.maxMana}</span>
            </div>
          </div>
        </div>

        <div className="absolute top-32 left-4 bg-gray-800/90 backdrop-blur rounded-lg p-3 max-w-xs pointer-events-auto">
          <div className="space-y-1 max-h-40 overflow-y-auto">
            {messages.map((msg, idx) => (
              <div key={idx} className="text-xs p-2 rounded bg-gray-700/50 text-white">
                {msg.text}
              </div>
            ))}
          </div>
        </div>

        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 pointer-events-auto">
          <div className="bg-gray-800/90 backdrop-blur rounded-lg p-4 shadow-xl">
            <div className="flex gap-2">
              {ABILITIES.map((ability, idx) => {
                const Icon = ability.icon;
                const canUse = isMyTurn && !animating && myStats.mana >= ability.cost;
                const isSelected = selectedAbility === idx;
                
                return (
                  <button
                    key={ability.id}
                    onClick={() => useAbility(ability)}
                    disabled={!canUse}
                    className={`flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-all ${
                      isSelected ? 'ring-2 ring-yellow-400' : ''
                    } ${
                      canUse ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-900 opacity-50 cursor-not-allowed'
                    }`}
                  >
                    <Icon className={`w-5 h-5 ${
                      ability.id === 'defend' ? 'text-blue-400' :
                      ability.heal ? 'text-green-400' :
                      ability.cost > 0 ? 'text-purple-400' : 'text-red-400'
                    }`} />
                    <span className="text-xs font-bold text-white">{ability.name}</span>
                    <span className="text-xs text-gray-400">[{ability.key}]</span>
                    {ability.cost > 0 && <span className="text-xs text-blue-300">{ability.cost} MP</span>}
                  </button>
                );
              })}
            </div>
            <div className="text-center text-xs mt-2 text-gray-400">
              Press 1-6 or use ← → + Enter
            </div>
          </div>
        </div>

        {!isMyTurn && (
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <div className="bg-yellow-500 text-black px-6 py-4 rounded-lg shadow-xl flex items-center gap-3">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-black"></div>
              <span className="font-bold">Opponent's Turn...</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FantasyGame3D;
