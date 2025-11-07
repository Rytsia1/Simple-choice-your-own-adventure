
import React from 'react';
import { HeartIcon } from './icons/HeartIcon';

interface HealthBarProps {
  currentHealth: number;
  maxHealth: number;
}

const HealthBar: React.FC<HealthBarProps> = ({ currentHealth, maxHealth }) => {
  const healthPercentage = (currentHealth / maxHealth) * 100;

  const getHealthColor = () => {
    if (healthPercentage > 60) return 'bg-green-500';
    if (healthPercentage > 30) return 'bg-yellow-500';
    return 'bg-red-600';
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-yellow-400 mb-4 flex items-center gap-3">
        <HeartIcon />
        Health
      </h2>
      <div className="w-full bg-gray-700 rounded-full h-6 border-2 border-gray-600 overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ease-out ${getHealthColor()}`}
          style={{ width: `${healthPercentage}%` }}
        />
      </div>
      <p className="text-center text-sm font-bold mt-1 text-white">
        {currentHealth} / {maxHealth}
      </p>
    </div>
  );
};

export default HealthBar;
