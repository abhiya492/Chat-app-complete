import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import toast from "react-hot-toast";
import { useAuthStore } from "../../../store/useAuthStore";

export function GameLogic({ authUser, opponent, onGameEnd, players, setPlayers, pickups, setPickups, bulletsRef, explosionsRef, setTick, shootAudio, hitAudio, localRef, enemyRef, cameraRef, keys, phase, setPhase, setWinner }) {
  const { socket } = useAuthStore();
  useFrame((state, delta) => {
    const local = players[authUser._id];
    if (!local) return;

    const speed = 8;
    const dir = new THREE.Vector3();
    const forward = keys.current["w"] || keys.current["arrowup"];
    const back = keys.current["s"] || keys.current["arrowdown"];
    const left = keys.current["a"] || keys.current["arrowleft"];
    const right = keys.current["d"] || keys.current["arrowright"];
    const shift = keys.current["shift"];
    const runMult = shift ? 1.5 : 1;

    if (forward) dir.z -= 1;
    if (back) dir.z += 1;
    if (left) dir.x -= 1;
    if (right) dir.x += 1;

    if (dir.lengthSq() > 0) {
      dir.normalize();
      const cam = state.camera;
      const camDir = new THREE.Vector3();
      cam.getWorldDirection(camDir);
      camDir.y = 0;
      camDir.normalize();
      const camRight = new THREE.Vector3().crossVectors(new THREE.Vector3(0, 1, 0), camDir).normalize();
      const moveVec = new THREE.Vector3();
      moveVec.addScaledVector(camDir, -dir.z);
      moveVec.addScaledVector(camRight, dir.x);
      moveVec.normalize().multiplyScalar(speed * runMult * delta);
      const newPos = players[authUser._id].position.clone().add(moveVec);
      players[authUser._id].position.copy(newPos);
      if (localRef.current) localRef.current.position.copy(newPos);
      setPlayers((prev) => ({ ...prev, [authUser._id]: { ...prev[authUser._id], isMoving: true } }));
      
      if (socket) {
        socket.emit("battleRoyale:move", {
          playerId: authUser._id,
          position: { x: newPos.x, y: newPos.y, z: newPos.z },
          isMoving: true
        });
      }
    } else {
      if (players[authUser._id].isMoving) {
        setPlayers((prev) => ({ ...prev, [authUser._id]: { ...prev[authUser._id], isMoving: false } }));
        
        if (socket) {
          socket.emit("battleRoyale:move", {
            playerId: authUser._id,
            position: { x: players[authUser._id].position.x, y: players[authUser._id].position.y, z: players[authUser._id].position.z },
            isMoving: false
          });
        }
      }
    }

    const enemy = players[opponent._id];
    if (enemy) {
      const toLocal = new THREE.Vector3().subVectors(players[authUser._id].position, enemy.position);
      const dist = toLocal.length();
      if (dist > 6) {
        toLocal.normalize().multiplyScalar(3 * delta);
        enemy.position.add(toLocal);
        if (enemyRef.current) enemyRef.current.position.copy(enemy.position);
        setPlayers((prev) => ({ ...prev, [opponent._id]: { ...prev[opponent._id], isMoving: true } }));
      } else {
        setPlayers((prev) => ({ ...prev, [opponent._id]: { ...prev[opponent._id], isMoving: false } }));
      }
    }

    if (localRef.current) {
      const p = localRef.current.position.clone();
      const camTarget = new THREE.Vector3(p.x, p.y + 1.8, p.z);
      const camPos = camTarget.clone().add(new THREE.Vector3(0, 5, 9));
      state.camera.position.lerp(camPos, 0.12);
      state.camera.lookAt(camTarget);
    }

    if (bulletsRef.current.length > 0) {
      for (let i = bulletsRef.current.length - 1; i >= 0; i--) {
        const b = bulletsRef.current[i];
        b.travel += delta * b.speed;
        if (b.travel >= 1) {
          const target = b.targetId && players[b.targetId] ? players[b.targetId] : null;
          if (target) {
            const dmg = b.damage;
            const newHealth = Math.max(0, target.health - dmg);
            setPlayers((prev) => ({ ...prev, [target.id]: { ...prev[target.id], health: newHealth } }));
            if (newHealth <= 0) {
              setPhase("ended");
              setWinner(b.shooterId);
              toast.success(`${players[b.shooterId].name} eliminated ${target.name}!`);
              onGameEnd(b.shooterId);
            } else {
              hitAudio?.play();
              toast(`${target.name} -${Math.round(dmg)}`, { icon: "💥" });
            }
          }
          explosionsRef.current.push({ id: Date.now() + Math.random(), position: b.end });
          bulletsRef.current.splice(i, 1);
        } else {
          const cur = new THREE.Vector3().lerpVectors(new THREE.Vector3(...b.start), new THREE.Vector3(...b.end), b.travel);
          b.currentPos.set(cur.x, cur.y, cur.z);
        }
      }
      setTick((t) => t + 1);
    }

    if (explosionsRef.current.length > 0) {
      setTick((t) => t + 1);
    }
  });
  return null;
}