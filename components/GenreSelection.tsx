
import React from 'react';
import { FantasyIcon } from './icons/FantasyIcon';
import { SciFiIcon } from './icons/SciFiIcon';
import { MysteryIcon } from './icons/MysteryIcon';

interface GenreSelectionProps {
  onSelectGenre: (genre: string) => void;
}

const genres = [
  { name: 'Fantasy', description: 'Embark on a journey through enchanted forests, face mythical beasts, and uncover ancient magic.', icon: <FantasyIcon /> },
  { name: 'Sci-Fi', description: 'Explore distant galaxies, navigate futuristic cityscapes, and encounter strange alien technologies.', icon: <SciFiIcon /> },
  { name: 'Mystery', description: 'Solve cryptic puzzles in rain-slicked streets, interrogate shady characters, and unveil a dark conspiracy.', icon: <MysteryIcon /> },
  { name: 'Surprise Me!', description: 'Let fate decide your path. A completely random adventure awaits you.', icon: (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ) },
];

const GenreSelection: React.FC<GenreSelectionProps> = ({ onSelectGenre }) => {
  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 flex flex-col items-center justify-center p-4 font-serif">
      <div className="text-center mb-12">
        <h1 className="text-5xl font-bold text-yellow-300 mb-2">Welcome to the Adventure Engine</h1>
        <p className="text-xl text-gray-400">Choose a genre to begin your journey.</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl">
        {genres.map((genre) => (
          <button
            key={genre.name}
            onClick={() => onSelectGenre(genre.name)}
            className="bg-gray-800/50 p-8 rounded-lg shadow-xl border border-gray-700 text-center flex flex-col items-center group hover:border-yellow-400 hover:bg-gray-800 transition-all duration-300 transform hover:-translate-y-2"
          >
            <div className="mb-4 transition-transform duration-300 group-hover:scale-110">
                {genre.icon}
            </div>
            <h2 className="text-2xl font-bold text-yellow-400 mb-2">{genre.name}</h2>
            <p className="text-gray-300">{genre.description}</p>
          </button>
        ))}
      </div>
    </div>
  );
};

export default GenreSelection;
