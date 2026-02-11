import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

interface SwipeIndicatorProps {
    visible: boolean;
}

export const SwipeIndicator: React.FC<SwipeIndicatorProps> = ({ visible }) => {
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const bounceAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        if (visible) {
            // Fade in
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 500,
                useNativeDriver: true,
            }).start();

            // Continuous bounce loop
            const bounceLoop = Animated.loop(
                Animated.sequence([
                    Animated.timing(bounceAnim, {
                        toValue: -15, // Move up
                        duration: 1000,
                        useNativeDriver: true,
                    }),
                    Animated.timing(bounceAnim, {
                        toValue: 0, // Move down
                        duration: 1000,
                        useNativeDriver: true,
                    }),
                ])
            );
            bounceLoop.start();

            return () => bounceLoop.stop();
        } else {
            // Fade out
            Animated.timing(fadeAnim, {
                toValue: 0,
                duration: 300,
                useNativeDriver: true,
            }).start();
        }
    }, [visible]);

    if (!visible) return null;

    return (
        <Animated.View
            style={[
                styles.container,
                {
                    opacity: fadeAnim,
                    transform: [{ translateY: bounceAnim }]
                }
            ]}
            pointerEvents="none" // Pass touches through
        >
            <MaterialIcons name="keyboard-arrow-up" size={32} color="rgba(255, 255, 255, 0.8)" />
            <Text style={styles.text}>Desliza hacia arriba</Text>
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        bottom: 40,
        left: 0,
        right: 0,
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 50,
    },
    text: {
        color: 'rgba(255, 255, 255, 0.8)',
        fontSize: 14,
        marginTop: 4,
        fontWeight: '500',
        letterSpacing: 0.5,
        textShadowColor: 'rgba(0, 0, 0, 0.3)',
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 2,
    },
});
