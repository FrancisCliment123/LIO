import AsyncStorage from '@react-native-async-storage/async-storage';

const NOTIFICATION_SETTINGS_KEY = '@notification_settings';

export interface NotificationSettings {
    enabled: boolean;
    count: number;
    startTime: string;
    endTime: string;
    streakReminderEnabled: boolean;
}

const DEFAULT_SETTINGS: NotificationSettings = {
    enabled: false,
    count: 3,
    startTime: '9:00',
    endTime: '18:00',
    streakReminderEnabled: true,
};

export const getNotificationSettings = async (): Promise<NotificationSettings> => {
    try {
        const value = await AsyncStorage.getItem(NOTIFICATION_SETTINGS_KEY);
        if (value !== null) {
            return JSON.parse(value);
        }
        return DEFAULT_SETTINGS;
    } catch (error) {
        console.error('Error loading notification settings:', error);
        return DEFAULT_SETTINGS;
    }
};

export const saveNotificationSettings = async (settings: NotificationSettings): Promise<void> => {
    try {
        await AsyncStorage.setItem(NOTIFICATION_SETTINGS_KEY, JSON.stringify(settings));
    } catch (error) {
        console.error('Error saving notification settings:', error);
    }
};
