
import { GoogleGenAI, Chat, Type, GenerateContentResponse } from "@google/genai";
import { ChatMessage, GameUpdate, Enemy, InventoryItem, LoreEntry } from '../types';

if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable is not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// FIX: Updated to 'gemini-flash-lite-latest' to align with the coding guidelines for the 'flash lite' alias.
const adventureModel = 'gemini-flash-lite-latest';
const imageModel = 'imagen-4.0-generate-001';
const chatModel = 'gemini-2.5-flash';

const getGameUpdateSchema = () => ({
    type: Type.OBJECT,
    properties: {
        storyText: { type: Type.STRING, description: "The next paragraph of the story (about 100-150 words), including combat descriptions if an enemy is present." },
        choices: { type: Type.ARRAY, items: { type: Type.STRING }, description: "An array of exactly 3 short, distinct action choices for the user. These should be combat-oriented if an enemy is present." },
        newInventoryItems: { 
            type: Type.ARRAY, 
            items: { 
                type: Type.OBJECT,
                properties: {
                    name: { type: Type.STRING, description: "The name of the new item acquired."},
                    description: { type: Type.STRING, description: "A brief, narrative description of the item's immediate effect on the player (e.g., 'You feel a surge of energy')."}
                },
                required: ["name", "description"]
            }, 
            description: "An array of any new items the user acquires. Can be empty." 
        },
        updatedQuest: { type: Type.STRING, description: "A concise update to the user's current quest." },
        imagePrompt: { type: Type.STRING, description: "A detailed, vivid prompt for an image generator based on the story text, excluding character descriptions." },
        playerHealth: { type: Type.INTEGER, description: "The player's new health value (0-100) after the events of this turn." },
        enemy: {
            description: "Details of a new or existing enemy in combat. Set to null if combat is not active or ends.",
            anyOf: [
                {
                    type: Type.OBJECT,
                    properties: {
                        name: { type: Type.STRING, description: "The enemy's name." },
                        health: { type: Type.INTEGER, description: "The enemy's current health. Must be greater than 0." }
                    },
                    required: ['name', 'health'],
                },
                {
                    type: Type.NULL,
                }
            ]
        },
        newLoreEntries: {
            type: Type.ARRAY,
            description: "An array of new lore/bestiary entries for any significant characters, creatures, or items introduced for the first time in this story segment. Can be empty.",
            items: {
                type: Type.OBJECT,
                properties: {
                    type: { type: Type.STRING, enum: ['Creature', 'Character', 'Item'], description: "The category of the lore entry." },
                    name: { type: Type.STRING, description: "The name of the creature, character, or item." },
                    description: { type: Type.STRING, description: "A brief, encyclopedic description for the lore book." }
                },
                required: ["type", "name", "description"]
            }
        },
        initialCombatEffect: {
            description: "A summary of a passive effect that occurs when combat first begins. Must be null if combat is not starting this turn.",
            anyOf: [
                {
                    type: Type.OBJECT,
                    properties: {
                        description: { type: Type.STRING, description: "A short summary of the effect for a notification (e.g., 'The bandit's ambush costs you 10 health!')." }
                    },
                    required: ['description'],
                },
                {
                    type: Type.NULL,
                }
            ]
        }
    },
    required: ["storyText", "choices", "newInventoryItems", "updatedQuest", "imagePrompt", "playerHealth", "enemy", "newLoreEntries", "initialCombatEffect"],
});


export async function getInitialAdventure(genre: string, characterDescription: string): Promise<GameUpdate> {
    const finalGenre = genre === 'Surprise Me!' ? 'a randomly selected genre' : genre;
    const prompt = `You are starting a new choose-your-own-adventure game in the ${finalGenre} genre. The player's character is: "${characterDescription}". The player starts with 100 health. Create the opening scene where this character wakes up in a mysterious location with no memory. Your response MUST be a JSON object that conforms to the provided schema. The initial quest should be to discover their identity. Set playerHealth to 100. There is no enemy at the start, so the 'enemy' field must be null, and 'initialCombatEffect' must also be null. If you introduce any significant items or characters in this opening scene, add them to the 'newLoreEntries' array.`;

    const response = await ai.models.generateContent({
        model: adventureModel,
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: getGameUpdateSchema(),
        },
    });

    try {
        const jsonText = response.text.trim();
        return JSON.parse(jsonText) as GameUpdate;
    } catch (e) {
        console.error("Failed to parse initial adventure JSON:", response.text, e);
        throw new Error("Failed to start adventure.");
    }
}

