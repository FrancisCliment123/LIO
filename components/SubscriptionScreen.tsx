import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator, Alert, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';
import { CinematicBackground } from './CinematicBackground';
import { checkPremiumStatus, getOfferings, purchasePackage, restorePurchases, getProductInfo } from '../services/revenuecat';
import { PurchasesPackage } from 'react-native-purchases';
import RevenueCatUI, { PAYWALL_RESULT } from 'react-native-purchases-ui';

interface SubscriptionScreenProps {
    onBack: () => void;
    onPurchaseComplete?: () => void;
}

export const SubscriptionScreen: React.FC<SubscriptionScreenProps> = ({ onBack, onPurchaseComplete }) => {
    const [loading, setLoading] = useState(true);
    const [purchasing, setPurchasing] = useState(false);
    const [restoring, setRestoring] = useState(false);
    const [currentOffering, setCurrentOffering] = useState<any>(null);
    const [isPremium, setIsPremium] = useState(false);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            // Check if already premium
            const status = await checkPremiumStatus();
            setIsPremium(status.isPremium);

            // If not premium, load offerings
            if (!status.isPremium) {
                const offering = await getOfferings();
                setCurrentOffering(offering);
            }
        } catch (error) {
            console.error('Failed to load subscription data:', error);
            Alert.alert('Error', 'Failed to load subscription options');
        } finally {
            setLoading(false);
        }
    };

    const handlePurchase = async (pkg: PurchasesPackage) => {
        setPurchasing(true);
        try {
            const result = await purchasePackage(pkg);

            if (result.success) {
                Alert.alert(
                    '🎉 ¡Bienvenido a Lio +!',
                    'Ahora tienes acceso a todas las funciones premium',
                    [
                        {
                            text: 'Continuar',
                            onPress: () => {
                                onPurchaseComplete?.();
                                onBack();
                            },
                        },
                    ]
                );
            } else if (result.error && result.error !== 'Purchase cancelled') {
                Alert.alert('Error', result.error);
            }
        } catch (error: any) {
            Alert.alert('Error', error.message || 'Failed to complete purchase');
        } finally {
            setPurchasing(false);
        }
    };

    const handleRestore = async () => {
        setRestoring(true);
        try {
            const result = await restorePurchases();

            if (result.isPremium) {
                Alert.alert(
                    '✅ Compras restauradas',
                    'Tu suscripción premium ha sido restaurada',
                    [
                        {
                            text: 'OK',
                            onPress: () => {
                                onPurchaseComplete?.();
                                onBack();
                            },
                        },
                    ]
                );
            } else {
                Alert.alert('No se encontraron compras', 'No tienes suscripciones activas para restaurar');
            }
        } catch (error) {
            Alert.alert('Error', 'No se pudieron restaurar las compras');
        } finally {
            setRestoring(false);
        }
    };

    const presentPaywall = async (): Promise<boolean> => {
        try {
            // Check if we have a current offering loaded
            if (currentOffering) {
                console.log('Presenting paywall for offering:', currentOffering.identifier);
                const paywallResult: PAYWALL_RESULT = await RevenueCatUI.presentPaywall({
                    offering: currentOffering
                });

                return handlePaywallResult(paywallResult);
            } else {
                console.log('Presenting default paywall (no offering loaded)');
                const paywallResult: PAYWALL_RESULT = await RevenueCatUI.presentPaywall();
                return handlePaywallResult(paywallResult);
            }
        } catch (error) {
            console.error('Paywall error:', error);
            return false;
        }
    };

    const handlePaywallResult = (paywallResult: PAYWALL_RESULT): boolean => {
        switch (paywallResult) {
            case PAYWALL_RESULT.NOT_PRESENTED:
            case PAYWALL_RESULT.ERROR:
            case PAYWALL_RESULT.CANCELLED:
                return false;
            case PAYWALL_RESULT.PURCHASED:
            case PAYWALL_RESULT.RESTORED:
                onPurchaseComplete?.();
                onBack();
                return true;
            default:
                return false;
        }
    };

    const presentPaywallIfNeeded = async (): Promise<boolean> => {
        try {
            let paywallResult: PAYWALL_RESULT;

            if (currentOffering) {
                console.log('Presenting paywall if needed for offering:', currentOffering.identifier);
                paywallResult = await RevenueCatUI.presentPaywallIfNeeded({
                    offering: currentOffering,
                    requiredEntitlementIdentifier: "Lio +"
                });
            } else {
                paywallResult = await RevenueCatUI.presentPaywallIfNeeded({
                    requiredEntitlementIdentifier: "Lio +"
                });
            }

            return handlePaywallResult(paywallResult);
        } catch (error) {
            console.error('Paywall error:', error);
            return false;
        }
    };

    if (loading) {
        return (
            <View style={styles.container}>
                <CinematicBackground />
                <SafeAreaView style={styles.safeArea}>
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator size="large" color="#A78BFA" />
                        <Text style={styles.loadingText}>Cargando...</Text>
                    </View>
                </SafeAreaView>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <CinematicBackground />

            <SafeAreaView style={styles.safeArea}>
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={onBack} style={styles.backButton}>
                        <MaterialIcons name="arrow-back" size={24} color="#FFFFFF" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Lio +</Text>
                    <View style={{ width: 40 }} />
                </View>

                <ScrollView
                    style={styles.content}
                    contentContainerStyle={styles.contentContainer}
                    showsVerticalScrollIndicator={false}
                >
                    {/* Premium Badge */}
                    <View style={styles.premiumBadge}>
                        <LinearGradient
                            colors={['#7C3AED', '#C084FC']}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                            style={[styles.premiumBadgeGradient, { padding: 10 }]}
                        >
                            <Image
                                source={require('../assets/frames/lio-logoalone.png')}
                                style={{ width: 60, height: 60, resizeMode: 'contain' }}
                            />
                        </LinearGradient>
                    </View>

                    {/* Title */}
                    <Text style={styles.title}>Desbloquea todo el potencial de Lio</Text>
                    <Text style={styles.subtitle}>
                        Accede a todas las funciones premium y transforma tu vida
                    </Text>

                    {/* Features List */}
                    <View style={styles.featuresContainer}>
                        {[
                            { icon: 'psychology', text: 'Categorías premium de afirmaciones' },
                            { icon: 'spa', text: 'Mindfulness y meditaciones guiadas' },
                            { icon: 'favorite', text: 'Afirmaciones ilimitadas' },
                            { icon: 'auto-awesome', text: 'Widgets personalizados' },
                            { icon: 'insights', text: 'Estadísticas y análisis de progreso' },
                            { icon: 'cloud-off', text: 'Sin anuncios' },
                        ].map((feature, index) => (
                            <View key={index} style={styles.featureRow}>
                                <View style={styles.featureIcon}>
                                    <MaterialIcons name={feature.icon as any} size={24} color="#A78BFA" />
                                </View>
                                <Text style={styles.featureText}>{feature.text}</Text>
                            </View>
                        ))}
                    </View>

                    {/* Use RevenueCat Paywall or Custom Plans */}
                    <TouchableOpacity
                        style={styles.paywallButton}
                        onPress={presentPaywall}
                        disabled={purchasing}
                    >
                        <LinearGradient
                            colors={['#7C3AED', '#A78BFA']}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                            style={styles.paywallButtonGradient}
                        >
                            {purchasing ? (
                                <ActivityIndicator color="#FFFFFF" />
                            ) : (
                                <Text style={styles.paywallButtonText}>Ver planes</Text>
                            )}
                        </LinearGradient>
                    </TouchableOpacity>

                    {/* Restore Purchases */}
                    <TouchableOpacity
                        onPress={handleRestore}
                        style={styles.restoreButton}
                        disabled={restoring}
                    >
                        {restoring ? (
                            <ActivityIndicator size="small" color="#A78BFA" />
                        ) : (
                            <Text style={styles.restoreText}>Restaurar compras</Text>
                        )}
                    </TouchableOpacity>

                    {/* Terms */}
                    <Text style={styles.termsText}>
                        Al suscribirte, aceptas los términos del servicio.{'\n'}
                        Las suscripciones se renuevan automáticamente.
                    </Text>
                </ScrollView>
            </SafeAreaView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000000',
    },
    safeArea: {
        flex: 1,
        zIndex: 10,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        color: '#FFFFFF',
        fontSize: 16,
        marginTop: 16,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingTop: 16,
        paddingBottom: 16,
    },
    backButton: {
        width: 40,
        height: 40,
        alignItems: 'center',
        justifyContent: 'center',
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: '#FFFFFF',
    },
    content: {
        flex: 1,
    },
    contentContainer: {
        paddingHorizontal: 24,
        paddingBottom: 40,
    },
    premiumBadge: {
        alignSelf: 'center',
        marginTop: 20,
        marginBottom: 24,
    },
    premiumBadgeGradient: {
        width: 96,
        height: 96,
        borderRadius: 48,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#FFD700',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.6,
        shadowRadius: 16,
        elevation: 12,
    },
    title: {
        fontSize: 28,
        fontWeight: '700',
        color: '#FFFFFF',
        textAlign: 'center',
        marginBottom: 12,
        lineHeight: 36,
    },
    subtitle: {
        fontSize: 16,
        color: 'rgba(255, 255, 255, 0.7)',
        textAlign: 'center',
        marginBottom: 32,
        lineHeight: 24,
    },
    featuresContainer: {
        width: '100%',
        marginBottom: 32,
    },
    featureRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
    },
    featureIcon: {
        width: 48,
        height: 48,
        borderRadius: 12,
        backgroundColor: 'rgba(167, 139, 250, 0.1)',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 16,
    },
    featureText: {
        flex: 1,
        fontSize: 16,
        color: '#FFFFFF',
        fontWeight: '500',
    },
    paywallButton: {
        width: '100%',
        borderRadius: 24,
        overflow: 'hidden',
        marginBottom: 16,
        shadowColor: '#7C3AED',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.4,
        shadowRadius: 12,
        elevation: 8,
    },
    paywallButtonGradient: {
        paddingVertical: 18,
        alignItems: 'center',
        justifyContent: 'center',
    },
    paywallButtonText: {
        color: '#FFFFFF',
        fontSize: 18,
        fontWeight: '700',
    },
    restoreButton: {
        paddingVertical: 12,
        alignItems: 'center',
        marginBottom: 24,
    },
    restoreText: {
        color: '#A78BFA',
        fontSize: 16,
        fontWeight: '600',
    },
    termsText: {
        fontSize: 12,
        color: 'rgba(255, 255, 255, 0.5)',
        textAlign: 'center',
        lineHeight: 18,
    },
});
