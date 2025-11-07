
import React, { useState, useEffect, useCallback } from 'react';
import { AdventureState, ChatMessage, Notification as NotificationType, LoreEntry } from './types';
import { getInitialAdventure, getNextAdventureStep, generateImage, getChatResponse } from './services/geminiService';
import Sidebar from './components/Sidebar';
import StoryPanel from './components/StoryPanel';
import ChatBot from './components/ChatBot';
import { ChatIcon } from './components/icons/ChatIcon';
import GenreSelection from './components/GenreSelection';
import CharacterCustomization from './components/CharacterCustomization';
import Notification from './components/Notification';
import LoreModal from './components/LoreModal';


function App() {
  const [adventureState, setAdventureState] = useState<AdventureState | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [selectedGenre, setSelectedGenre] = useState<string | null>(null);
  const [characterDescription, setCharacterDescription] = useState<string | null>(null);
  const [notifications, setNotifications] = useState<NotificationType[]>([]);
  const [enemyMaxHealth, setEnemyMaxHealth] = useState<number | null>(null);
  const [loreBook, setLoreBook] = useState<LoreEntry[]>([]);
  const [isLoreModalOpen, setIsLoreModalOpen] = useState(false);


  const addNotification = useCallback((title: string, message: string) => {
    const newNotification: NotificationType = {
      id: Date.now(),
      title,
      message,
    };
    setNotifications(prev => [...prev, newNotification]);
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== newNotification.id));
    }, 5000);
  }, []);

  const startGame = useCallback(async (genre: string, description: string) => {
    setIsLoading(true);
    setError(null);
    setAdventureState(null);
    setLoreBook([]);
    try {
      const initialData = await getInitialAdventure(genre, description);
      const imageUrl = await generateImage(initialData.imagePrompt, genre, description);
      
      setAdventureState({
        story: initialData.storyText,
        imageUrl: imageUrl,
        choices: initialData.choices,
        inventory: initialData.newInventoryItems,
        quest: initialData.updatedQuest,
        health: initialData.playerHealth,
        enemy: initialData.enemy ?? null,
      });

      setLoreBook(initialData.newLoreEntries);

      initialData.newInventoryItems.forEach(item => {
        addNotification(`Item Acquired: ${item.name}`, item.description);
      });

    } catch (err) {
      setError(err instanceof Error ? err.message : "An unknown error occurred.");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [addNotification]);

  const handleGenreSelect = (genre: string) => {
    setSelectedGenre(genre);
  };

  const handleCharacterSubmit = (description: string) => {
    if (selectedGenre) {
      setCharacterDescription(description);
      startGame(selectedGenre, description);
    }
  };
  
  const handleRestart = () => {
    setSelectedGenre(null);
    setCharacterDescription(null);
    setAdventureState(null);
    setError(null);
    setIsLoading(false);
    setChatMessages([]);
    setEnemyMaxHealth(null);
    setLoreBook([]);
    setIsLoreModalOpen(false);
  };

  const handleChoice = async (choice: string) => {
    if (!adventureState || !selectedGenre || !characterDescription) return;

    setIsLoading(true);
    setError(null);

    const { story, inventory, quest, health, enemy } = adventureState;

    try {
      const nextStepData = await getNextAdventureStep(story, choice, inventory, quest, health, enemy, selectedGenre, characterDescription);
      const newImageUrl = await generateImage(nextStepData.imagePrompt, selectedGenre, characterDescription);

      if (nextStepData.initialCombatEffect) {
        addNotification('Combat Effect!', nextStepData.initialCombatEffect.description);
      }

      setAdventureState(prevState => {
        // New enemy appeared
        if (!prevState?.enemy && nextStepData.enemy) {
            setEnemyMaxHealth(nextStepData.enemy.health);
        }
        // Enemy defeated
        if (prevState?.enemy && !nextStepData.enemy) {
            setEnemyMaxHealth(null);
        }

        return {
          ...prevState!,
          story: nextStepData.storyText,
          imageUrl: newImageUrl,
          choices: nextStepData.choices,
          inventory: [...prevState!.inventory, ...nextStepData.newInventoryItems],
          quest: nextStepData.updatedQuest,
          health: nextStepData.playerHealth,
          enemy: nextStepData.enemy ?? null,
        }
      });

      if (nextStepData.newLoreEntries.length > 0) {
        setLoreBook(prev => [...prev, ...nextStepData.newLoreEntries]);
        const newEntryNames = nextStepData.newLoreEntries.map(e => e.name).join(', ');
        addNotification('New Lore Unlocked!', `Entries for ${newEntryNames} added to your lore book.`);
      }

      nextStepData.newInventoryItems.forEach(item => {
        addNotification(`Item Acquired: ${item.name}`, item.description);
      });

    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to proceed. Please try again.");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleSendMessage = async (message: string) => {
    if(!message.trim()) return;

    const newUserMessage: ChatMessage = { role: 'user', content: message };
    setChatMessages(prev => [...prev, newUserMessage]);
    setIsChatLoading(true);

    try {
      const response = await getChatResponse(message);
      const newModelMessage: ChatMessage = { role: 'model', content: response };
      setChatMessages(prev => [...prev, newModelMessage]);
    } catch (err) {
       const errorMessage: ChatMessage = { role: 'model', content: "Sorry, I couldn't get a response. Please try again." };
       setChatMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsChatLoading(false);
    }
  };
  
  if (!selectedGenre) {
    return <GenreSelection onSelectGenre={handleGenreSelect} />;
  }
  
  if (!characterDescription) {
    return <CharacterCustomization genre={selectedGenre} onStartGame={handleCharacterSubmit} />;
  }

  return (
    <>
    <div className="fixed top-4 right-4 z-50 w-full max-w-sm space-y-3">
        {notifications.map(n => (
          <Notification key={n.id} title={n.title} message={n.message} onClose={() => setNotifications(prev => prev.filter(p => p.id !== n.id))} />
        ))}
    </div>
    <LoreModal isOpen={isLoreModalOpen} onClose={() => setIsLoreModalOpen(false)} loreEntries={loreBook} />
    <div className="flex h-screen bg-gray-900 text-gray-100 font-serif">
      <Sidebar 
        inventory={adventureState?.inventory ?? []}
        quest={adventureState?.quest ?? 'Loading...'}
        health={adventureState?.health ?? 100}
        onRestart={handleRestart}
        isLoading={isLoading && !adventureState}
        onOpenLore={() => setIsLoreModalOpen(true)}
      />
      <main className="flex-1 flex flex-col p-4 md:p-8 overflow-y-auto">
        <h1 className="text-3xl md:text-4xl font-bold text-yellow-300 mb-4 text-center tracking-wider">Gemini Adventure Engine</h1>
        {error && (
          <div className="bg-red-800 border border-red-600 text-white p-4 rounded-lg mb-4 text-center">
            <p><strong>An error occurred:</strong> {error}</p>
            <button onClick={handleRestart} className="mt-2 bg-yellow-500 hover:bg-yellow-600 text-gray-900 font-bold py-2 px-4 rounded transition-colors duration-300">
              Restart Game
            </button>
          </div>
        )}
        <StoryPanel 
          adventureState={adventureState}
          isLoading={isLoading}
          onChoice={handleChoice}
          enemyMaxHealth={enemyMaxHealth}
        />
      </main>
      <button 
        onClick={() => setIsChatOpen(true)}
        className="fixed bottom-6 right-6 bg-purple-600 hover:bg-purple-700 text-white p-4 rounded-full shadow-lg z-40 transition-transform hover:scale-110"
        aria-label="Open Chat"
      >
        <ChatIcon />
      </button>
      <ChatBot 
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        messages={chatMessages}
        onSendMessage={handleSendMessage}
        isLoading={isChatLoading}
      />
    </div>
    </>
  );
}

export default App;