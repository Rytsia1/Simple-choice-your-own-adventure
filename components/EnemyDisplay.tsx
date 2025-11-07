
import React from 'react';
import { Enemy } from '../types';
import { SwordIcon } from './icons/SwordIcon';

interface EnemyDisplayProps {
  enemy: Enemy;
  maxHealth: number;
}

const EnemyDisplay: React.FC<EnemyDisplayProps> = ({ enemy, maxHealth }) => {
    const healthPercentage = maxHealth > 0 ? (enemy.health / maxHealth) * 100 : 0;
  
    return (
      <div className="bg-gray-900 border-2 border-red-700 rounded-lg p-4 mb-6 shadow-lg">
          <h3 className="text-xl font-bold text-red-400 mb-3 flex items-center gap-3">
              <SwordIcon />
              <span>Encounter: {enemy.name}</span>
          </h3>
          <div className="w-full bg-gray-700 rounded-full h-5 border-2 border-gray-600 overflow-hidden">
              <div
              className="h-full rounded-full bg-red-600 transition-all duration-500 ease-out"
              style={{ width: `${healthPercentage}%` }}
              />
          </div>
          <p className="text-right text-sm font-bold mt-1 text-white">
              {enemy.health} / {maxHealth}
          </p>
      </div>
    );
};

export default EnemyDisplay;