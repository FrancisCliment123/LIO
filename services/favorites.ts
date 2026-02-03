import AsyncStorage from '@react-native-async-storage/async-storage';
import { Affirmation } from './gemini';

const FAVORITES_KEY = '@lio_favorites';

export const getFavorites = async (): Promise<Affirmation[]> => {
    try {
        const data = await AsyncStorage.getItem(FAVORITES_KEY);
        return data ? JSON.parse(data) : [];
    } catch (error) {
        console.error('Error loading favorites:', error);
        return [];
    }
};

export const addFavorite = async (affirmation: Affirmation): Promise<void> => {
    try {
        const favorites = await getFavorites();
        // Prevent duplicates
        if (!favorites.some(fav => fav.id === affirmation.id)) {
            favorites.push(affirmation);
            await AsyncStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
        }
    } catch (error) {
        console.error('Error adding favorite:', error);
    }
};

export const removeFavorite = async (id: string): Promise<void> => {
    try {
        const favorites = await getFavorites();
        const filtered = favorites.filter(fav => fav.id !== id);
        await AsyncStorage.setItem(FAVORITES_KEY, JSON.stringify(filtered));
    } catch (error) {
        console.error('Error removing favorite:', error);
    }
};

export const isFavorite = async (id: string): Promise<boolean> => {
    try {
        const favorites = await getFavorites();
        return favorites.some(fav => fav.id === id);
    } catch (error) {
        console.error('Error checking favorite:', error);
        return false;
    }
};

export const getFavoritesCount = async (): Promise<number> => {
    try {
        const favorites = await getFavorites();
        return favorites.length;
    } catch (error) {
        console.error('Error getting favorites count:', error);
        return 0;
    }
};
