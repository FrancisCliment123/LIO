import React, { useState, useEffect } from 'react';
import Purchases, { CustomerInfo } from 'react-native-purchases';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import { CinematicBackground } from './CinematicBackground';
import { checkPremiumStatus } from '../services/revenuecat';

const { width } = Dimensions.get('window');
const GAP = 12;
const PADDING = 20;
const ITEM_WIDTH = (width - (PADDING * 2) - (GAP * 2)) / 3;

interface CustomMixScreenProps {
    onBack: () => void;
    onNavigate?: (screen: string) => void;
    onMixCreated?: (categories: string[]) => void;
    initialSelection?: string[];
}


interface MixCategory {
    id: string;
    title: string;
    icon: keyof typeof MaterialIcons.glyphMap;
    // Removed isPremium flag since all are accessible in Custom Mix
    color?: string;
    fullWidthText?: boolean;
}

const CategoryCard: React.FC<{
    title: string;
    icon: keyof typeof MaterialIcons.glyphMap;
    // Removed isPremium flag since all are accessible in Custom Mix
    color?: string;
    fullWidthText?: boolean;
    onPress?: () => void;
    isActive?: boolean;
}> = ({ title, icon, color = '#af25f4', fullWidthText, onPress, isActive }) => (
    <TouchableOpacity
        style={[
            styles.gridItem,
            isActive && {
                borderColor: '#d946ef', // Brighter fuchsia/purple
                borderWidth: 2,         // Thicker border
                backgroundColor: 'rgba(147, 51, 234, 0.5)', // More visible background tint
                shadowColor: '#d946ef',
                shadowOffset: { width: 0, height: 0 },
                shadowOpacity: 0.8,     // Increased glow
                shadowRadius: 15,       // Larger glow radius
                transform: [{ scale: 1.05 }], // Increased pop effect
                zIndex: 10, // Bring to front
            }
        ]}
        onPress={onPress}
        activeOpacity={0.7}
    >
        {isActive && (
            <View style={styles.checkBadge} pointerEvents="none">
                <MaterialIcons name="check" size={14} color="#FFF" />
            </View>
        )}
        <View style={styles.gridItemContent} pointerEvents="none">
            <View style={styles.gridIconContainer}>
                <MaterialIcons name={icon} size={28} color={isActive ? '#FFF' : color} />
            </View>

            <Text style={[styles.gridTitle, fullWidthText && { width: '100%' }]} numberOfLines={2}>
                {title}
            </Text>
        </View>
    </TouchableOpacity>
);

// Define all available categories
// Note: All categories are unlocked in Custom Mix since only premium users can access this screen
// Removed isPremium flag from data structure to avoid confusion
const CATEGORIES: MixCategory[] = [
    // Core categories
    { id: 'GENERAL', title: 'General', icon: 'auto-awesome' },
    { id: 'MY_PHRASES', title: 'Mis frases', icon: 'edit' },
    { id: 'FAVORITES', title: 'Mis favoritos', icon: 'favorite' },

    // Wellbeing categories
    { id: 'MINDFULNESS', title: 'Mindfulness', icon: 'spa' },
    { id: 'ANXIETY', title: 'Ansiedad', icon: 'notifications-none' },
    { id: 'STRESS', title: 'Alivio del estrés', icon: 'sentiment-satisfied', fullWidthText: true },

    // Seasonal & Time-based
    { id: 'WINTER', title: 'Invierno', icon: 'ac-unit' },
    { id: 'MORNING', title: 'Vibras mañaneras', icon: 'wb-sunny', fullWidthText: true },

    // Energy & Motivation
    { id: 'ENERGY', title: 'Energía', icon: 'bolt' },
    { id: 'MOTIVATION', title: 'Motivación', icon: 'rocket-launch', fullWidthText: true },

    // Self-care & Rest
    { id: 'SELFCARE', title: 'Autocuidado', icon: 'local-florist', fullWidthText: true },
    { id: 'SLEEP', title: 'Sueño y descanso', icon: 'bedtime', fullWidthText: true },

    // Mental clarity
    { id: 'FOCUS', title: 'Enfoque', icon: 'visibility' },
    { id: 'OVERTHINKING', title: 'Pensar demasiado', icon: 'all-inclusive', fullWidthText: true },
    { id: 'PEACE', title: 'Paz', icon: 'wb-twilight' },

    // Personal growth
    { id: 'GRATITUDE', title: 'Gratitud', icon: 'volunteer-activism', fullWidthText: true },
    { id: 'CONFIDENCE', title: 'Confianza', icon: 'star' },
    { id: 'GROWTH', title: 'Crecimiento', icon: 'trending-up' },

    // Relationships & Boundaries
    { id: 'BOUNDARIES', title: 'Límites', icon: 'security', fullWidthText: true },
    { id: 'RELATIONSHIPS', title: 'Relaciones', icon: 'group', fullWidthText: true },
    { id: 'CHANGE', title: 'Cambio', icon: 'sync-alt' },
];

