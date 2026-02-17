export enum ScreenName {
  WELCOME = 'WELCOME',
  NAME = 'NAME',
  AGE = 'AGE',
  INTERESTS = 'INTERESTS',
  STREAK = 'STREAK',
  MENTAL_HEALTH = 'MENTAL_HEALTH',
  BENEFITS = 'BENEFITS',
  NOTIFICATIONS = 'NOTIFICATIONS',
  GENDER = 'GENDER',
  WIDGET = 'WIDGET',
  HOME = 'HOME',
  CATEGORIES = 'CATEGORIES',
  FAVORITES = 'FAVORITES',
  PROFILE = 'PROFILE',
  SUBSCRIPTION = 'SUBSCRIPTION',
  CUSTOM_MIX = 'CUSTOM_MIX',
  MY_PHRASES = 'MY_PHRASES',
}

export interface OnboardingData {
  interests: string[];
  ageRange: string;
  mentalHealthHabits: string[];
  name: string;
  notificationCount: number;
  startTime: string;
  endTime: string;
  gender: string;
  notificationsEnabled: boolean;
  streakReminderEnabled: boolean;
}

export const INITIAL_DATA: OnboardingData = {
  interests: [],
  ageRange: '',
  mentalHealthHabits: [],
  name: '',
  notificationCount: 10,
  startTime: '9:00',
  endTime: '22:00',
  gender: '',
  notificationsEnabled: true,
  streakReminderEnabled: true,
};