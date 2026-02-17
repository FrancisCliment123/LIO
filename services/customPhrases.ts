import AsyncStorage from '@react-native-async-storage/async-storage';
import { Affirmation } from './gemini';

const CUSTOM_PHRASES_KEY = '@lio_custom_phrases';
const CUSTOM_PHRASES_ENABLED_KEY = '@lio_custom_phrases_enabled';

export interface CustomAffirmation extends Affirmation {
    createdAt: number; // Timestamp
}

export const getCustomPhrases = async (): Promise<CustomAffirmation[]> => {
    try {
        const data = await AsyncStorage.getItem(CUSTOM_PHRASES_KEY);
        // Sort by date desc (newest first)
        const phrases = data ? JSON.parse(data) : [];
        return phrases.sort((a: CustomAffirmation, b: CustomAffirmation) => b.createdAt - a.createdAt);
    } catch (error) {
        console.error('Error loading custom phrases:', error);
        return [];
    }
};

export const addCustomPhrase = async (text: string): Promise<CustomAffirmation> => {
    try {
        const phrases = await getCustomPhrases();

        const newPhrase: CustomAffirmation = {
            id: Date.now().toString(),
            text: text.trim(),
            category: 'MY_PHRASES',
            createdAt: Date.now(),
        };

        const updatedPhrases = [newPhrase, ...phrases];
        await AsyncStorage.setItem(CUSTOM_PHRASES_KEY, JSON.stringify(updatedPhrases));

        return newPhrase;
    } catch (error) {
        console.error('Error adding custom phrase:', error);
        throw error;
    }
};

export const deleteCustomPhrase = async (id: string): Promise<void> => {
    try {
        const phrases = await getCustomPhrases();
        const filtered = phrases.filter(p => p.id !== id);
        await AsyncStorage.setItem(CUSTOM_PHRASES_KEY, JSON.stringify(filtered));
    } catch (error) {
        console.error('Error deleting custom phrase:', error);
        throw error;
    }
};

export const setCustomPhrasesEnabled = async (enabled: boolean): Promise<void> => {
    try {
        await AsyncStorage.setItem(CUSTOM_PHRASES_ENABLED_KEY, JSON.stringify(enabled));
    } catch (error) {
        console.error('Error setting custom phrases enabled:', error);
    }
};

export const getCustomPhrasesEnabled = async (): Promise<boolean> => {
    try {
        const data = await AsyncStorage.getItem(CUSTOM_PHRASES_ENABLED_KEY);
        return data ? JSON.parse(data) : true; // Default to true
    } catch (error) {
        console.error('Error getting custom phrases enabled:', error);
        return true;
    }
};
