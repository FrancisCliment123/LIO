import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Easing } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

export const PulsingHeart = () => {
    const shimmerAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        const shimmer = Animated.loop(
            Animated.sequence([
                Animated.timing(shimmerAnim, {
                    toValue: 1,
                    duration: 2500,
                    easing: Easing.inOut(Easing.ease),
                    useNativeDriver: false, // shadowOpacity requires false
                }),
                Animated.timing(shimmerAnim, {
                    toValue: 0,
                    duration: 2500,
                    easing: Easing.inOut(Easing.ease),
                    useNativeDriver: false,
                }),
            ])
        );

        shimmer.start();

        return () => {
            shimmer.stop();
        };
    }, []);

    const shadowOpacity = shimmerAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [0.2, 0.8]
    });

    return (
        <View style={styles.container}>
            {/* Base Outline Heart */}
            <Animated.View style={[
                styles.heartWrapper,
                {
                    shadowOpacity,
                    shadowColor: "#af25f4",
                    shadowOffset: { width: 0, height: 0 },
                    shadowRadius: 15,
                }
            ]}>
                <MaterialIcons
                    name="favorite-border"
                    size={80}
                    color="rgba(175, 37, 244, 0.6)"
                />
            </Animated.View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
    },
    heartWrapper: {
        // Shadow properties are animated
    },
});
