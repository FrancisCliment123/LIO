import React, { useState, useEffect } from 'react';
import Purchases, { CustomerInfo } from 'react-native-purchases';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions, Alert, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';
import { CinematicBackground } from './CinematicBackground';
import { getFavoritesCount } from '../services/favorites';
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
    activeCategory?: string; // Allow any category ID
    onCategorySelect?: (category: string) => void;
    customMixCategories?: string[] | null;
}

const CategoryCard: React.FC<{
    title: string;
    icon: keyof typeof MaterialIcons.glyphMap;
    isLocked?: boolean;
    color?: string; // Icon color
    fullWidthText?: boolean;
    onPress?: () => void;
    isActive?: boolean;
}> = ({ title, icon, isLocked, color = '#af25f4', fullWidthText, onPress, isActive }) => (
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
            {isLocked && (
                <MaterialIcons name="lock" size={14} color="rgba(175, 37, 244, 0.7)" style={styles.lockIcon} />
            )}

            <View style={styles.gridIconContainer}>
                <MaterialIcons name={icon} size={28} color={isActive ? '#FFF' : color} />
            </View>

            <Text style={[styles.gridTitle, fullWidthText && { width: '100%' }]} numberOfLines={2}>
                {title}
            </Text>
        </View>
    </TouchableOpacity>
);

const ForYouCard: React.FC<{
    title: string;
    icon: keyof typeof MaterialIcons.glyphMap;
    // Removed isPremium flag since all are accessible in Custom Mix
    isLocked?: boolean;
    onPress?: () => void;
    isActive?: boolean;
}> = ({ title, icon, isLocked, onPress, isActive }) => (
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
        <View style={[styles.gridItemContent, { alignItems: 'flex-start', justifyContent: 'space-between' }]} pointerEvents="none">
            <View style={{ width: '100%', flexDirection: 'row', justifyContent: 'space-between' }}>
                <Text style={[styles.gridTitle, { textAlign: 'left', marginTop: 0 }]}>{title}</Text>
                {isLocked && <MaterialIcons name="lock" size={16} color="rgba(175, 37, 244, 0.7)" />}
            </View>
            <View style={{ alignSelf: 'flex-end' }}>
                <MaterialIcons name={icon} size={28} color={isActive ? '#FFF' : "#af25f4"} />
            </View>
        </View>
    </TouchableOpacity>
);


