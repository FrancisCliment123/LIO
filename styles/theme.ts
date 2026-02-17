export type ThemeType = 'dark' | 'light';

export interface ThemeColors {
    background: {
        primary: string[];
        locations: number[];
    };
    text: {
        primary: string;
        secondary: string;
        accent: string;
    };
    card: {
        background: string;
        border: string;
        shadow: string;
    };
    particles: {
        color: string;
        opacity: number;
    };
}

export const DarkTheme: ThemeColors = {
    background: {
        primary: ['#0a0d1f', '#1a1535', '#0f1a3d', '#0a0d1f'],
        locations: [0, 0.3, 0.7, 1],
    },
    text: {
        primary: '#FFFFFF',
        secondary: 'rgba(255, 255, 255, 0.7)',
        accent: '#A78BFA',
    },
    card: {
        background: 'rgba(255, 255, 255, 0.08)',
        border: 'rgba(255, 255, 255, 0.15)',
        shadow: 'transparent', // Dark mode relies on glow/overlays usually
    },
    particles: {
        color: '#FFFFFF',
        opacity: 0.8,
    },
};

export const LightTheme: ThemeColors = {
    background: {
        // Soft Lavender -> Misty Blue -> Warm White
        primary: ['#F3E8FF', '#E0F2FE', '#FFF7ED', '#F3E8FF'],
        locations: [0, 0.3, 0.7, 1],
    },
    text: {
        primary: '#1E1B4B', // Deep Indigo for contrast
        secondary: '#475569', // Slate 600
        accent: '#7C3AED', // Primary Purple
    },
    card: {
        background: 'rgba(255, 255, 255, 0.65)',
        border: 'rgba(255, 255, 255, 0.4)',
        shadow: 'rgba(124, 58, 237, 0.15)', // Soft purple shadow
    },
    particles: {
        color: '#7C3AED', // Purple particles for light mode
        opacity: 0.4,
    },
};

export const getTheme = (type: ThemeType): ThemeColors => {
    return type === 'light' ? LightTheme : DarkTheme;
};
