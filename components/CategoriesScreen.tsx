import React, { useState, useEffect } from 'react';
import Purchases, { CustomerInfo } from 'react-native-purchases';
import * as Haptics from 'expo-haptics';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions, Alert, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';
import { CinematicBackground } from './CinematicBackground';
import { getFavoritesCount } from '../services/favorites';
import { getCustomPhrases } from '../services/customPhrases';
import { checkPremiumStatus } from '../services/revenuecat';

const { width } = Dimensions.get('window');
const GAP = 12;
const PADDING = 20;
// Calculate item width for 3-column grid: (Total Width - Padding*2 - Gap*2) / 3
const ITEM_WIDTH = (width - (PADDING * 2) - (GAP * 2)) / 3;

// Define Explore categories data
const EXPLORE_CATEGORIES = [
    { id: 'WINTER', title: 'Invierno', icon: 'ac-unit' },
    { id: 'MORNING', title: 'Vibras mañaneras', icon: 'wb-sunny' },
    { id: 'ENERGY', title: 'Energía', icon: 'bolt' },
    { id: 'MOTIVATION', title: 'Motivación', icon: 'rocket-launch', fullWidthText: true },
    { id: 'SELFCARE', title: 'Autocuidado', icon: 'local-florist', fullWidthText: true },
    { id: 'SLEEP', title: 'Sueño y descanso', icon: 'bedtime', fullWidthText: true },
    { id: 'FOCUS', title: 'Enfoque', icon: 'visibility' },
    { id: 'OVERTHINKING', title: 'Pensar demasiado', icon: 'all-inclusive', fullWidthText: true },
    { id: 'PEACE', title: 'Paz', icon: 'wb-twilight' },
    { id: 'GRATITUDE', title: 'Gratitud', icon: 'volunteer-activism', fullWidthText: true },
    { id: 'CONFIDENCE', title: 'Confianza', icon: 'star' },
    { id: 'GROWTH', title: 'Crecimiento', icon: 'trending-up' },
    { id: 'BOUNDARIES', title: 'Límites', icon: 'security', fullWidthText: true },
    { id: 'RELATIONSHIPS', title: 'Relaciones', icon: 'group', fullWidthText: true },
    { id: 'CHANGE', title: 'Cambio', icon: 'sync-alt' },
];

interface CategoriesScreenProps {
    onBack: () => void;
    onNavigate?: (screen: any) => void;
    activeCategory?: string;
    onCategorySelect?: (category: string) => void;
    customMixCategories?: string[] | null;
    currentTheme: 'dark' | 'light';
}

const CategoryCard: React.FC<{
    title: string;
    icon: keyof typeof MaterialIcons.glyphMap;
    isLocked?: boolean;
    color?: string;
    fullWidthText?: boolean;
    onPress?: () => void;
    isActive?: boolean;
    currentTheme: 'dark' | 'light';
}> = ({ title, icon, isLocked, color = '#af25f4', fullWidthText, onPress, isActive, currentTheme }) => (
    <TouchableOpacity
        style={[
            styles.gridItem,
            currentTheme === 'light' && styles.gridItemLight,
            isActive && {
                borderColor: '#d946ef',
                borderWidth: 2,
                backgroundColor: currentTheme === 'light' ? 'rgba(217, 70, 239, 0.1)' : 'rgba(147, 51, 234, 0.5)',
                shadowColor: '#d946ef',
                shadowOffset: { width: 0, height: 0 },
                shadowOpacity: 0.8,
                shadowRadius: 15,
                transform: [{ scale: 1.05 }],
                zIndex: 10,
            }
        ]}
        onPress={() => {
            if (onPress) {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                onPress();
            }
        }}
        activeOpacity={0.7}
    >
        {isActive && (
            <View style={styles.checkBadge} pointerEvents="none">
                <MaterialIcons name="check" size={14} color="#FFF" />
            </View>
        )}
        <View style={styles.gridItemContent} pointerEvents="none">
            {isLocked && (
                <MaterialIcons name="lock" size={14} color={currentTheme === 'light' ? "rgba(124, 58, 237, 0.5)" : "rgba(175, 37, 244, 0.7)"} style={styles.lockIcon} />
            )}

            <View style={styles.gridIconContainer}>
                <MaterialIcons name={icon} size={28} color={isActive ? (currentTheme === 'light' ? '#7C3AED' : '#FFF') : (currentTheme === 'light' ? '#7C3AED' : color)} />
            </View>

            <Text style={[styles.gridTitle, currentTheme === 'light' && styles.textLight, fullWidthText && { width: '100%' }]} numberOfLines={2}>
                {title}
            </Text>
        </View>
    </TouchableOpacity>
);

