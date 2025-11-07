import React, { useState } from 'react';

interface CharacterCustomizationProps {
  genre: string;
  onStartGame: (description: string) => void;
}

// Data for genre-specific classes
const characterClassesByGenre: Record<string, string[]> = {
    fantasy: ['Warrior', 'Mage', 'Rogue', 'Cleric'],
    'sci-fi': ['Soldier', 'Engineer', 'Psionic', 'Smuggler'],
    mystery: ['Detective', 'Journalist', 'Femme Fatale', 'Informant'],
    'surprise me!': ['Adventurer', 'Dreamer', 'Survivor', 'Nomad']
};


const getPlaceholderForGenre = (genre: string): string => {
    switch (genre.toLowerCase()) {
        case 'sci-fi':
            return "e.g., Worn-out flight jacket, cybernetic eye, scar across their chin.";
        case 'mystery':
            return "e.g., Classic trench coat, a perpetually raised eyebrow, walks with a slight limp.";
        case 'fantasy':
            return "e.g., Silver hair, glowing tattoos, and leather armor.";
        default:
            return "e.g., A long scarf that hides their face, eyes that have seen too much.";
    }
};

const CharacterCustomization: React.FC<CharacterCustomizationProps> = ({ genre, onStartGame }) => {
  const [name, setName] = useState('');
  const [characterClass, setCharacterClass] = useState<string | null>(null);
  const [appearance, setAppearance] = useState('');

  const classes = characterClassesByGenre[genre.toLowerCase()] || characterClassesByGenre['surprise me!'];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !characterClass || !appearance.trim()) {
        // This check is mainly for robustness, the button is disabled if fields are empty
        return;
    }

    const fullDescription = `${name}, a skilled ${characterClass}. Appearance: ${appearance}`;
    onStartGame(fullDescription);
  };

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 flex flex-col items-center justify-center p-4 font-serif">
      <div className="w-full max-w-2xl text-center">
        <h1 className="text-5xl font-bold text-yellow-300 mb-2">Create Your Character</h1>
        <p className="text-xl text-gray-400 mb-8">You've chosen a <span className="text-yellow-400 font-semibold">{genre}</span> adventure. Tell us about your hero.</p>
        
        <form onSubmit={handleSubmit} className="bg-gray-800/50 p-8 rounded-lg shadow-xl border border-gray-700 space-y-6">
          
          <div>
            <label htmlFor="character-name" className="block text-left text-lg font-semibold text-yellow-400 mb-2">Name</label>
            <input
              id="character-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your character's name..."
              className="w-full bg-gray-900 text-gray-200 p-3 rounded-md border border-gray-600 focus:outline-none focus:ring-2 focus:ring-yellow-400 transition-all"
              required
            />
          </div>

          <div>
            <label className="block text-left text-lg font-semibold text-yellow-400 mb-2">Class</label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {classes.map(cClass => (
                <button
                  key={cClass}
                  type="button"
                  onClick={() => setCharacterClass(cClass)}
                  className={`py-3 px-2 rounded-md border-2 transition-all duration-200 ${
                    characterClass === cClass 
                    ? 'bg-purple-600 border-purple-400 text-white font-bold' 
                    : 'bg-gray-700 border-gray-600 hover:bg-gray-600 hover:border-gray-500'
                  }`}
                >
                  {cClass}
                </button>
              ))}
            </div>
          </div>
          
          <div>
            <label htmlFor="character-appearance" className="block text-left text-lg font-semibold text-yellow-400 mb-2">Appearance</label>
            <textarea
              id="character-appearance"
              value={appearance}
              onChange={(e) => setAppearance(e.target.value)}
              placeholder={getPlaceholderForGenre(genre)}
              className="w-full h-32 bg-gray-900 text-gray-200 p-3 rounded-md border border-gray-600 focus:outline-none focus:ring-2 focus:ring-yellow-400 transition-all"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full bg-purple-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-purple-700 transition-all duration-300 transform hover:scale-105 text-lg disabled:bg-gray-600 disabled:cursor-not-allowed disabled:transform-none"
            disabled={!name.trim() || !characterClass || !appearance.trim()}
          >
            Begin Adventure
          </button>
        </form>
      </div>
    </div>
  );
};

export default CharacterCustomization;