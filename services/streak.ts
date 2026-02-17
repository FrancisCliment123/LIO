import AsyncStorage from '@react-native-async-storage/async-storage';

const STREAK_KEY = '@lio_streak_data';

export interface StreakData {
    currentStreak: number;
    lastInteractionDate: string; // ISO date YYYY-MM-DD
    history: Record<string, boolean>; // Map of dates to completion status
}

export interface StreakResult {
    type: 'incremented' | 'already-done' | 'reset';
    currentStreak: number;
    isNewDay: boolean;
}

/**
 * Get today's date in YYYY-MM-DD format
 */
const getTodayDateString = (): string => {
    const now = new Date();
    return now.toISOString().split('T')[0];
};

/**
 * Get yesterday's date in YYYY-MM-DD format
 */
const getYesterdayDateString = (): string => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    return yesterday.toISOString().split('T')[0];
};

/**
 * Initialize or retrieve streak data
 */
const getStreakData = async (): Promise<StreakData> => {
    try {
        const data = await AsyncStorage.getItem(STREAK_KEY);
        if (data) {
            return JSON.parse(data);
        }
        // Initialize with default values
        return {
            currentStreak: 0,
            lastInteractionDate: '',
            history: {},
        };
    } catch (error) {
        console.error('Error loading streak data:', error);
        return {
            currentStreak: 0,
            lastInteractionDate: '',
            history: {},
        };
    }
};

/**
 * Save streak data to storage
 */
const saveStreakData = async (data: StreakData): Promise<void> => {
    try {
        await AsyncStorage.setItem(STREAK_KEY, JSON.stringify(data));
    } catch (error) {
        console.error('Error saving streak data:', error);
    }
};

/**
 * Get current streak information for display
 */
export const getStreak = async (): Promise<StreakData> => {
    return await getStreakData();
};

/**
 * Mark a user interaction (scroll action) and update streak accordingly
 * Returns information about what happened
 */
export const markInteraction = async (): Promise<StreakResult> => {
    const data = await getStreakData();
    const today = getTodayDateString();
    const yesterday = getYesterdayDateString();

    // Check if already logged today
    if (data.lastInteractionDate === today) {
        return {
            type: 'already-done',
            currentStreak: data.currentStreak,
            isNewDay: false,
        };
    }

    // Check if this is a continuation (yesterday was logged)
    if (data.lastInteractionDate === yesterday) {
        // Increment streak
        data.currentStreak += 1;
        data.lastInteractionDate = today;
        data.history[today] = true;
        await saveStreakData(data);

        return {
            type: 'incremented',
            currentStreak: data.currentStreak,
            isNewDay: true,
        };
    }

    // Streak was broken or first time
    data.currentStreak = 1;
    data.lastInteractionDate = today;
    data.history[today] = true;
    await saveStreakData(data);

    return {
        type: 'reset',
        currentStreak: 1,
        isNewDay: true,
    };
};

export interface MonthData {
    monthName: string;
    year: number;
    days: Array<{
        date: string;
        dayNumber: number;
        completed: boolean;
        isToday: boolean;
        isPadding: boolean;
    }>;
}

/**
 * Get the current week (Mon-Sun) data for display
 * Returns array of objects with date, day name, completion status, and future status
 */
export const getWeeklyStreak = async (): Promise<Array<{ date: string; day: string; completed: boolean; isToday: boolean; isFuture: boolean }>> => {
    const data = await getStreakData();
    const today = new Date();
    // Reset time to avoid timezone offset issues when manipulating dates
    const currentDay = today.getDay(); // 0 is Sunday, 1 is Monday

    // Calculate difference to get back to Monday
    // If Sunday (0), we need to go back 6 days.
    // If Monday (1), we go back 0 days.
    // If Tuesday (2), we go back 1 day.
    const daysToMonday = currentDay === 0 ? 6 : currentDay - 1;

    // Create new date object for Monday
    const monday = new Date(today);
    monday.setDate(today.getDate() - daysToMonday);

    const weekDays = ['Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sa', 'Do'];
    const result = [];

    // Helper to format YYYY-MM-DD in local time
    const formatDate = (d: Date) => {
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    const todayStr = formatDate(today);

    for (let i = 0; i < 7; i++) {
        const date = new Date(monday);
        date.setDate(monday.getDate() + i);
        const dateStr = formatDate(date);

        // Future check: simple string comparison works for ISO dates
        const isFuture = dateStr > todayStr;
        const isToday = dateStr === todayStr;

        result.push({
            date: dateStr,
            day: weekDays[i],
            completed: data.history[dateStr] || false,
            isToday: isToday,
            isFuture: isFuture
        });
    }

    return result;
};

/**
 * Get full streak history grouped by month
 */
export const getFullCalendar = async (): Promise<MonthData[]> => {
    const data = await getStreakData();
    const historyDates = Object.keys(data.history).sort();

    // Helper to format YYYY-MM-DD in local time
    const formatDate = (d: Date) => {
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    const generateMonthData = (baseDate: Date, history: Record<string, boolean>): MonthData => {
        const year = baseDate.getFullYear();
        const month = baseDate.getMonth();
        const firstDayOfMonth = new Date(year, month, 1);
        const lastDayOfMonth = new Date(year, month + 1, 0);

        const monthNames = [
            'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
            'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
        ];

        const today = new Date();
        const todayStr = formatDate(today);

        // Start day of week (0 = Sunday, 1 = Monday...)
        // We want 0 = Monday, 1 = Tuesday... 6 = Sunday
        let startDay = firstDayOfMonth.getDay();
        startDay = startDay === 0 ? 6 : startDay - 1;

        const days = [];

        // Padding for the start of the week
        for (let i = 0; i < startDay; i++) {
            days.push({
                date: '',
                dayNumber: 0,
                completed: false,
                isToday: false,
                isPadding: true
            });
        }

        // Days of the month
        for (let i = 1; i <= lastDayOfMonth.getDate(); i++) {
            const currentDay = new Date(year, month, i);
            const dateStr = formatDate(currentDay);
            days.push({
                date: dateStr,
                dayNumber: i,
                completed: history[dateStr] || false,
                isToday: dateStr === todayStr,
                isPadding: false
            });
        }

        return {
            monthName: monthNames[month],
            year: year,
            days: days
        };
    };

    const result: MonthData[] = [];
    const today = new Date();

    // Determine start month
    let startMonth: Date;
    if (historyDates.length > 0) {
        const firstDate = new Date(historyDates[0]);
        startMonth = new Date(firstDate.getFullYear(), firstDate.getMonth(), 1);
    } else {
        startMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    }

    // Generate from start month to today
    let current = new Date(startMonth);
    while (current <= today) {
        result.push(generateMonthData(new Date(current), data.history));
        current.setMonth(current.getMonth() + 1);
    }

    return result.reverse(); // Newest month first
};
