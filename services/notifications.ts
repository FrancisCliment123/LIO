import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

// Configure how notifications behave when the app is in the foreground
Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldPlaySound: true,
        shouldSetBadge: false,
        shouldShowBanner: true,
        shouldShowList: true,
    }),
});

export const registerForPushNotificationsAsync = async (): Promise<string | undefined> => {
    let token;

    if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('default', {
            name: 'default',
            importance: Notifications.AndroidImportance.MAX,
            vibrationPattern: [0, 250, 250, 250],
            lightColor: '#FF231F7C',
        });
    }

    if (Device.isDevice) {
        const { status: existingStatus } = await Notifications.getPermissionsAsync();
        let finalStatus = existingStatus;
        if (existingStatus !== 'granted') {
            const { status } = await Notifications.requestPermissionsAsync();
            finalStatus = status;
        }
        if (finalStatus !== 'granted') {
            console.log('Permission not granted to get push token for push notification!');
            return;
        }

        // Get the Expo Push Token
        try {
            const projectId = undefined; // We can set this if we have a specific EAS project ID, otherwise it infers from app.json if logged in
            token = (await Notifications.getExpoPushTokenAsync({ projectId })).data;
            console.log('Expo Push Token:', token);
        } catch (e) {
            console.log('Error getting push token:', e);
        }
    } else {
        console.log('Must use physical device for Push Notifications');
    }

    return token;
};

// Library of affirmations by category
const AFFIRMATION_LIBRARY = {
    motivation: [
        "Eres capaz de cosas increíbles. ✨",
        "Hoy es una nueva oportunidad para brillar. 🌟",
        "Tu potencial es infinito. 🚀",
        "Cada paso cuenta, sigue adelante. 💪",
        "Confía en tu fuerza interior. 🔥",
        "El éxito es la suma de pequeños esfuerzos diarios. 📈",
        "Eres más fuerte de lo que crees. 🦁"
    ],
    selfCare: [
        "Cuidar de ti no es egoísta, es necesario. 🌸",
        "Mereces amor y respeto, empezando por ti. ❤️",
        "Escucha a tu cuerpo y dale lo que necesita. 🌿",
        "Tu paz mental es una prioridad. 🧘",
        "Eres suficiente tal como eres. ✨",
        "Date permiso para descansar. 💤",
        "Abraza tu vulnerabilidad, es tu fuerza. 🦋"
    ],
    growth: [
        "Los desafíos son oportunidades para crecer. 🌱",
        "Estás en constante evolución. 🔄",
        "Aprende de cada experiencia. 📚",
        "Tu mejor versión está por llegar. 🌈",
        "El cambio es parte natural de la vida. 🍂",
        "Invierte en ti, es la mejor inversión. 💎",
        "Tus errores no te definen, te enseñan. 💡"
    ],
    peace: [
        "Respira profundo, todo estará bien. 🌬️",
        "Encuentra la calma en el caos. 🌊",
        "Suelta lo que no puedes controlar. 🍃",
        "La paz comienza contigo. 🕊️",
        "Vive el momento presente. ⏳",
        "Tu mente es un cielo despejado. ☀️",
        "La serenidad es tu estado natural. ☁️"
    ],
    gratitude: [
        "Agradece las pequeñas cosas de hoy. 🌻",
        "La gratitud transforma lo que tienes en suficiente. 🙏",
        "Hoy decido ver lo bueno en todo. 👁️",
        "Gracias por este nuevo día. ☀️",
        "Celebra tus logros, por pequeños que sean. 🎉",
        "La vida está llena de bendiciones. ✨",
        "Agradezco todo lo que soy y todo lo que tengo. 💖"
    ]
};

// Helper to get a random affirmation
const getRandomAffirmation = (): string => {
    const categories = Object.values(AFFIRMATION_LIBRARY);
    // Flatten all categories into one big array for true randomness across all
    const allAffirmations = categories.flat();

    const randomIndex = Math.floor(Math.random() * allAffirmations.length);
    return allAffirmations[randomIndex];
};

