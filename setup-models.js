#!/usr/bin/env node

/**
 * Mixamo Model Setup Helper
 * 
 * This script helps you set up 3D character models for the battle game.
 * 
 * Usage:
 * 1. Download models from Mixamo (https://www.mixamo.com)
 * 2. Place .glb files in frontend/public/models/
 * 3. Run: node setup-models.js
 */

const fs = require('fs');
const path = require('path');

const MODELS_DIR = path.join(__dirname, 'frontend', 'public', 'models');
const REQUIRED_MODELS = ['soldier.glb', 'character.glb'];

console.log('🎮 Mixamo Model Setup Helper\n');

// Check if models directory exists
if (!fs.existsSync(MODELS_DIR)) {
  console.log('❌ Models directory not found. Creating...');
  fs.mkdirSync(MODELS_DIR, { recursive: true });
  console.log('✅ Created models directory');
}

// Check for existing models
console.log('📁 Checking for 3D models...\n');

const existingModels = fs.readdirSync(MODELS_DIR)
  .filter(file => file.endsWith('.glb') || file.endsWith('.gltf') || file.endsWith('.fbx'));

if (existingModels.length === 0) {
  console.log('⚠️  No 3D models found!');
  console.log('\n📋 To add Mixamo models:');
  console.log('1. Visit https://www.mixamo.com');
  console.log('2. Select a character (e.g., "Soldier", "Swat Guy")');
  console.log('3. Download as glTF Binary (.glb) or FBX');
  console.log('4. Save as frontend/public/models/soldier.glb or character.fbx');
  console.log('\n🎯 The game will use enhanced basic geometry as fallback');
} else {
  console.log('✅ Found 3D models:');
  existingModels.forEach(model => {
    const filePath = path.join(MODELS_DIR, model);
    const stats = fs.statSync(filePath);
    const sizeInMB = (stats.size / (1024 * 1024)).toFixed(2);
    console.log(`   📦 ${model} (${sizeInMB} MB)`);
  });
  
  console.log('\n🚀 Models are ready! The battle game will load them automatically.');
}

// Check model file sizes
const largeModels = existingModels.filter(model => {
  const filePath = path.join(MODELS_DIR, model);
  const stats = fs.statSync(filePath);
  return stats.size > 10 * 1024 * 1024; // 10MB
});

if (largeModels.length > 0) {
  console.log('\n⚠️  Large model files detected:');
  largeModels.forEach(model => {
    console.log(`   📦 ${model} - Consider optimizing for web performance`);
  });
}

console.log('\n🎮 Setup complete! Start the game to see your 3D characters in action.');