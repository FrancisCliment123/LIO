import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { getFavorites, removeFavorite } from '../services/favorites';
import { Affirmation } from '../services/gemini';
import { LinearGradient } from 'expo-linear-gradient';

interface FavoritesScreenProps {
    onBack: () => void;
}

export const FavoritesScreen: React.FC<FavoritesScreenProps> = ({ onBack }) => {
    const [favorites, setFavorites] = useState<Affirmation[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadFavorites();
    }, []);

    const loadFavorites = async () => {
        setLoading(true);
        const favs = await getFavorites();
        setFavorites(favs);
        setLoading(false);
    };

    const handleUnlike = async (id: string) => {
        await removeFavorite(id);
        setFavorites(prev => prev.filter(fav => fav.id !== id));
    };

    const renderItem = ({ item }: { item: Affirmation }) => (
        <View style={styles.cardContainer}>
            <LinearGradient
                colors={['rgba(255, 255, 255, 0.1)', 'rgba(255, 255, 255, 0.05)']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.card}
            >
                <View style={styles.cardContent}>
                    <Text style={styles.affirmationText}>{item.text}</Text>
                </View>
                <TouchableOpacity
                    style={styles.unlikeButton}
                    onPress={() => handleUnlike(item.id)}
                >
                    <MaterialIcons name="favorite" size={24} color="#ef4444" />
                </TouchableOpacity>
            </LinearGradient>
        </View>
    );

    return (
        <View style={styles.container}>
            <SafeAreaView style={styles.safeArea}>
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={onBack} style={styles.backButton}>
                        <MaterialIcons name="arrow-back" size={24} color="#E2E8F0" />
                    </TouchableOpacity>
                    <Text style={styles.title}>Mis Favoritos</Text>
                    <View style={styles.headerRight}>
                        <MaterialIcons name="favorite" size={20} color="#ef4444" />
                        <Text style={styles.count}>{favorites.length}</Text>
                    </View>
                </View>

                {/* Content */}
                {loading ? (
                    <View style={styles.emptyContainer}>
                        <Text style={styles.emptyText}>Cargando...</Text>
                    </View>
                ) : favorites.length === 0 ? (
                    <View style={styles.emptyContainer}>
                        <MaterialIcons name="favorite-border" size={80} color="rgba(255, 255, 255, 0.2)" />
                        <Text style={styles.emptyTitle}>Sin favoritos aún</Text>
                        <Text style={styles.emptySubtitle}>
                            Toca el corazón en las afirmaciones que te gusten para guardarlas aquí
                        </Text>
                    </View>
                ) : (
                    <FlatList
                        data={favorites}
                        renderItem={renderItem}
                        keyExtractor={item => item.id}
                        contentContainerStyle={styles.list}
                        showsVerticalScrollIndicator={false}
                    />
                )}
            </SafeAreaView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#070A1A',
    },
    safeArea: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 16,
        paddingTop: 60,
    },
    backButton: {
        padding: 8,
    },
    title: {
        fontSize: 20,
        fontWeight: '700',
        color: '#FFFFFF',
        flex: 1,
        textAlign: 'center',
    },
    headerRight: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    count: {
        fontSize: 16,
        fontWeight: '600',
        color: '#FFFFFF',
    },
    list: {
        padding: 20,
        paddingTop: 10,
    },
    cardContainer: {
        marginBottom: 16,
    },
    card: {
        borderRadius: 20,
        padding: 20,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.1)',
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
    },
    cardContent: {
        flex: 1,
    },
    affirmationText: {
        fontSize: 16,
        lineHeight: 24,
        color: '#E9D5FF',
        fontWeight: '500',
    },
    unlikeButton: {
        padding: 8,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 40,
    },
    emptyTitle: {
        fontSize: 24,
        fontWeight: '700',
        color: '#FFFFFF',
        marginTop: 24,
        marginBottom: 12,
    },
    emptySubtitle: {
        fontSize: 16,
        color: 'rgba(255, 255, 255, 0.6)',
        textAlign: 'center',
        lineHeight: 24,
    },
    emptyText: {
        fontSize: 16,
        color: 'rgba(255, 255, 255, 0.6)',
    },
});