// Function to trigger a local test notification immediately (good for simulators/testing UI)
export const scheduleTestNotification = async () => {
    const affirmation = getRandomAffirmation();

    await Notifications.scheduleNotificationAsync({
        content: {
            title: "Lio",
            body: affirmation,
            data: { data: 'goes here', test: true },
            sound: true, // This plays the default sound
        },
        trigger: null, // null means trigger immediately
    });
};

// Function to schedule daily notifications based on user settings
const scheduleDailyAffirmations = async (
    count: number,
    startTime: string,
    endTime: string,
    enabled: boolean
) => {
    if (!enabled || count <= 0) {
        console.log('Daily affirmations disabled or count is 0');
        return;
    }

    // Parse times (Assume "H:MM" format)
    const [startH] = startTime.split(':').map(Number);
    const [endH] = endTime.split(':').map(Number);

    // Simple scheduling: Spread 'count' notifications across the interval
    const totalHours = endH > startH ? endH - startH : (24 - startH) + endH;
    const interval = totalHours / count;

    const schedulingPromises = [];
    for (let i = 0; i < count; i++) {
        const offsetHours = startH + (i * interval);
        const hour = Math.floor(offsetHours) % 24;
        const minute = Math.floor((offsetHours % 1) * 60);

        schedulingPromises.push(Notifications.scheduleNotificationAsync({
            content: {
                title: "Lio",
                body: getRandomAffirmation(),
                sound: true,
            },
            trigger: {
                type: Notifications.SchedulableTriggerInputTypes.DAILY,
                hour,
                minute,
            },
        }));
    }

    await Promise.all(schedulingPromises);
    console.log(`✅ Scheduled ${count} daily affirmations between ${startTime} and ${endTime}`);
};

// Function to schedule a streak reminder
const scheduleStreakReminderInternal = async (enabled: boolean) => {
    if (!enabled) return;

    await Notifications.scheduleNotificationAsync({
        content: {
            title: "Lio",
            body: "No olvides tu racha de hoy. ¡Mantén el impulso! 🔥",
            sound: true,
        },
        trigger: {
            type: Notifications.SchedulableTriggerInputTypes.DAILY,
            hour: 21, // 9 PM
            minute: 0,
        },
    });
    console.log('✅ Scheduled streak reminder for 21:00');
};

/**
 * Main function to schedule all app notifications
 * This clears all previous notifications and sets up new ones based on settings
 */
export const scheduleAllNotifications = async (
    notificationsEnabled: boolean,
    count: number,
    startTime: string,
    endTime: string,
    streakReminderEnabled: boolean
) => {
    try {
        // 1. Cancel ALL existing notifications to start fresh
        await Notifications.cancelAllScheduledNotificationsAsync();

        // 2. Schedule daily affirmations if enabled
        if (notificationsEnabled) {
            await scheduleDailyAffirmations(count, startTime, endTime, true);
        }

        // 3. Schedule streak reminder if enabled
        // Note: We schedule this regardless of main 'notificationsEnabled' toggle?
        // Usually streak reminders are separate, but let's assume they respect global setting OR their own
        // For now, let's make streak reminder independent of 'daily affirmations' toggle but dependent on its own
        if (streakReminderEnabled) {
            await scheduleStreakReminderInternal(true);
        }

        console.log('🔄 All notifications refreshed successfully');
    } catch (error) {
        console.error('❌ Error scheduling notifications:', error);
    }
};

// Deprecated: use scheduleAllNotifications instead
export const scheduleDailyNotifications = async (
    count: number,
    startTime: string,
    endTime: string,
    enabled: boolean
) => {
    // Forward to new function, assuming streak reminder is OFF to avoid side effects in legacy calls
    // But ideally we should migrate all calls to scheduleAllNotifications
    console.warn('scheduleDailyNotifications is deprecated.');
};

// Deprecated: use scheduleAllNotifications instead
export const scheduleStreakReminder = async (enabled: boolean) => {
    console.warn('scheduleStreakReminder is deprecated.');
};
