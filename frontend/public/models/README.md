# 3D Character Models

## How to Add Mixamo Models

1. **Visit Mixamo**: Go to https://www.mixamo.com
2. **Select Character**: Choose a character (e.g., "Soldier", "Swat Guy", "Mutant")
3. **Download Character**: 
   - Format: glTF Binary (.glb)
   - Pose: T-Pose
   - No animations needed for base model

4. **Add Animations** (Optional):
   - Select same character
   - Choose animations: "Idle", "Rifle Aiming", "Hit Reaction", "Death"
   - Download with animations included
   - Format: glTF Binary (.glb)

5. **File Naming**:
   - `soldier.glb` - Main character model
   - `character.glb` - Alternative character
   - `soldier_animated.glb` - Character with animations

## Current Setup

The game will automatically try to load:
1. `/models/soldier.glb` (your custom model)
2. `/models/character.glb` (fallback model)
3. Online fallback model (if available)
4. Enhanced basic geometry (final fallback)

## Recommended Mixamo Characters

- **Soldier**: Military character with tactical gear
- **Swat Guy**: SWAT team member
- **Mutant**: Sci-fi character
- **Remy**: Casual character

## Recommended Animations

- **Idle**: Standing idle animation
- **Rifle Aiming**: Shooting animation
- **Hit Reaction**: Getting hit animation
- **Death**: Death animation (optional)

## File Size Optimization

- Keep models under 5MB for web performance
- Use Draco compression (automatically handled)
- Optimize textures to 512x512 or 1024x1024