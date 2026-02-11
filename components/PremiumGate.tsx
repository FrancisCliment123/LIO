import React, { ReactNode } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

interface PremiumGateProps {
    children: ReactNode;
    isPremium: boolean;
    onUnlockPress: () => void;
    featureName?: string;
}

/**
 * Premium Gate Component
 * Wraps premium features and shows a lock overlay for non-premium users
 */
export const PremiumGate: React.FC<PremiumGateProps> = ({
    children,
    isPremium,
    onUnlockPress,
    featureName = 'esta función',
}) => {
    if (isPremium) {
        return <>{children}</>;
    }

    return (
        <View style={styles.container}>
            {/* Blurred content */}
            <View style={styles.blurredContent}>
                {children}
            </View>

            {/* Lock Overlay */}
            <View style={styles.lockOverlay}>
                <LinearGradient
                    colors={['rgba(0, 0, 0, 0.85)', 'rgba(0, 0, 0, 0.95)']}
                    style={styles.lockGradient}
                >
                    <View style={styles.lockIconContainer}>
                        <View style={styles.lockIconBg}>
                            <MaterialIcons name="lock" size={40} color="#FFD700" />
                        </View>
                    </View>

                    <Text style={styles.lockTitle}>Función Premium</Text>
                    <Text style={styles.lockSubtitle}>
                        Desbloquea {featureName} con Lio +
                    </Text>

                    <TouchableOpacity
                        style={styles.unlockButton}
                        onPress={onUnlockPress}
                        activeOpacity={0.8}
                    >
                        <LinearGradient
                            colors={['#FFD700', '#FFA500']}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                            style={styles.unlockButtonGradient}
                        >
                            <Image
                                source={require('../assets/frames/lio-logoalone.png')}
                                style={{ width: 20, height: 20, resizeMode: 'contain' }}
                            />
                            <Text style={styles.unlockButtonText}>Desbloquear Lio +</Text>
                        </LinearGradient>
                    </TouchableOpacity>

                    <View style={styles.premiumBadge}>
                        <MaterialIcons name="check-circle" size={16} color="#A78BFA" />
                        <Text style={styles.premiumBadgeText}>Acceso ilimitado a todas las funciones</Text>
                    </View>
                </LinearGradient>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        position: 'relative',
        overflow: 'hidden',
    },
    blurredContent: {
        opacity: 0.3,
    },
    lockOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 100,
    },
    lockGradient: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
    },
    lockIconContainer: {
        marginBottom: 20,
    },
    lockIconBg: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: 'rgba(255, 215, 0, 0.1)',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 2,
        borderColor: 'rgba(255, 215, 0, 0.3)',
    },
    lockTitle: {
        fontSize: 24,
        fontWeight: '700',
        color: '#FFFFFF',
        marginBottom: 8,
        textAlign: 'center',
    },
    lockSubtitle: {
        fontSize: 16,
        color: 'rgba(255, 255, 255, 0.7)',
        marginBottom: 32,
        textAlign: 'center',
        lineHeight: 24,
    },
    unlockButton: {
        borderRadius: 24,
        overflow: 'hidden',
        shadowColor: '#FFD700',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.5,
        shadowRadius: 12,
        elevation: 8,
        marginBottom: 16,
    },
    unlockButtonGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 16,
        paddingHorizontal: 32,
        gap: 8,
    },
    unlockButtonText: {
        color: '#000000',
        fontSize: 16,
        fontWeight: '700',
    },
    premiumBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    premiumBadgeText: {
        color: '#A78BFA',
        fontSize: 12,
        fontWeight: '500',
    },
});
