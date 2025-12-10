import { useProgress } from '@react-three/drei';
import { useState, useEffect } from 'react';
import * as THREE from 'three';

// Cloudinary asset URLs (replace with your actual Cloudinary URLs)
export const ASSETS = {
  textures: {
    grass: 'https://res.cloudinary.com/your-cloud/image/upload/v1/textures/grass.jpg',
    concrete: 'https://res.cloudinary.com/your-cloud/image/upload/v1/textures/concrete.jpg',
    metal: 'https://res.cloudinary.com/your-cloud/image/upload/v1/textures/metal.jpg',
    glass: 'https://res.cloudinary.com/your-cloud/image/upload/v1/textures/glass.jpg'
  },
  models: {
    character: 'https://res.cloudinary.com/your-cloud/raw/upload/v1/models/character.glb',
    car: 'https://res.cloudinary.com/your-cloud/raw/upload/v1/models/car.glb',
    building: 'https://res.cloudinary.com/your-cloud/raw/upload/v1/models/building.glb'
  },
  sounds: {
    shoot: 'https://res.cloudinary.com/your-cloud/video/upload/v1/sounds/shoot.mp3',
    hit: 'https://res.cloudinary.com/your-cloud/video/upload/v1/sounds/hit.mp3',
    reload: 'https://res.cloudinary.com/your-cloud/video/upload/v1/sounds/reload.mp3'
  }
};

// Texture cache for performance
const textureCache = new Map();

export const useAssetLoader = () => {
  const [assetsLoaded, setAssetsLoaded] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);

  useEffect(() => {
    // Simulate quick loading
    const timer = setTimeout(() => {
      setAssetsLoaded(true);
      setLoadingProgress(100);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);

  return { assetsLoaded, loadingProgress };
};

export const loadTexture = (url, fallbackColor = '#ffffff') => {
  if (textureCache.has(fallbackColor)) {
    return textureCache.get(fallbackColor);
  }

  // Create procedural texture instead of loading
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = 512;
  const ctx = canvas.getContext('2d');
  
  // Generate texture based on type
  if (fallbackColor === '#4a6741') {
    // Grass texture
    ctx.fillStyle = '#4a6741';
    ctx.fillRect(0, 0, 512, 512);
    for(let i = 0; i < 200; i++) {
      ctx.fillStyle = `hsl(${80 + Math.random() * 20}, 60%, ${30 + Math.random() * 15}%)`;
      ctx.fillRect(Math.random() * 512, Math.random() * 512, 3, 3);
    }
  } else {
    ctx.fillStyle = fallbackColor;
    ctx.fillRect(0, 0, 512, 512);
  }
  
  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(4, 4);
  
  textureCache.set(fallbackColor, texture);
  return texture;
};

export const GameLoadingScreen = ({ progress }) => {
  return (
    <div className="fixed inset-0 bg-black flex items-center justify-center z-50">
      <div className="text-center">
        <div className="mb-8">
          <div className="w-32 h-32 mx-auto mb-4 relative">
            <div className="absolute inset-0 border-4 border-blue-500/20 rounded-full"></div>
            <div 
              className="absolute inset-0 border-4 border-blue-500 rounded-full border-t-transparent animate-spin"
              style={{ 
                transform: `rotate(${progress * 3.6}deg)`,
                transition: 'transform 0.3s ease'
              }}
            ></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-2xl font-bold text-white">{Math.round(progress)}%</span>
            </div>
          </div>
        </div>
        
        <h2 className="text-3xl font-bold text-white mb-4">Loading Battle Royale</h2>
        <p className="text-gray-400 mb-6">Preparing high-quality assets...</p>
        
        <div className="w-80 bg-gray-800 rounded-full h-3 mx-auto">
          <div 
            className="bg-gradient-to-r from-blue-500 to-purple-600 h-3 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
        
        <div className="mt-4 text-sm text-gray-500">
          {progress < 30 && "Loading textures..."}
          {progress >= 30 && progress < 60 && "Loading 3D models..."}
          {progress >= 60 && progress < 90 && "Loading audio files..."}
          {progress >= 90 && "Almost ready..."}
        </div>
      </div>
    </div>
  );
};

export const OptimizedMaterial = ({ type = 'standard', ...props }) => {
  const materials = {
    grass: {
      color: '#4a6741',
      roughness: 0.9,
      metalness: 0.1,
      map: loadTexture('', '#4a6741')
    },
    concrete: {
      color: '#7f8c8d',
      roughness: 0.8,
      metalness: 0.2
    },
    metal: {
      color: '#34495e',
      roughness: 0.3,
      metalness: 0.8
    },
    glass: {
      color: '#ecf0f1',
      roughness: 0.1,
      metalness: 0.1,
      transparent: true,
      opacity: 0.8
    }
  };

  const materialProps = materials[type] || { color: '#ffffff' };
  
  return <meshStandardMaterial {...materialProps} {...props} />;
};