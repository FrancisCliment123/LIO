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

// Helper to update the widget
export const updateWidget = (affirmation: string) => {
    // TEMPORARY DISABLE: To fix crash on Home load
    return;

    if (Platform.OS === 'ios') {
        try {
            const { ExtensionStorage } = require('@bacons/apple-targets');
            const widgetStorage = new ExtensionStorage('group.com.cisfransorganization.lio');
            widgetStorage.set('current_affirmation', affirmation);

            // Safety check: reloadWidget is only available in development builds
            if (typeof widgetStorage.reloadWidget === 'function') {
                widgetStorage.reloadWidget('LioWidget');
            } else {
                console.log('Widget reload skipped: Not supported in Expo Go.');
            }
        } catch (e) {
            console.log('Error updating widget:', e);
        }
    }
};

// Function to schedule daily notifications based on user settings
export const scheduleDailyNotifications = async (
    count: number,
    startTime: string,
    endTime: string,
    enabled: boolean
) => {
    // 1. Cancel all existing notifications
    await Notifications.cancelAllScheduledNotificationsAsync();

    if (!enabled || count <= 0) {
        console.log('Notifications disabled or count is 0');
        return;
    }

    // 2. Parse times (Assume "H:MM" format)
    const [startH] = startTime.split(':').map(Number);
    const [endH] = endTime.split(':').map(Number);

    // 3. Simple scheduling: Spread 'count' notifications across the interval
    // For simplicity, we'll schedule for the next 48 hours to ensure gap-free coverage
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
    console.log(`✅ Scheduled ${count} daily notifications between ${startTime} and ${endTime}`);
};

// Function to schedule a streak reminder
export const scheduleStreakReminder = async (enabled: boolean) => {
    // We can use a specific identifier or just rely on cancelAll if we always re-run both
    // But better to manage it. For now, we'll use cancelAll in the main scheduler.
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
};

// Function to trigger a local test notification immediately (good for simulators/testing UI)
export const scheduleTestNotification = async () => {
    const affirmation = getRandomAffirmation();
    updateWidget(affirmation);

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
