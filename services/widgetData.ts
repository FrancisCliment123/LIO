import { Platform } from 'react-native';

const APP_GROUP = 'group.com.cisfran.lio';

/**
 * Updates the widget with the current affirmation.
 * Uses @bacons/apple-targets ExtensionStorage to write to
 * the shared App Group UserDefaults so the iOS widget can read it.
 */
export const updateWidgetData = async (affirmation: string, userName?: string): Promise<void> => {
    if (Platform.OS !== 'ios') return;

    try {
        // Dynamically import to avoid crashes on Android/web
        const { ExtensionStorage } = require('@bacons/apple-targets');
        const storage = new ExtensionStorage(APP_GROUP);

        // Save the current affirmation
        storage.set('currentAffirmation', affirmation);

        // Save user name if provided
        if (userName) {
            storage.set('userName', userName);
        }

        // Tell iOS to refresh the widget timeline
        ExtensionStorage.reloadWidget();

        console.log('✅ Widget data updated:', affirmation.substring(0, 40) + '...');
    } catch (error) {
        // Silently fail — widget features are optional
        console.log('⚠️ Widget update skipped (not available):', error);
    }
};

/**
 * Clears widget data (e.g. on logout or reset)
 */
export const clearWidgetData = async (): Promise<void> => {
    if (Platform.OS !== 'ios') return;

    try {
        const { ExtensionStorage } = require('@bacons/apple-targets');
        const storage = new ExtensionStorage(APP_GROUP);
        storage.remove('currentAffirmation');
        storage.remove('userName');
        ExtensionStorage.reloadWidget();
    } catch (error) {
        console.log('⚠️ Widget clear skipped:', error);
    }
};