export const CustomMixScreen: React.FC<CustomMixScreenProps> = ({ onBack, onNavigate, onMixCreated, initialSelection = [] }) => {
    const [selectedCategories, setSelectedCategories] = useState<string[]>(initialSelection);
    const [isPremium, setIsPremium] = useState(false);

    useEffect(() => {
        loadData();

        // Listen for subscription changes
        const customerInfoListener = (info: CustomerInfo) => {
            const entitlement = info.entitlements.active['Lio +'];
            setIsPremium(!!entitlement);
        };

        Purchases.addCustomerInfoUpdateListener(customerInfoListener);
    }, []);

    const loadData = async () => {
        const status = await checkPremiumStatus();
        setIsPremium(status.isPremium);
    };

    const handleCategoryPress = (categoryId: string) => {
        // All categories are unlocked in Custom Mix (premium-only screen)
        // Toggle selection
        setSelectedCategories(prev => {
            if (prev.includes(categoryId)) {
                return prev.filter(id => id !== categoryId);
            } else {
                return [...prev, categoryId];
            }
        });
    };

    const handleContinue = () => {
        if (selectedCategories.length > 0) {
            onMixCreated?.(selectedCategories);
        }
    };

    return (
        <View style={styles.container}>
            <CinematicBackground />
            <SafeAreaView style={styles.safeArea}>
                <ScrollView
                    style={styles.scrollView}
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                >
                    {/* Header */}
                    <View style={styles.header}>
                        <TouchableOpacity onPress={onBack} style={styles.backButton}>
                            <MaterialIcons name="arrow-back" size={24} color="#FFF" />
                        </TouchableOpacity>
                        <Text style={styles.headerTitle}>Crear mi propio mix</Text>
                        <TouchableOpacity onPress={() => onNavigate?.('PROFILE')} style={styles.backButton}>
                            <MaterialIcons name="person-outline" size={24} color="#FFF" />
                        </TouchableOpacity>
                    </View>

                    {/* Instructions */}
                    <Text style={styles.instructions}>
                        Selecciona las categorías que quieres combinar
                    </Text>

                    {/* Categories Grid */}
                    <View style={styles.section}>
                        <View style={styles.grid}>
                            {CATEGORIES.map((category) => (
                                <CategoryCard
                                    key={category.id}
                                    title={category.title}
                                    icon={category.icon}
                                    // isLocked prop removed
                                    color={category.color}
                                    fullWidthText={category.fullWidthText}
                                    onPress={() => handleCategoryPress(category.id)}
                                    isActive={selectedCategories.includes(category.id)}
                                />
                            ))}
                        </View>
                    </View>

                    <View style={{ height: 120 }} />
                </ScrollView>

                {/* Bottom CTA Button */}
                <View style={styles.bottomBar}>
                    <TouchableOpacity
                        style={[
                            styles.continueButton,
                            selectedCategories.length === 0 && styles.continueButtonDisabled
                        ]}
                        onPress={handleContinue}
                        disabled={selectedCategories.length === 0}
                    >
                        <LinearGradient
                            colors={selectedCategories.length > 0 ? ['#af25f4', '#bc52f5'] : ['#4a4a4a', '#3a3a3a']}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                            style={styles.continueButtonGradient}
                        >
                            <Text style={styles.continueButtonText}>
                                Continuar {selectedCategories.length > 0 && `(${selectedCategories.length})`}
                            </Text>
                            <MaterialIcons name="arrow-forward" size={24} color="#FFF" />
                        </LinearGradient>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0F1029',
    },
    safeArea: {
        flex: 1,
        zIndex: 1,  // Ensure content renders ABOVE CinematicBackground
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        paddingHorizontal: PADDING,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 10,
        marginBottom: 20,
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: '#FFF',
        flex: 1,
        textAlign: 'center',
    },
    instructions: {
        fontSize: 16,
        color: 'rgba(255, 255, 255, 0.7)',
        textAlign: 'center',
        marginBottom: 24,
        paddingHorizontal: 20,
    },
    section: {
        marginBottom: 32,
    },
    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: GAP,
    },
    gridItem: {
        width: ITEM_WIDTH,
        aspectRatio: 1,
        backgroundColor: 'rgba(30, 27, 75, 0.6)',
        borderRadius: 24,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.05)',
        overflow: 'hidden',
        position: 'relative',
    },
    checkBadge: {
        position: 'absolute',
        top: 8,
        right: 8,
        width: 20,
        height: 20,
        borderRadius: 10,
        backgroundColor: '#bc52f5',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 10,
        shadowColor: '#bc52f5',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.6,
        shadowRadius: 6,
    },
    gridItemContent: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 12,
    },
    lockIcon: {
        position: 'absolute',
        top: 8,
        left: 8,
    },
    gridIconContainer: {
        marginBottom: 8,
    },
    gridTitle: {
        fontSize: 12,
        fontWeight: '600',
        color: '#FFF',
        textAlign: 'center',
        width: '90%',
    },
    bottomBar: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        paddingHorizontal: PADDING,
        paddingBottom: 20,
        paddingTop: 16,
        backgroundColor: 'rgba(15, 16, 41, 0.95)',
        borderTopWidth: 1,
        borderTopColor: 'rgba(255, 255, 255, 0.05)',
    },
    continueButton: {
        borderRadius: 16,
        overflow: 'hidden',
        shadowColor: '#af25f4',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
    },
    continueButtonDisabled: {
        shadowOpacity: 0,
    },
    continueButtonGradient: {
        paddingVertical: 18,
        paddingHorizontal: 24,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
    },
    continueButtonText: {
        color: '#FFF',
        fontSize: 18,
        fontWeight: '700',
    },
});
