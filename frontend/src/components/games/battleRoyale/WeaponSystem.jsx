import React from "react";
import { Zap, Target, Crosshair, Bomb, Shield, Heart } from "lucide-react";

export const WEAPONS = [
  {
    id: 'ak47',
    name: 'AK-47',
    icon: Zap,
    damage: { min: 35, max: 45, headshot: 65 },
    ammo: 30,
    maxAmmo: 30,
    fireRate: 300,
    range: 120,
    color: '#ff6b35',
    sound: '/sounds/ak47.mp3'
  },
  {
    id: 'm4a1',
    name: 'M4A1',
    icon: Target,
    damage: { min: 30, max: 40, headshot: 60 },
    ammo: 30,
    maxAmmo: 30,
    fireRate: 250,
    range: 110,
    color: '#9b59b6',
    sound: '/sounds/m4a1.mp3'
  },
  {
    id: 'awm',
    name: 'AWM Sniper',
    icon: Crosshair,
    damage: { min: 80, max: 120, headshot: 200 },
    ammo: 5,
    maxAmmo: 5,
    fireRate: 1500,
    range: 200,
    color: '#ffd54f',
    sound: '/sounds/sniper.mp3'
  },
  {
    id: 'shotgun',
    name: 'M1887 Shotgun',
    icon: Bomb,
    damage: { min: 60, max: 90, headshot: 120 },
    ammo: 8,
    maxAmmo: 8,
    fireRate: 800,
    range: 25,
    color: '#e74c3c',
    sound: '/sounds/shotgun.mp3'
  }
];

export function WeaponWheel({ selectedWeapon, onWeaponSelect, playerInventory }) {
  return (
    <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 pointer-events-auto">
      <div className="bg-black/80 backdrop-blur rounded-2xl p-4 border border-gray-600">
        <div className="flex gap-3 mb-3">
          {WEAPONS.map((weapon, index) => {
            const Icon = weapon.icon;
            const isSelected = selectedWeapon === index;
            const ammo = playerInventory?.[weapon.id] || 0;
            
            return (
              <button
                key={weapon.id}
                onClick={() => onWeaponSelect(index)}
                className={`relative p-3 rounded-xl transition-all ${
                  isSelected 
                    ? 'bg-gradient-to-br from-yellow-500 to-orange-500 shadow-lg' 
                    : 'bg-gray-700/50 hover:bg-gray-600/50'
                }`}
              >
                <Icon className={`w-6 h-6 ${isSelected ? 'text-white' : 'text-gray-300'}`} />
                <div className="absolute -top-2 -right-2 bg-gray-900 rounded-full w-6 h-6 flex items-center justify-center border border-gray-600">
                  <span className="text-xs font-bold text-white">{ammo}</span>
                </div>
              </button>
            );
          })}
        </div>
        
        <div className="text-center">
          <div className="text-white font-bold text-sm mb-1">
            {WEAPONS[selectedWeapon].name}
          </div>
          <div className="text-gray-300 text-xs">
            DMG: {WEAPONS[selectedWeapon].damage.min}-{WEAPONS[selectedWeapon].damage.max} | 
            RNG: {WEAPONS[selectedWeapon].range}m
          </div>
        </div>
      </div>
    </div>
  );
}