const ForYouCard: React.FC<{
    title: string;
    icon: keyof typeof MaterialIcons.glyphMap;
    isLocked?: boolean;
    onPress?: () => void;
    isActive?: boolean;
    currentTheme: 'dark' | 'light';
}> = ({ title, icon, isLocked, onPress, isActive, currentTheme }) => (
    <TouchableOpacity
        style={[
            styles.gridItem,
            currentTheme === 'light' && styles.gridItemLight,
            isActive && {
                borderColor: '#d946ef',
                borderWidth: 2,
                backgroundColor: currentTheme === 'light' ? 'rgba(217, 70, 239, 0.1)' : 'rgba(147, 51, 234, 0.5)',
                shadowColor: '#d946ef',
                shadowOffset: { width: 0, height: 0 },
                shadowOpacity: 0.8,
                shadowRadius: 15,
                transform: [{ scale: 1.05 }],
                zIndex: 10,
            }
        ]}
        onPress={() => {
            if (onPress) {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                onPress();
            }
        }}
        activeOpacity={0.7}
    >
        {isActive && (
            <View style={styles.checkBadge} pointerEvents="none">
                <MaterialIcons name="check" size={14} color="#FFF" />
            </View>
        )}
        <View style={[styles.gridItemContent, { alignItems: 'flex-start', justifyContent: 'space-between' }]} pointerEvents="none">
            <View style={{ width: '100%', flexDirection: 'row', justifyContent: 'space-between' }}>
                <Text style={[styles.gridTitle, currentTheme === 'light' && styles.textLight, { textAlign: 'left', marginTop: 0 }]}>{title}</Text>
                {isLocked && <MaterialIcons name="lock" size={16} color={currentTheme === 'light' ? "rgba(124, 58, 237, 0.5)" : "rgba(175, 37, 244, 0.7)"} />}
            </View>
            <View style={{ alignSelf: 'flex-end' }}>
                <MaterialIcons name={icon} size={28} color={isActive ? (currentTheme === 'light' ? '#7C3AED' : '#FFF') : (currentTheme === 'light' ? '#7C3AED' : "#af25f4")} />
            </View>
        </View>
    </TouchableOpacity>
);


