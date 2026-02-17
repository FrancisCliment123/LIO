import React, { useState, useEffect } from 'react';
import * as Haptics from 'expo-haptics';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';
import { getFavorites, removeFavorite } from '../services/favorites';
import { Affirmation } from '../services/gemini';
import { LinearGradient } from 'expo-linear-gradient';
import { CinematicBackground } from './CinematicBackground';
import { CosmicLoader } from './CosmicLoader';
import { PulsingHeart } from './PulsingHeart';
import RevenueCatUI from 'react-native-purchases-ui';

import { ThemeType } from '../styles/theme';

interface FavoritesScreenProps {
    onBack: () => void;
    onNavigate?: (screen: string) => void;
    onRefresh?: () => void;
    currentTheme: ThemeType;
}

export const FavoritesScreen: React.FC<FavoritesScreenProps> = ({ onBack, onNavigate, currentTheme }) => {
    const [favorites, setFavorites] = useState<Affirmation[]>([]);
    const [displayFavorites, setDisplayFavorites] = useState<Affirmation[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadFavorites();
    }, []);

    const loadFavorites = async () => {
        setLoading(true);
        const favs = await getFavorites();
        setFavorites(favs);
        setDisplayFavorites(favs); // Initialize display list
        setLoading(false);
    };

    const handleUnlike = async (id: string) => {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
        await removeFavorite(id);
        setFavorites(prev => prev.filter(fav => fav.id !== id));
        // Remove all instances of this affirmation from the infinite list
        setDisplayFavorites(prev => prev.filter(fav => fav.id !== id));
    };

    const handleLoadMore = () => {
        if (favorites.length > 0) {
            // Append the original list to create the loop effect
            setDisplayFavorites(prev => [...prev, ...favorites]);
        }
    };

    const renderItem = ({ item }: { item: Affirmation }) => {
        return (
            <View style={styles.affirmationPage}>
                <View style={styles.homeMain}>
                    <Text style={[styles.homeAffirmation, currentTheme === 'light' && styles.textLight]}>
                        {item.text}
                    </Text>
                </View>

                {/* Action Buttons INSIDE the scrollable page */}
                <View style={styles.cardActions}>
                    <TouchableOpacity
                        style={[styles.cardActionButton, currentTheme === 'light' && styles.actionButtonLight]}
                        onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)}
                    >
                        <MaterialIcons name="share" size={28} color={currentTheme === 'light' ? 'rgba(0,0,0,0.6)' : "rgba(255,255,255,0.8)"} />
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.cardActionButton, currentTheme === 'light' && styles.actionButtonLight]}
                        onPress={() => handleUnlike(item.id)}
                    >
                        <MaterialIcons
                            name="favorite"
                            size={32}
                            color="#af25f4"
                        />
                    </TouchableOpacity>
                </View>
            </View>
        );
    };

    return (
        <View style={[styles.container, currentTheme === 'light' && styles.containerLight]}>
            <CinematicBackground theme={currentTheme} />
            {/* Content wrapper - sits above background */}
            <View style={styles.contentWrapper}>
                {/* Main Swipeable Content */}
                {loading ? (
                    <View style={[styles.affirmationPage, { justifyContent: 'center', alignItems: 'center' }]}>
                        <CosmicLoader />
                    </View>
                ) : favorites.length === 0 ? (
                    <SafeAreaView style={styles.emptyContainer}>
                        <TouchableOpacity onPress={onBack} style={styles.backButtonAbsolute}>
                            <MaterialIcons name="arrow-back" size={24} color={currentTheme === 'light' ? "#111827" : "#E2E8F0"} />
                        </TouchableOpacity>
                        <PulsingHeart />
                        <Text style={[styles.emptyTitle, currentTheme === 'light' && styles.textLight]}>Sin favoritos aún</Text>
                        <Text style={[styles.emptySubtitle, currentTheme === 'light' && styles.subtitleLight]}>
                            Toca el corazón en las afirmaciones que te gusten para guardarlas aquí
                        </Text>
                    </SafeAreaView>
                ) : (
                    <>
                        <FlatList
                            data={displayFavorites}
                            renderItem={renderItem}
                            keyExtractor={(item, index) => `${item.id}-${index}`}
                            pagingEnabled
                            showsVerticalScrollIndicator={false}
                            snapToAlignment="start"
                            decelerationRate="fast"
                            snapToInterval={Dimensions.get('window').height}
                            onEndReached={handleLoadMore}
                            onEndReachedThreshold={0.5}
                            style={styles.flatList}
                        />

                        {/* TOP OVERLAY: Header with heart count and premium */}
                        <SafeAreaView style={styles.topOverlay} pointerEvents="box-none">
                            <View style={styles.header}>
                                {/* Empty Left View for balance */}
                                <View style={{ width: 40 }} />



                                <TouchableOpacity
                                    style={styles.headerButton}
                                    onPress={() => RevenueCatUI.presentPaywall({})}
                                >
                                    <MaterialCommunityIcons name="crown" size={24} color="#AF25F4" />
                                </TouchableOpacity>
                            </View>
                        </SafeAreaView>

                        {/* BOTTOM OVERLAY: Navigation in corners */}
                        <SafeAreaView style={styles.bottomOverlay} pointerEvents="box-none">
                            <View style={styles.actionsContainer} pointerEvents="box-none">


                                {/* Bottom Nav Bar - Icons in corners */}
                                <View style={styles.nav}>
                                    <TouchableOpacity style={styles.navButton} onPress={() => onNavigate && onNavigate('CATEGORIES')}>
                                        <MaterialIcons name="grid-view" size={28} color={currentTheme === 'light' ? 'rgba(0, 0, 0, 0.4)' : "rgba(255, 255, 255, 0.4)"} />
                                    </TouchableOpacity>

                                    <View style={styles.navCenter} />

                                    <TouchableOpacity style={styles.navButton} onPress={() => onNavigate && onNavigate('PROFILE')}>
                                        <MaterialIcons name="person-outline" size={28} color={currentTheme === 'light' ? 'rgba(0, 0, 0, 0.4)' : "rgba(255, 255, 255, 0.4)"} />
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </SafeAreaView>
                    </>
                )}
            </View>
        </View >
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#070A1A',
    },
    containerLight: {
        backgroundColor: '#F8F9FA',
    },
    contentWrapper: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
    },
    flatList: {
        flex: 1,
        zIndex: 10,
    },
    affirmationPage: {
        height: Dimensions.get('window').height,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 30,
        zIndex: 10,
    },
    homeMain: {
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 20,
    },
    homeAffirmation: {
        fontFamily: 'PlaywriteNZBasic_400Regular',
        fontSize: 28,
        color: '#FFFFFF',
        textAlign: 'center',
        lineHeight: 42,
        letterSpacing: -0.5,
        textShadowColor: 'rgba(0, 0, 0, 0.5)',
        textShadowOffset: { width: 0, height: 2 },
        textShadowRadius: 10,
    },
    textLight: {
        color: '#111827',
        textShadowColor: 'rgba(0, 0, 0, 0.05)',
        textShadowRadius: 4,
    },
    subtitleLight: {
        color: '#6B7280',
    },
    cardActions: {
        flexDirection: 'row',
        gap: 30,
        paddingBottom: 100,
        marginTop: 30, // Reduced from 60 to bring closer to text
    },
    cardActionButton: {
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.2)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    actionButtonLight: {
        backgroundColor: 'rgba(0, 0, 0, 0.05)',
        borderColor: 'rgba(0, 0, 0, 0.1)',
    },
    topOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 100,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingTop: 20,
        marginTop: 50,
        height: 60,
    },
    headerLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        backgroundColor: 'rgba(255,255,255,0.08)',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    headerText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#FFFFFF',
    },
    headerButton: {
        width: 40,
        height: 40,
        alignItems: 'center',
        justifyContent: 'center',
    },
    bottomOverlay: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 100,
    },
    actionsContainer: {
        alignItems: 'center',
        paddingBottom: 20,
    },

    nav: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        width: '100%',
        paddingHorizontal: 40,
    },
    navButton: {
        padding: 8,
    },
    navCenter: {
        flex: 1,
    },
    backButtonAbsolute: {
        position: 'absolute',
        top: 60,
        left: 20,
        padding: 8,
        zIndex: 100,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 40,
        zIndex: 100, // Ensure it sits above background
    },
    emptyTitle: {
        fontSize: 24,
        fontWeight: '700',
        color: '#FFFFFF',
        marginTop: 24,
        marginBottom: 12,
        textAlign: 'center',
    },
    emptySubtitle: {
        fontSize: 16,
        color: 'rgba(255, 255, 255, 0.6)',
        textAlign: 'center',
        lineHeight: 24,
        paddingHorizontal: 40,
    },
    emptyText: {
        fontSize: 16,
        color: 'rgba(255, 255, 255, 0.6)',
    },
});
