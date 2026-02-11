
import React, { useRef, useImperativeHandle, forwardRef } from 'react';
import { View, Text, StyleSheet, Image, Dimensions } from 'react-native';
import ViewShot from 'react-native-view-shot';
import { LinearGradient } from 'expo-linear-gradient';
import { useFonts } from '@expo-google-fonts/playwrite-nz-basic';

interface ShareCardProps {
    affirmation: string;
    author?: string;
    showLogo?: boolean;
    mode?: 'capture' | 'preview';
}

export interface ShareCardHandle {
    capture: () => Promise<string>;
}

// Fixed dimensions for 9:16 story format
const CARD_WIDTH = 1080;
const CARD_HEIGHT = 1920;

export const ShareCard = forwardRef<ShareCardHandle, ShareCardProps>(({ affirmation, author, showLogo = true, mode = 'capture' }, ref) => {
    const viewShotRef = useRef<ViewShot>(null);

    useImperativeHandle(ref, () => ({
        capture: async () => {
            // Capture the view
            if (viewShotRef.current && viewShotRef.current.capture) {
                return await viewShotRef.current.capture();
            }
            throw new Error("ViewShot ref is null");
        }
    }));

    const containerStyle = mode === 'preview' ? {
        width: CARD_WIDTH,
        height: CARD_HEIGHT,
    } : {
        position: 'absolute' as const,
        left: -CARD_WIDTH * 2,
        top: 0,
        width: CARD_WIDTH,
        height: CARD_HEIGHT,
        zIndex: -100,
    };

    return (
        <View
            style={containerStyle}
            collapsable={false} // Important for Android capture
        >
            <ViewShot
                ref={viewShotRef}
                options={{ format: "jpg", quality: 0.9, result: "tmpfile" }}
                style={{ width: CARD_WIDTH, height: CARD_HEIGHT, backgroundColor: '#0f172a' }}
            >
                <View style={styles.contentContainer}>
                    {/* Main Content */}
                    <View style={styles.centerContent}>
                        <View style={styles.quoteIconContainer}>
                            <Text style={styles.quoteIcon}>"</Text>
                        </View>

                        <Text style={styles.text}>
                            {affirmation}
                        </Text>
                    </View>

                    {/* Footer with Logo - Bottom Left */}
                    {showLogo && (
                        <View style={styles.logoContainer}>
                            <Image
                                source={require('../assets/frames/lio-logoalone.png')}
                                style={styles.logo}
                            />
                        </View>
                    )}
                </View>
            </ViewShot>
        </View>
    );
});

const styles = StyleSheet.create({
    contentContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 80,
    },
    centerContent: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        width: '100%',
    },
    quoteIconContainer: {
        marginBottom: 40,
        opacity: 0.3,
    },
    quoteIcon: {
        fontSize: 120,
        color: '#FFFFFF',
        fontFamily: 'System',
    },
    text: {
        fontSize: 64, // Large text for story
        color: '#FFFFFF',
        textAlign: 'center',
        fontWeight: '600',
        lineHeight: 84,
        letterSpacing: 1,
        fontFamily: 'System',
    },
    logoContainer: {
        position: 'absolute',
        bottom: 60,
        left: 60,
    },
    logo: {
        width: 100,
        height: 100,
        resizeMode: 'contain',
        opacity: 0.9,
    },
});