export const CategoriesScreen: React.FC<CategoriesScreenProps> = ({ onBack, onNavigate, activeCategory = 'GENERAL', onCategorySelect, customMixCategories }) => {
    const [favoritesCount, setFavoritesCount] = useState(0);
    const [isPremium, setIsPremium] = useState(false);

    useEffect(() => {
        loadData();

        // Listen for subscription changes (e.g. after paywall purchase)
        const customerInfoListener = (info: CustomerInfo) => {
            const entitlement = info.entitlements.active['Lio +'];
            setIsPremium(!!entitlement);
        };

        Purchases.addCustomerInfoUpdateListener(customerInfoListener);
    }, []);

    const loadData = async () => {
        const count = await getFavoritesCount();
        setFavoritesCount(count);

        // Check premium status
        const status = await checkPremiumStatus();
        setIsPremium(status.isPremium);
    };

    const handleLockedCategory = () => {
        onNavigate?.('SUBSCRIPTION');
    };

    return (
        <View style={styles.container}>
            <CinematicBackground />
            <SafeAreaView style={styles.safeArea}>
                <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

                    {/* Header */}
                    <View style={styles.header}>
                        <TouchableOpacity onPress={onBack} style={styles.backButton}>
                            <MaterialIcons name="arrow-back" size={24} color="#FFF" />
                        </TouchableOpacity>
                        <Text style={styles.headerTitle}>Categorías</Text>
                        <TouchableOpacity onPress={() => onNavigate?.('PROFILE')} style={styles.backButton}>
                            <MaterialIcons name="person-outline" size={24} color="#FFF" />
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
                            // Add selection styling when custom mix is active
                            customMixCategories && customMixCategories.length > 0 && {
                                borderWidth: 1.5,
                                borderColor: 'rgba(188, 82, 245, 0.8)',
                                shadowColor: '#bc52f5',
                                shadowOffset: { width: 0, height: 0 },
                                shadowOpacity: 0.5,
                                shadowRadius: 12,
                            }
                        ]}
                        onPress={() => isPremium ? onNavigate?.('CUSTOM_MIX') : handleLockedCategory()}
                    >
                        {/* Checkmark when custom mix is active */}
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
                                // Only show as selected if activeCategory is GENERAL AND no custom mix is active
                                (activeCategory === 'GENERAL' && !customMixCategories) ? {
                                    borderColor: '#d946ef', // Brighter fuchsia/purple
                                    borderWidth: 2,         // Thicker border
                                    backgroundColor: 'rgba(147, 51, 234, 0.5)', // More visible background tint
                                    shadowColor: '#d946ef',
                                    shadowOffset: { width: 0, height: 0 },
                                    shadowOpacity: 0.8,     // Increased glow
                                    shadowRadius: 15,       // Larger glow radius
                                    transform: [{ scale: 1.05 }], // Increased pop effect
                                    zIndex: 10, // Bring to front
                                } : { borderWidth: 0 }
                            ]}
                            onPress={() => onCategorySelect && onCategorySelect('GENERAL')}
                        >
                            {(activeCategory === 'GENERAL' && !customMixCategories) && (
                                <View style={styles.checkBadge}>
                                    <MaterialIcons name="check" size={12} color="#FFF" />
                                </View>
                            )}
                            <Text style={styles.generalTitle}>General</Text>
                            <View style={styles.generalIcon}>
                                <MaterialIcons name="auto-awesome" size={28} color="#bc52f5" />
                            </View>
                        </TouchableOpacity>

                        {/* Right Column */}
                        <View style={styles.rightCol}>
                            {/* My Own Quotes */}
                            <TouchableOpacity style={[styles.rightCard, { flex: 0.8 }]}>
                                <View>
                                    <Text style={styles.rightTitle}>Mis frases</Text>
                                    <Text style={styles.rightSubtitle}>1 afirmación</Text>
                                </View>
                                <MaterialIcons name="edit" size={20} color="#af25f4" style={styles.rightIcon} />
                            </TouchableOpacity>

                            {/* My Favorites */}
                            <TouchableOpacity
                                style={[
                                    styles.rightCard,
                                    { flex: 1.2 },
                                    // Only show as selected if activeCategory is FAVORITES AND no custom mix is active
                                    (activeCategory === 'FAVORITES' && !customMixCategories) ? {
                                        borderColor: '#d946ef', // Brighter fuchsia/purple
                                        borderWidth: 2,         // Thicker border
                                        backgroundColor: 'rgba(147, 51, 234, 0.5)', // More visible background tint
                                        shadowColor: '#d946ef',
                                        shadowOffset: { width: 0, height: 0 },
                                        shadowOpacity: 0.8,     // Increased glow
                                        shadowRadius: 15,       // Larger glow radius
                                        transform: [{ scale: 1.05 }], // Increased pop effect
                                        zIndex: 10, // Bring to front
                                    } : { borderWidth: 0 }
                                ]}
                                onPress={() => onCategorySelect && onCategorySelect('FAVORITES')}
                            >
                                {(activeCategory === 'FAVORITES' && !customMixCategories) && (
                                    <View style={[styles.checkBadge, { top: 12, right: 12 }]}>
                                        <MaterialIcons name="check" size={12} color="#FFF" />
                                    </View>
                                )}
                                <View>
                                    <Text style={styles.rightTitle}>Mis favoritos</Text>
                                    <Text style={styles.rightSubtitle}>{favoritesCount} {favoritesCount === 1 ? 'afirmación' : 'afirmaciones'}</Text>
                                </View>
                                <MaterialIcons name="favorite" size={20} color="#af25f4" style={styles.rightIcon} />
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* For You Section */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Para ti</Text>
                        <View style={styles.grid}>
                            <ForYouCard
                                title="Ansiedad"
                                icon="notifications-none"
                                onPress={() => onCategorySelect && onCategorySelect('ANXIETY')}
                                isActive={activeCategory === 'ANXIETY' && !customMixCategories}
                            />
                            <ForYouCard
                                title="Alivio del estrés"
                                icon="sentiment-satisfied"
                                isLocked={!isPremium}
                                onPress={() => !isPremium ? handleLockedCategory() : onCategorySelect?.('STRESS')}
                                isActive={activeCategory === 'STRESS' && !customMixCategories}
                            />
                            <ForYouCard
                                title="Mindfulness"
                                icon="spa"
                                onPress={() => onCategorySelect && onCategorySelect('MINDFULNESS')}
                                isActive={activeCategory === 'MINDFULNESS' && !customMixCategories}
                            />
                        </View>
                    </View>

                    {/* Explore Section */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Explorar</Text>
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
    safeArea: {
        flex: 1,
        zIndex: 10, // Ensure content is above background (zIndex 1)
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
        marginTop: 50, // Push below status bar
        marginBottom: 10,
    },
    headerTitle: {
        color: '#FFF',
        fontSize: 20,
        fontWeight: '700',
        fontFamily: 'System',
        letterSpacing: 0.5,
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
