
import React from 'react';
import { AdventureState } from '../types';
import EnemyDisplay from './EnemyDisplay';

interface StoryPanelProps {
  adventureState: AdventureState | null;
  isLoading: boolean;
  onChoice: (choice: string) => void;
  enemyMaxHealth: number | null;
}

const StoryPanel: React.FC<StoryPanelProps> = ({ adventureState, isLoading, onChoice, enemyMaxHealth }) => {
  return (
    <div className="bg-gray-800/50 rounded-lg shadow-xl flex-1 flex flex-col p-6">
       {adventureState?.enemy && enemyMaxHealth && (
        <EnemyDisplay enemy={adventureState.enemy} maxHealth={enemyMaxHealth} />
      )}
      <div className="aspect-video bg-gray-900 rounded-lg mb-6 overflow-hidden relative">
        {isLoading && !adventureState?.imageUrl ? (
          <div className="w-full h-full bg-gray-700 animate-pulse flex items-center justify-center">
             <p className="text-gray-400">Generating majestic vistas...</p>
          </div>
        ) : (
          adventureState && <img src={adventureState.imageUrl} alt="Current Scene" className="w-full h-full object-cover" />
        )}
         {isLoading && adventureState?.imageUrl && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <div className="text-white text-lg">Loading next chapter...</div>
          </div>
        )}
      </div>
      
      <div className="prose prose-invert max-w-none text-gray-300 mb-6 flex-1">
        {isLoading && !adventureState?.story ? (
            <div className="space-y-3 animate-pulse">
                <div className="h-4 bg-gray-700 rounded w-full"></div>
                <div className="h-4 bg-gray-700 rounded w-full"></div>
                <div className="h-4 bg-gray-700 rounded w-5/6"></div>
            </div>
        ) : (
            <p>{adventureState?.story}</p>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {isLoading && !adventureState?.choices ? (
            <>
                <div className="h-12 bg-gray-700 rounded-lg animate-pulse"></div>
                <div className="h-12 bg-gray-700 rounded-lg animate-pulse"></div>
                <div className="h-12 bg-gray-700 rounded-lg animate-pulse"></div>
            </>
        ) : (
          adventureState?.choices.map((choice, index) => (
            <button
              key={index}
              onClick={() => onChoice(choice)}
              disabled={isLoading}
              className="bg-purple-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-purple-700 transition-all duration-300 disabled:bg-gray-600 disabled:cursor-not-allowed transform hover:scale-105 disabled:transform-none"
            >
              {choice}
            </button>
          ))
        )}
      </div>
    </div>
  );
};

export default StoryPanel;