import React from 'react';
import { LoreEntry } from '../types';
import { CloseIcon } from './icons/CloseIcon';

interface LoreModalProps {
  isOpen: boolean;
  onClose: () => void;
  loreEntries: LoreEntry[];
}

const LoreModal: React.FC<LoreModalProps> = ({ isOpen, onClose, loreEntries }) => {
  if (!isOpen) return null;

  // FIX: Replaced .reduce() with a forEach loop for clearer type inference.
  // This ensures `categorizedEntries` is correctly typed as Record<string, LoreEntry[]>,
  // which resolves the issue where `Object.entries` would infer the value type as `unknown`.
  const categorizedEntries: Record<string, LoreEntry[]> = {};
  loreEntries.forEach((entry) => {
    const category = `${entry.type}s`;
    if (!categorizedEntries[category]) {
      categorizedEntries[category] = [];
    }
    // Avoid duplicates
    if (!categorizedEntries[category].some(e => e.name.toLowerCase() === entry.name.toLowerCase())) {
        categorizedEntries[category].push(entry);
    }
  });

  return (
    <>
      <div
        className="fixed inset-0 bg-black/70 z-50 transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      ></div>
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        role="dialog"
        aria-modal="true"
        aria-labelledby="lore-modal-title"
      >
        <div className="bg-gray-800 border border-yellow-400 rounded-lg shadow-2xl w-full max-w-3xl max-h-[80vh] flex flex-col font-serif">
          <header className="flex items-center justify-between p-4 border-b border-gray-700 flex-shrink-0">
            <h2 id="lore-modal-title" className="text-2xl font-bold text-yellow-300">Lore & Bestiary</h2>
            <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-700 transition-colors">
              <CloseIcon />
            </button>
          </header>
          <main className="flex-1 overflow-y-auto p-6">
            {Object.keys(categorizedEntries).length > 0 ? (
              <div className="space-y-8">
                {Object.entries(categorizedEntries).map(([category, entries]) => (
                  <section key={category}>
                    <h3 className="text-xl font-semibold text-yellow-400 border-b-2 border-yellow-400/50 pb-2 mb-4">{category}</h3>
                    <div className="space-y-4">
                      {entries.map((entry, index) => (
                        <div key={index} className="bg-gray-900/50 p-4 rounded-md">
                          <h4 className="font-bold text-lg text-gray-100">{entry.name}</h4>
                          <p className="text-gray-300">{entry.description}</p>
                        </div>
                      ))}
                    </div>
                  </section>
                ))}
              </div>
            ) : (
              <div className="text-center text-gray-400 italic py-10">
                <p>Your lore book is empty.</p>
                <p>Explore the world to discover new creatures, characters, and items.</p>
              </div>
            )}
          </main>
        </div>
      </div>
    </>
  );
};

export default LoreModal;
