import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';
import { CinematicBackground } from './CinematicBackground';

const { width } = Dimensions.get('window');
const GAP = 12;
const PADDING = 20;
// Calculate item width for 3-column grid: (Total Width - Padding*2 - Gap*2) / 3
const ITEM_WIDTH = (width - (PADDING * 2) - (GAP * 2)) / 3;

interface CategoriesScreenProps {
    onBack: () => void;
}

const CategoryCard: React.FC<{
    title: string;
    icon: keyof typeof MaterialIcons.glyphMap;
    isLocked?: boolean;
    color?: string; // Icon color
    fullWidthText?: boolean;
}> = ({ title, icon, isLocked, color = '#af25f4', fullWidthText }) => (
    <TouchableOpacity style={styles.gridItem}>
        <View style={styles.gridItemContent}>
            {isLocked && (
                <MaterialIcons name="lock" size={14} color="rgba(175, 37, 244, 0.7)" style={styles.lockIcon} />
            )}

            <View style={styles.gridIconContainer}>
                <MaterialIcons name={icon} size={24} color={color} />
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
    isLocked?: boolean;
}> = ({ title, icon, isLocked }) => (
    <TouchableOpacity style={styles.gridItem}>
        <View style={[styles.gridItemContent, { alignItems: 'flex-start', justifyContent: 'space-between' }]}>
            <View style={{ width: '100%', flexDirection: 'row', justifyContent: 'space-between' }}>
                <Text style={[styles.gridTitle, { textAlign: 'left', marginTop: 0 }]}>{title}</Text>
                {isLocked && <MaterialIcons name="lock" size={16} color="rgba(175, 37, 244, 0.7)" />}
            </View>
            <View style={{ alignSelf: 'flex-end' }}>
                <MaterialIcons name={icon} size={22} color="#af25f4" />
            </View>
        </View>
    </TouchableOpacity>
);


export const CategoriesScreen: React.FC<CategoriesScreenProps> = ({ onBack }) => {
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
                        <View style={{ width: 24 }} />
                    </View>

                    {/* Central Star Icon */}
                    <View style={styles.starContainer}>
                        <View style={styles.starGlow} />
                        {/* Simple CSS shape representation or Icon for the star */}
                        <MaterialCommunityIcons name="star-four-points" size={60} color="#af25f4" style={styles.starIcon} />
                    </View>

                    {/* Create Mix Button */}
                    <TouchableOpacity style={styles.createButton}>
                        <LinearGradient
                            colors={['#af25f4', '#bc52f5']}
                            start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                            style={styles.createButtonGradient}
                        >
                            <MaterialIcons name="add-circle-outline" size={28} color="#FFF" />
                            <Text style={styles.createButtonText}>Crear mi propio mix</Text>
                        </LinearGradient>
                    </TouchableOpacity>

                    {/* Top Grid Section: General + Right Col */}
                    <View style={styles.topGrid}>

                        {/* Left: General */}
                        <TouchableOpacity style={styles.generalCard}>
                            <View style={styles.checkBadge}>
                                <MaterialIcons name="check" size={12} color="#FFF" />
                            </View>
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
                            <TouchableOpacity style={[styles.rightCard, { flex: 1.2 }]}>
                                <View>
                                    <Text style={styles.rightTitle}>Mis favoritos</Text>
                                    <Text style={styles.rightSubtitle}>8 afirmaciones</Text>
                                </View>
                                <MaterialIcons name="favorite" size={20} color="#af25f4" style={styles.rightIcon} />
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* For You Section */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Para ti</Text>
                        <View style={styles.grid}>
                            <ForYouCard title="Ansiedad" icon="notifications-none" />
                            <ForYouCard title="Alivio del estrés" icon="sentiment-satisfied" isLocked />
                            <ForYouCard title="Mindfulness" icon="spa" />
                        </View>
                    </View>

                    {/* Explore Section */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Explorar</Text>
                        <View style={styles.grid}>
                            <CategoryCard title="Invierno" icon="ac-unit" isLocked />
                            <CategoryCard title="Vibras mañaneras" icon="wb-sunny" isLocked />
                            <CategoryCard title="Energía" icon="bolt" isLocked />

                            <CategoryCard title="Motivación" icon="rocket-launch" isLocked fullWidthText />
                            <CategoryCard title="Autocuidado" icon="local-florist" isLocked fullWidthText />
                            <CategoryCard title="Sueño y descanso" icon="bedtime" isLocked fullWidthText />

                            <CategoryCard title="Enfoque" icon="visibility" isLocked />
                            <CategoryCard title="Pensar demasiado" icon="all-inclusive" isLocked fullWidthText />
                            <CategoryCard title="Paz" icon="wb-twilight" isLocked />

                            <CategoryCard title="Gratitud" icon="volunteer-activism" isLocked fullWidthText />
                            <CategoryCard title="Confianza" icon="star" isLocked />
                            <CategoryCard title="Crecimiento" icon="trending-up" isLocked />

                            <CategoryCard title="Límites" icon="security" isLocked fullWidthText />
                            <CategoryCard title="Relaciones" icon="group" isLocked fullWidthText />
                            <CategoryCard title="Cambio" icon="sync-alt" isLocked />
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
        borderWidth: 2,
        borderColor: '#af25f4',
        padding: 16,
        justifyContent: 'space-between',
        shadowColor: '#af25f4',
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 5,
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
