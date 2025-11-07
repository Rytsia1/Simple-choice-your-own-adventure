
export interface Enemy {
  name: string;
  health: number;
}

export interface InventoryItem {
  name: string;
  description: string;
}

export interface LoreEntry {
  type: 'Creature' | 'Character' | 'Item';
  name: string;
  description: string;
}

export interface AdventureState {
  story: string;
  imageUrl: string;
  choices: string[];
  inventory: InventoryItem[];
  quest: string;
  health: number;
  enemy: Enemy | null;
}

export interface GameUpdate {
  storyText: string;
  choices: string[];
  newInventoryItems: InventoryItem[];
  updatedQuest: string;
  imagePrompt: string;
  playerHealth: number;
  enemy: Enemy | null;
  newLoreEntries: LoreEntry[];
  initialCombatEffect: { description: string } | null;
}

export interface ChatMessage {
  role: 'user' | 'model';
  content: string;
}

export interface Notification {
  id: number;
  title: string;
  message: string;
}