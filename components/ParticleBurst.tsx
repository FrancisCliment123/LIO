import React, { useEffect, useRef, useState } from 'react';
import { View, StyleSheet, Animated, Easing } from 'react-native';

interface ParticleBurstProps {
    trigger: boolean;
    x?: number;
    y?: number;
    color?: string;
    particleCount?: number;
}

export const ParticleBurst: React.FC<ParticleBurstProps> = ({
    trigger,
    x = 0,
    y = 0,
    color = '#af25f4',
    particleCount = 12
}) => {
    const [particles, setParticles] = useState<number[]>([]);

    // Generate unique ID for each burst to force re-render/reset
    useEffect(() => {
        if (trigger) {
            setParticles(Array.from({ length: particleCount }, (_, i) => i));
        }
    }, [trigger, particleCount]);

    if (!trigger || particles.length === 0) return null;

    return (
        <View style={[styles.container, { left: x, top: y }]} pointerEvents="none">
            {particles.map((_, index) => (
                <SingleParticle key={`${trigger}-${index}`} index={index} total={particleCount} color={color} />
            ))}
        </View>
    );
};

const SingleParticle = ({ index, total, color }: { index: number, total: number, color: string }) => {
    const anim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.timing(anim, {
            toValue: 1,
            duration: 800 + Math.random() * 400,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: true,
        }).start();
    }, []);

    // Calculate random angle and distance for explosion
    // Distribute somewhat evenly but with randomness
    const angleBase = (index / total) * 2 * Math.PI;
    const angle = angleBase + (Math.random() * 0.5 - 0.25);
    const distance = 40 + Math.random() * 40;

    const translateX = anim.interpolate({
        inputRange: [0, 1],
        outputRange: [0, Math.cos(angle) * distance]
    });

    const translateY = anim.interpolate({
        inputRange: [0, 1],
        outputRange: [0, Math.sin(angle) * distance]
    });

    const opacity = anim.interpolate({
        inputRange: [0, 0.7, 1],
        outputRange: [1, 0.8, 0]
    });

    const scale = anim.interpolate({
        inputRange: [0, 0.5, 1],
        outputRange: [0.5, 1, 0]
    });

    return (
        <Animated.View
            style={[
                styles.particle,
                {
                    backgroundColor: color,
                    transform: [
                        { translateX },
                        { translateY },
                        { scale }
                    ],
                    opacity
                }
            ]}
        />
    );
};

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        width: 0,
        height: 0,
        zIndex: 20,
        alignItems: 'center',
        justifyContent: 'center',
    },
    particle: {
        position: 'absolute',
        width: 6,
        height: 6,
        borderRadius: 3,
    }
});
