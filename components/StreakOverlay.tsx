import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, Animated, Dimensions } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';

interface StreakOverlayProps {
    visible: boolean;
    streakCount: number;
    weeklyData: Array<{ date: string; day: string; completed: boolean; isToday: boolean; isFuture: boolean }>;
    onClose: () => void;
}

const { width } = Dimensions.get('window');

export const StreakOverlay: React.FC<StreakOverlayProps> = ({
    visible,
    streakCount,
    weeklyData,
    onClose,
}) => {
    const insets = useSafeAreaInsets();
    const slideAnim = useRef(new Animated.Value(-150)).current; // Start off-screen top
    const opacityAnim = useRef(new Animated.Value(0)).current;
    const checkScaleAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        if (visible) {
            // 1. Slide Down & Fade In
            Animated.parallel([
                Animated.spring(slideAnim, {
                    toValue: 0,
                    friction: 8,
                    tension: 40,
                    useNativeDriver: true,
                }),
                Animated.timing(opacityAnim, {
                    toValue: 1,
                    duration: 300,
                    useNativeDriver: true,
                }),
            ]).start();

            // 2. Animate Checkmark & Haptics after delay
            setTimeout(() => {
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                Animated.spring(checkScaleAnim, {
                    toValue: 1,
                    friction: 5,
                    tension: 100,
                    useNativeDriver: true,
                }).start();
            }, 500);

            // 3. Auto-dismiss after 3 seconds
            const autoDismissTimer = setTimeout(() => {
                onClose();
            }, 3000);

            // Cleanup timer when component unmounts or visibility changes
            return () => {
                clearTimeout(autoDismissTimer);
            };

        } else {
            // Reset animations when hidden
            slideAnim.setValue(-150);
            opacityAnim.setValue(0);
            checkScaleAnim.setValue(0);
        }
    }, [visible]);

    if (!visible) return null;

    return (
        // Non-blocking absolute view
        <View style={[styles.wrapper, { paddingTop: insets.top + 10 }]} pointerEvents="box-none">
            <Animated.View style={[
                styles.card,
                {
                    opacity: opacityAnim,
                    transform: [{ translateY: slideAnim }]
                }
            ]}>
                <View style={styles.headerRow}>
                    <Text style={styles.title}>¡Racha Actualizada!</Text>
                    <TouchableOpacity onPress={onClose} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                        <MaterialIcons name="close" size={20} color="rgba(255,255,255,0.5)" />
                    </TouchableOpacity>
                </View>

                {/* Compact Stats Card */}
                <View style={styles.statsCard}>
                    <View style={styles.statsHeader}>
                        <View>
                            <Text style={styles.statsBigNumber}>{streakCount}</Text>
                            <Text style={styles.statsLabel}>{streakCount === 1 ? 'DÍA' : 'DÍAS'}</Text>
                        </View>

                        <View style={styles.daysRow}>
                            {weeklyData.map((dayData, index) => {
                                const isToday = dayData.isToday;
                                const active = dayData.completed;
                                // Dim if not active AND not today (so today is always visible)
                                const shouldDim = !active && !isToday;

                                return (
                                    <View key={index} style={[styles.dayCol, shouldDim && { opacity: 0.4 }]}>
                                        <Text style={[
                                            styles.dayText,
                                            dayData.isToday && { color: '#A78BFA', fontWeight: 'bold' }
                                        ]}>{dayData.day}</Text>

                                        <View style={[
                                            styles.dayCircle,
                                            (active && !isToday) ? styles.dayCircleActive : styles.dayCircleInactive,
                                        ]}>
                                            {/* Previous days */}
                                            {(active && !isToday) && (
                                                <MaterialIcons name="check" size={12} color="#FFF" />
                                            )}

                                            {/* Today's animated check */}
                                            {isToday && (
                                                <Animated.View style={[
                                                    styles.dayCircleActive,
                                                    styles.absoluteFill,
                                                    { transform: [{ scale: checkScaleAnim }] }
                                                ]}>
                                                    <MaterialIcons name="check" size={12} color="#FFF" />
                                                </Animated.View>
                                            )}
                                        </View>
                                    </View>
                                );
                            })}
                        </View>
                    </View>
                </View>
            </Animated.View>
        </View>
    );
};

const styles = StyleSheet.create({
    wrapper: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 100, // Above everything
        alignItems: 'center',
        paddingHorizontal: 16,
    },
    card: {
        width: '100%',
        backgroundColor: 'rgba(30, 27, 75, 0.95)', // Slightly transparent dark blue
        borderRadius: 20,
        padding: 16,
        borderWidth: 1,
        borderColor: 'rgba(139, 92, 246, 0.3)', // Purple border
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 10,
    },
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    title: {
        fontSize: 16,
        fontWeight: 'bold',
        color: 'white',
    },
    // Stats Card Styles (Compact)
    statsCard: {
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        borderRadius: 16,
        padding: 12,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.05)',
    },
    statsHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    statsBigNumber: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#A78BFA',
    },
    statsLabel: {
        fontSize: 10,
        fontWeight: '600',
        color: '#A78BFA',
        letterSpacing: 1,
    },
    daysRow: {
        flexDirection: 'row',
        gap: 4,
    },
    dayCol: {
        alignItems: 'center',
        gap: 3,
    },
    dayText: {
        fontSize: 8,
        color: '#FFF',
        textTransform: 'uppercase',
    },
    dayCircle: {
        width: 20,
        height: 20,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
    },
    dayCircleActive: {
        backgroundColor: '#8B5CF6',
        alignItems: 'center',
        justifyContent: 'center',
    },
    dayCircleInactive: {
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
    },
    absoluteFill: {
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
    }
});
