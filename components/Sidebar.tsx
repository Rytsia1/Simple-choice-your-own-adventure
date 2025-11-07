
import React from 'react';
import { InventoryIcon } from './icons/InventoryIcon';
import { QuestIcon } from './icons/QuestIcon';
import { InventoryItem } from '../types';
import HealthBar from './HealthBar';
import { BookIcon } from './icons/BookIcon';

interface SidebarProps {
  inventory: InventoryItem[];
  quest: string;
  health: number;
  onRestart: () => void;
  isLoading: boolean;
  onOpenLore: () => void;
}

const SkeletonLoader: React.FC = () => (
  <div className="animate-pulse">
    <div className="h-4 bg-gray-700 rounded w-3/4 mb-2"></div>
    <div className="h-4 bg-gray-700 rounded w-1/2"></div>
  </div>
);

const Sidebar: React.FC<SidebarProps> = ({ inventory, quest, health, onRestart, isLoading, onOpenLore }) => {
  return (
    <aside className="w-64 md:w-80 bg-gray-800/50 p-6 flex-shrink-0 flex flex-col justify-between border-r border-gray-700">
      <div>
        <div className="mb-8">
            <HealthBar currentHealth={health} maxHealth={100} />
        </div>
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-yellow-400 mb-4 flex items-center gap-3">
            <QuestIcon />
            Current Quest
          </h2>
          <div className="bg-gray-900/50 p-4 rounded-lg min-h-[6rem]">
            {isLoading ? <SkeletonLoader /> : <p className="text-gray-300">{quest}</p>}
          </div>
        </div>
        <div>
          <h2 className="text-2xl font-bold text-yellow-400 mb-4 flex items-center gap-3">
            <InventoryIcon />
            Inventory
          </h2>
          <div className="bg-gray-900/50 p-4 rounded-lg min-h-[10rem]">
            {isLoading ? (
              <ul>
                <li className="mb-2"><SkeletonLoader/></li>
                <li className="mb-2"><SkeletonLoader/></li>
              </ul>
            ) : inventory.length > 0 ? (
              <ul className="space-y-2">
                {inventory.map((item, index) => (
                  <li key={index} className="text-gray-300 capitalize">- {item.name}</li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-500 italic">Your inventory is empty.</p>
            )}
          </div>
        </div>
      </div>
      <div className="mt-8 space-y-3">
        <button
          onClick={onOpenLore}
          className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition-colors duration-300"
        >
          <BookIcon />
          Lore / Bestiary
        </button>
        <button 
          onClick={onRestart}
          className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded transition-colors duration-300"
        >
          New Game
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;