export const CategoriesScreen: React.FC<CategoriesScreenProps> = ({ onBack, onNavigate, activeCategory = 'GENERAL', onCategorySelect, customMixCategories, currentTheme }) => {
    const [favoritesCount, setFavoritesCount] = useState(0);
    const [customPhrasesCount, setCustomPhrasesCount] = useState(0);
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
        const [favCount, customPhrases, premiumStatus] = await Promise.all([
            getFavoritesCount(),
            getCustomPhrases(),
            checkPremiumStatus()
        ]);
        setFavoritesCount(favCount);
        setCustomPhrasesCount(customPhrases.length);
        setIsPremium(premiumStatus.isPremium);
    };

    const handleLockedCategory = () => {
        onNavigate?.('SUBSCRIPTION');
    };

    return (
        <View style={[styles.container, currentTheme === 'light' && styles.containerLight]}>
            <CinematicBackground theme={currentTheme} />
            <SafeAreaView style={styles.safeArea}>
                <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

                    {/* Header */}
                    <View style={styles.header}>
                        <TouchableOpacity onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); onBack(); }} style={[styles.backButton, currentTheme === 'light' && { backgroundColor: 'rgba(0,0,0,0.05)', borderRadius: 20 }]}>
                            <MaterialIcons name="arrow-back" size={24} color={currentTheme === 'light' ? "#111827" : "#FFF"} />
                        </TouchableOpacity>
                        <Text style={[styles.headerTitle, currentTheme === 'light' && styles.textLight]}>Categorías</Text>
                        <TouchableOpacity onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); onNavigate?.('PROFILE'); }} style={[styles.backButton, currentTheme === 'light' && { backgroundColor: 'rgba(0,0,0,0.05)', borderRadius: 20 }]}>
                            <MaterialIcons name="person-outline" size={24} color={currentTheme === 'light' ? "#111827" : "#FFF"} />
                        </TouchableOpacity>
                    </View>

                    {/* Central Star Icon */}
                    <View style={styles.starContainer}>
                        <Image
                            source={require('../assets/frames/lio-logoalone.png')}
                            style={[styles.starIcon, { width: 100, height: 100, resizeMode: 'contain' }]}
                        />
                    </View>

                    {/* Create Mix Button */}
                    <TouchableOpacity
                        style={[
                            styles.createButton,
                            customMixCategories && customMixCategories.length > 0 && {
                                borderWidth: 1.5,
                                borderColor: 'rgba(188, 82, 245, 0.8)',
                                shadowColor: '#bc52f5',
                                shadowOffset: { width: 0, height: 0 },
                                shadowOpacity: 0.5,
                                shadowRadius: 12,
                            }
                        ]}
                        onPress={() => {
                            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                            isPremium ? onNavigate?.('CUSTOM_MIX') : handleLockedCategory();
                        }}
                    >
                        {customMixCategories && customMixCategories.length > 0 && (
                            <View style={[styles.checkBadge, { position: 'absolute', top: 12, right: 12, zIndex: 10 }]}>
                                <MaterialIcons name="check" size={14} color="#FFF" />
                            </View>
                        )}
                        <LinearGradient
                            colors={['#af25f4', '#bc52f5']}
                            start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                            style={styles.createButtonGradient}
                        >
                            <MaterialIcons name="add-circle-outline" size={28} color="#FFF" />
                            <Text style={styles.createButtonText}>
                                {customMixCategories && customMixCategories.length > 0
                                    ? `Mi mix (${customMixCategories.length})`
                                    : 'Crear mi propio mix'
                                }
                            </Text>
                            {!isPremium && <MaterialIcons name="lock" size={20} color="rgba(255, 255, 255, 0.8)" style={{ marginLeft: 8 }} />}
                        </LinearGradient>
                    </TouchableOpacity>

                    {/* Top Grid Section: General + Right Col */}
                    <View style={styles.topGrid}>

                        {/* Left: General */}
                        <TouchableOpacity
                            style={[
                                styles.generalCard,
                                currentTheme === 'light' && styles.generalCardLight,
                                (activeCategory === 'GENERAL' && !customMixCategories) ? {
                                    borderColor: '#d946ef',
                                    borderWidth: 2,
                                    backgroundColor: currentTheme === 'light' ? 'rgba(217, 70, 239, 0.1)' : 'rgba(147, 51, 234, 0.5)',
                                    shadowColor: '#d946ef',
                                    shadowOffset: { width: 0, height: 0 },
                                    shadowOpacity: 0.8,
                                    shadowRadius: 15,
                                    transform: [{ scale: 1.05 }],
                                    zIndex: 10,
                                } : { borderWidth: 0 }
                            ]}
                            onPress={() => {
                                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                                onCategorySelect && onCategorySelect('GENERAL');
                            }}
                        >
                            {(activeCategory === 'GENERAL' && !customMixCategories) && (
                                <View style={styles.checkBadge}>
                                    <MaterialIcons name="check" size={12} color="#FFF" />
                                </View>
                            )}
                            <Text style={[styles.generalTitle, currentTheme === 'light' && styles.textLight]}>General</Text>
                            <View style={styles.generalIcon}>
                                <MaterialIcons name="auto-awesome" size={28} color={currentTheme === 'light' ? "#7C3AED" : "#bc52f5"} />
                            </View>
                        </TouchableOpacity>

                        {/* Right Column */}
                        <View style={styles.rightCol}>
                            {/* My Own Quotes */}
                            <TouchableOpacity
                                style={[
                                    styles.rightCard,
                                    { flex: 0.8 },
                                    currentTheme === 'light' && styles.rightCardLight
                                ]}
                                onPress={() => onNavigate?.('MY_PHRASES')}
                            >
                                <View>
                                    <Text style={[styles.rightTitle, currentTheme === 'light' && styles.textLight]}>Mis frases</Text>
                                    <Text style={[styles.rightSubtitle, currentTheme === 'light' && styles.subtitleLight]}>
                                        {customPhrasesCount} {customPhrasesCount === 1 ? 'afirmación' : 'afirmaciones'}
                                    </Text>
                                </View>
                                <MaterialIcons name="edit" size={20} color={currentTheme === 'light' ? "#7C3AED" : "#af25f4"} style={styles.rightIcon} />
                            </TouchableOpacity>

                            {/* My Favorites */}
                            <TouchableOpacity
                                style={[
                                    styles.rightCard,
                                    { flex: 1.2 },
                                    currentTheme === 'light' && styles.rightCardLight,
                                    (activeCategory === 'FAVORITES' && !customMixCategories) ? {
                                        borderColor: '#d946ef',
                                        borderWidth: 2,
                                        backgroundColor: currentTheme === 'light' ? 'rgba(217, 70, 239, 0.1)' : 'rgba(147, 51, 234, 0.5)',
                                        shadowColor: '#d946ef',
                                        shadowOffset: { width: 0, height: 0 },
                                        shadowOpacity: 0.8,
                                        shadowRadius: 15,
                                        transform: [{ scale: 1.05 }],
                                        zIndex: 10,
                                    } : { borderWidth: 0 }
                                ]}
                                onPress={() => {
                                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                                    onCategorySelect && onCategorySelect('FAVORITES');
                                }}
                            >
                                {(activeCategory === 'FAVORITES' && !customMixCategories) && (
                                    <View style={[styles.checkBadge, { top: 12, right: 12 }]}>
                                        <MaterialIcons name="check" size={12} color="#FFF" />
                                    </View>
                                )}
                                <View>
                                    <Text style={[styles.rightTitle, currentTheme === 'light' && styles.textLight]}>Mis favoritos</Text>
                                    <Text style={[styles.rightSubtitle, currentTheme === 'light' && styles.subtitleLight]}>{favoritesCount} {favoritesCount === 1 ? 'afirmación' : 'afirmaciones'}</Text>
                                </View>
                                <MaterialIcons name="favorite" size={20} color={currentTheme === 'light' ? "#7C3AED" : "#af25f4"} style={styles.rightIcon} />
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* For You Section */}
                    <View style={styles.section}>
                        <Text style={[styles.sectionTitle, currentTheme === 'light' && styles.textLight]}>Para ti</Text>
                        <View style={styles.grid}>
                            <ForYouCard
                                title="Ansiedad"
                                icon="notifications-none"
                                onPress={() => onCategorySelect && onCategorySelect('ANXIETY')}
                                isActive={activeCategory === 'ANXIETY' && !customMixCategories}
                                currentTheme={currentTheme}
                            />
                            <ForYouCard
                                title="Alivio del estrés"
                                icon="sentiment-satisfied"
                                isLocked={!isPremium}
                                onPress={() => !isPremium ? handleLockedCategory() : onCategorySelect?.('STRESS')}
                                isActive={activeCategory === 'STRESS' && !customMixCategories}
                                currentTheme={currentTheme}
                            />
                            <ForYouCard
                                title="Mindfulness"
                                icon="spa"
                                onPress={() => onCategorySelect && onCategorySelect('MINDFULNESS')}
                                isActive={activeCategory === 'MINDFULNESS' && !customMixCategories}
                                currentTheme={currentTheme}
                            />
                        </View>
                    </View>

                    {/* Explore Section */}
                    <View style={styles.section}>
                        <Text style={[styles.sectionTitle, currentTheme === 'light' && styles.textLight]}>Explorar</Text>
                        <View style={styles.grid}>
                            {EXPLORE_CATEGORIES.map((cat) => (
                                <CategoryCard
                                    key={cat.id}
                                    title={cat.title}
                                    icon={cat.icon as any}
                                    isLocked={!isPremium}
                                    fullWidthText={cat.fullWidthText}
                                    onPress={() => !isPremium ? handleLockedCategory() : onCategorySelect?.(cat.id)}
                                    isActive={activeCategory === cat.id && !customMixCategories}
                                    currentTheme={currentTheme}
                                />
                            ))}
                        </View>
                    </View>

                    <View style={{ height: 40 }} />
                </ScrollView>
            </SafeAreaView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#1c1022',
    },
    containerLight: {
        backgroundColor: '#F8F9FA',
    },
    safeArea: {
        flex: 1,
        zIndex: 10,
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        paddingBottom: 40,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingTop: 10,
        marginTop: 50,
        marginBottom: 10,
    },
    headerTitle: {
        color: '#FFF',
        fontSize: 20,
        fontWeight: '700',
        fontFamily: 'System',
        letterSpacing: 0.5,
    },
    textLight: {
        color: '#111827',
    },
    subtitleLight: {
        color: '#6B7280',
    },
    backButton: {
        padding: 4,
    },
    starContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        marginVertical: 20,
        height: 100,
    },
    starIcon: {
        shadowColor: '#af25f4',
        shadowOpacity: 0.8,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 0 },
        elevation: 10,
    },
    starGlow: {
        position: 'absolute',
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: 'rgba(175, 37, 244, 0.2)',
        transform: [{ scale: 1.5 }],

    },
    createButton: {
        marginHorizontal: PADDING,
        borderRadius: 20,
        marginBottom: 30,
        shadowColor: '#af25f4',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.4,
        shadowRadius: 15,
        elevation: 8,
    },
    createButtonGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 16,
        borderRadius: 20,
        gap: 10,
    },
    createButtonText: {
        color: '#FFF',
        fontSize: 18,
        fontWeight: '700',
    },
    topGrid: {
        flexDirection: 'row',
        paddingHorizontal: PADDING,
        height: 150,
        gap: GAP,
        marginBottom: 30,
    },
    generalCard: {
        flex: 1,
        backgroundColor: '#2b1834',
        borderRadius: 20,
        padding: 16,
        justifyContent: 'space-between',
    },
    generalCardLight: {
        backgroundColor: '#FFFFFF',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    checkBadge: {
        position: 'absolute',
        top: 10,
        right: 10,
        backgroundColor: '#af25f4',
        borderRadius: 10,
        width: 20,
        height: 20,
        alignItems: 'center',
        justifyContent: 'center',
    },
    generalTitle: {
        color: '#FFF',
        fontSize: 18,
        fontWeight: '700',
        marginTop: 20,
    },
    generalIcon: {
        alignSelf: 'flex-end',
    },
    rightCol: {
        flex: 1,
        gap: GAP,
    },
    rightCard: {
        backgroundColor: 'rgba(43, 24, 52, 0.7)',
        borderRadius: 16,
        borderWidth: 1,
        borderColor: 'rgba(86, 49, 104, 0.5)',
        padding: 12,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
    },
    rightCardLight: {
        backgroundColor: '#FFFFFF',
        borderColor: '#F3F4F6',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    rightTitle: {
        color: '#FFF',
        fontSize: 14,
        fontWeight: '700',
        marginBottom: 2,
    },
    rightSubtitle: {
        color: '#b790cb',
        fontSize: 11,
    },
    rightIcon: {
        marginBottom: 2,
    },
    section: {
        marginBottom: 25,
        paddingHorizontal: PADDING,
    },
    sectionTitle: {
        color: '#FFF',
        fontSize: 18,
        fontWeight: '700',
        marginBottom: 12,
        paddingLeft: 4,
    },
    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: GAP,
    },
    gridItem: {
        width: ITEM_WIDTH,
        height: ITEM_WIDTH,
        backgroundColor: 'rgba(43, 24, 52, 0.7)',
        borderRadius: 16,
        borderWidth: 1,
        borderColor: 'rgba(86, 49, 104, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    gridItemLight: {
        backgroundColor: '#FFFFFF',
        borderColor: '#F3F4F6',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    gridItemContent: {
        flex: 1,
        width: '100%',
        padding: 10,
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative',
    },
    gridTitle: {
        color: '#FFF',
        fontSize: 12,
        fontWeight: '500',
        marginTop: 8,
        textAlign: 'center',
        lineHeight: 16,
    },
    gridIconContainer: {
        marginBottom: 4,
    },
    lockIcon: {
        position: 'absolute',
        top: 0,
        right: 0,
        zIndex: 10,
    }
});
