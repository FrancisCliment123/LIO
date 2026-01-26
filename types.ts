export enum ScreenName {
  WELCOME = 'WELCOME',
  NAME = 'NAME',
  AGE = 'AGE',
  INTERESTS = 'INTERESTS',
  STREAK = 'STREAK',
  MENTAL_HEALTH = 'MENTAL_HEALTH',
  NOTIFICATIONS = 'NOTIFICATIONS',
  GENDER = 'GENDER',
  HOME = 'HOME',
  CATEGORIES = 'CATEGORIES',
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
};