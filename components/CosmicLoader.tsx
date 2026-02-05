import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Easing } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

export const CosmicLoader = () => {
    // Independent animations for three stars to create a sparkling effect
    const star1Anim = useRef(new Animated.Value(0)).current;
    const star2Anim = useRef(new Animated.Value(0)).current;
    const star3Anim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        const createSparkle = (anim: Animated.Value, delay: number) => {
            return Animated.loop(
                Animated.sequence([
                    Animated.delay(delay),
                    Animated.timing(anim, {
                        toValue: 1,
                        duration: 1000,
                        easing: Easing.inOut(Easing.ease),
                        useNativeDriver: true,
                    }),
                    Animated.timing(anim, {
                        toValue: 0.3,
                        duration: 1000,
                        easing: Easing.inOut(Easing.ease),
                        useNativeDriver: true,
                    }),
                ])
            );
        };

        const sparkle1 = createSparkle(star1Anim, 0);
        const sparkle2 = createSparkle(star2Anim, 500); // Offset for asynchronous twinkling
        const sparkle3 = createSparkle(star3Anim, 1000);

        sparkle1.start();
        sparkle2.start();
        sparkle3.start();

        return () => {
            sparkle1.stop();
            sparkle2.stop();
            sparkle3.stop();
        };
    }, []);

    return (
        <View style={styles.container}>
            {/* Sparkles Container */}
            <View style={styles.starsContainer}>
                {/* Main Star */}
                <Animated.View style={{ opacity: star1Anim, transform: [{ scale: star1Anim }] }}>
                    <MaterialIcons name="star-rate" size={48} color="#d8b4fe" style={styles.star} />
                </Animated.View>

                {/* Secondary Star - Top Right */}
                <Animated.View style={[styles.secondaryStar, { top: -10, right: -20, opacity: star2Anim, transform: [{ scale: star2Anim }] }]}>
                    <MaterialIcons name="star-rate" size={24} color="#e9d5ff" />
                </Animated.View>

                {/* Tertiary Star - Bottom Left */}
                <Animated.View style={[styles.secondaryStar, { bottom: -5, left: -15, opacity: star3Anim, transform: [{ scale: star3Anim }] }]}>
                    <MaterialIcons name="star-rate" size={18} color="#c084fc" />
                </Animated.View>
            </View>

            <Text style={styles.text}>Conectando con el universo...</Text>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        justifyContent: 'center',
        alignItems: 'center',
        flex: 1,
        minHeight: 300,
    },
    starsContainer: {
        width: 60,
        height: 60,
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative',
    },
    star: {
        shadowColor: "#d8b4fe",
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.8,
        shadowRadius: 10,
    },
    secondaryStar: {
        position: 'absolute',
    },
    text: {
        color: '#E9D5FF',
        marginTop: 30,
        fontSize: 16,
        fontWeight: '500',
        letterSpacing: 0.5,
        opacity: 0.9,
    }
});