export async function getNextAdventureStep(previousStory: string, choice: string, inventory: InventoryItem[], quest: string, currentHealth: number, currentEnemy: Enemy | null, genre: string, characterDescription: string): Promise<GameUpdate> {
    const prompt = `
    You are a master storyteller for an infinite choose-your-own-adventure game in the ${genre} genre.
    The user is playing as a character described as: "${characterDescription}".
    The user is in the middle of a story. I will provide the story so far, the user's last choice, their current inventory, quest, health, and enemy status.
    Your task is to continue the story in a compelling way. The user's choices must have meaningful consequences that can affect their health.
    
    - COMBAT: Introduce enemies occasionally. When combat begins, provide the enemy's name and health in the 'enemy' field. While combat is active, choices should be combat-oriented (e.g., Attack, Defend, Use Item). Your narrative must describe the fight. Adjust player and enemy health based on the action.
    - PASSIVE COMBAT EFFECTS: When combat begins with a NEW enemy, you MUST introduce a passive effect. This could be an ambush that damages the player, a terrifying aura, or a pre-existing poison on the enemy. Describe this effect narratively in the 'storyText', reflect any health changes in the 'playerHealth' or 'enemy.health' values, and summarize the effect in the 'initialCombatEffect.description' field (e.g., "The creature's toxic spores inflict 8 damage!"). This field MUST be null if combat is not beginning on this turn.
    - ENDING COMBAT: If the player defeats the enemy (its health is reduced to 0 or less), set the 'enemy' field in your response to null. Do not describe the defeated enemy in the story text beyond its defeat.
    - CONTINUING COMBAT: If combat continues, update the enemy's health in the 'enemy' field.
    - HEALTH & ITEMS: If the user takes damage, reduce their health. If they find a restorative item, you can increase it. When the user acquires an item, describe its immediate narrative effect in the item's description. Return the player's new health value in the playerHealth field.
    - LORE: When you introduce a new and significant creature, character, or item for the first time, add a brief, encyclopedic entry for it in the 'newLoreEntries' array. Do not add entries for things that have appeared before.

    Current Story: "${previousStory}"
    User's Choice: "${choice}"
    Current Inventory: [${inventory.map(i => i.name).join(', ')}]
    Current Quest: "${quest}"
    Current Health: ${currentHealth}/100
    Current Enemy: ${currentEnemy ? `${currentEnemy.name} (${currentEnemy.health} HP)` : 'None'}

    Your response MUST be a JSON object that conforms to the provided schema.
    `;

    const response = await ai.models.generateContent({
        model: adventureModel,
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: getGameUpdateSchema(),
        },
    });

    try {
        const jsonText = response.text.trim();
        return JSON.parse(jsonText) as GameUpdate;
    } catch (e) {
        console.error("Failed to parse next adventure step JSON:", response.text, e);
        throw new Error("Failed to continue adventure.");
    }
}

function getArtStyleForGenre(genre: string): string {
    switch (genre.toLowerCase()) {
        case 'sci-fi':
            return "A sleek, futuristic digital painting with neon highlights and a cinematic feel, in the style of concept art for a AAA video game";
        case 'mystery':
            return "A moody, atmospheric image in the style of a film noir detective movie, with dramatic shadows, high contrast, and a desaturated color palette";
        case 'fantasy':
        default:
            return "A vibrant, detailed fantasy illustration in the style of a watercolor and ink storybook, with soft lighting and a slightly mysterious atmosphere";
    }
}

export async function generateImage(prompt: string, genre: string, characterDescription: string): Promise<string> {
    const artStyle = getArtStyleForGenre(genre);
    const fullPrompt = `${artStyle}. A scene depicting: ${prompt}. The main character looks like: ${characterDescription}.`;
    const response = await ai.models.generateImages({
        model: imageModel,
        prompt: fullPrompt,
        config: {
            numberOfImages: 1,
            outputMimeType: 'image/jpeg',
            aspectRatio: '16:9',
        },
    });

    if (response.generatedImages && response.generatedImages.length > 0) {
        const base64ImageBytes = response.generatedImages[0].image.imageBytes;
        return `data:image/jpeg;base64,${base64ImageBytes}`;
    }
    throw new Error("Image generation failed.");
}

let chat: Chat | null = null;

function initializeChat(): Chat {
  if (!chat) {
    chat = ai.chats.create({
      model: chatModel,
      config: {
        systemInstruction: 'You are a helpful assistant integrated into a choose-your-own-adventure game. Answer user questions concisely.',
      },
    });
  }
  return chat;
}

export async function getChatResponse(message: string): Promise<string> {
  const chatInstance = initializeChat();
  const response: GenerateContentResponse = await chatInstance.sendMessage({ message });
  return response.text;
}
