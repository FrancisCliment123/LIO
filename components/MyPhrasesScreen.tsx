import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, Modal, Alert, Dimensions, Platform, KeyboardAvoidingView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getCustomPhrases, addCustomPhrase, deleteCustomPhrase, getCustomPhrasesEnabled, setCustomPhrasesEnabled, CustomAffirmation } from '../services/customPhrases';
import { CinematicBackground } from './CinematicBackground';

const { width } = Dimensions.get('window');

interface MyPhrasesScreenProps {
    onBack: () => void;
    currentTheme: 'dark' | 'light';
}

export const MyPhrasesScreen: React.FC<MyPhrasesScreenProps> = ({ onBack, currentTheme }) => {
    const [phrases, setPhrases] = useState<CustomAffirmation[]>([]);
    const [isEnabled, setIsEnabled] = useState(true);
    const [modalVisible, setModalVisible] = useState(false);
    const [newPhraseText, setNewPhraseText] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        const [loadedPhrases, enabled] = await Promise.all([
            getCustomPhrases(),
            getCustomPhrasesEnabled()
        ]);
        setPhrases(loadedPhrases);
        setIsEnabled(enabled);
        setLoading(false);
    };

    const handleAddPhrase = async () => {
        if (!newPhraseText.trim()) return;

        try {
            await addCustomPhrase(newPhraseText);
            setNewPhraseText('');
            setModalVisible(false);
            loadData();
        } catch (error) {
            Alert.alert('Error', 'No se pudo guardar la frase.');
        }
    };

    const handleDeletePhrase = (id: string) => {
        Alert.alert(
            'Eliminar frase',
            '¿Estás seguro de que quieres eliminar esta afirmación?',
            [
                { text: 'Cancelar', style: 'cancel' },
                {
                    text: 'Eliminar',
                    style: 'destructive',
                    onPress: async () => {
                        await deleteCustomPhrase(id);
                        loadData();
                    }
                }
            ]
        );
    };

    const toggleEnabled = async () => {
        const newValue = !isEnabled;
        setIsEnabled(newValue);
        await setCustomPhrasesEnabled(newValue);
    };

    const formatDate = (timestamp: number) => {
        const date = new Date(timestamp);
        // Format: "VIE, 13 FEB, 2026"
        const dayNames = ['DOM', 'LUN', 'MAR', 'MIÉ', 'JUE', 'VIE', 'SÁB'];
        const monthNames = ['ENE', 'FEB', 'MAR', 'ABR', 'MAY', 'JUN', 'JUL', 'AGO', 'SEP', 'OCT', 'NOV', 'DIC'];

        const dayName = dayNames[date.getDay()];
        const day = date.getDate();
        const month = monthNames[date.getMonth()];
        const year = date.getFullYear();

        return `${dayName}, ${day} ${month}, ${year}`;
    };

    return (
        <View style={[styles.container, currentTheme === 'light' && styles.containerLight]}>
            <CinematicBackground theme={currentTheme} />

            <SafeAreaView style={styles.safeArea}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={onBack} style={styles.backButton}>
                        <MaterialIcons name="arrow-back" size={24} color={currentTheme === 'light' ? "#1F2937" : "#FFF"} />
                    </TouchableOpacity>
                    <View style={styles.headerTitleContainer}>
                        <Text style={[styles.headerTitle, currentTheme === 'light' && styles.textLight]}>Mis frases</Text>
                        <Text style={[styles.headerSubtitle, currentTheme === 'light' && styles.textLightSecondary]}>Crea tus propias afirmaciones diarias</Text>
                    </View>
                    <View style={{ width: 40 }} />
                </View>

                <View style={styles.content}>
                    <TouchableOpacity
                        style={styles.feedButton}
                        onPress={toggleEnabled}
                        activeOpacity={0.8}
                    >
                        <LinearGradient
                            colors={isEnabled ? ['#c026d3', '#a21caf'] : ['#4b5563', '#374151']} // Fuchsia colors for active
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                            style={styles.feedButtonGradient}
                        >
                            <MaterialIcons name={isEnabled ? "visibility" : "visibility-off"} size={20} color="#FFF" style={{ marginRight: 8 }} />
                            <Text style={styles.feedButtonText}>
                                {isEnabled ? 'Mostrar en el feed' : 'Oculto del feed'}
                            </Text>
                        </LinearGradient>
                    </TouchableOpacity>

                    <ScrollView
                        showsVerticalScrollIndicator={false}
                        contentContainerStyle={styles.listContent}
                    >
                        {phrases.length === 0 ? (
                            <View style={styles.emptyState}>
                                <MaterialCommunityIcons
                                    name="pencil-outline"
                                    size={48}
                                    color={currentTheme === 'light' ? 'rgba(0,0,0,0.2)' : 'rgba(255,255,255,0.2)'}
                                />
                                <Text style={[styles.emptyStateText, currentTheme === 'light' && styles.textLightSecondary]}>
                                    Toca el botón + para añadir tu primera afirmación
                                </Text>
                            </View>
                        ) : (
                            phrases.map((phrase) => (
                                <View key={phrase.id} style={[styles.card, currentTheme === 'light' && styles.cardLight]}>
                                    <View style={styles.cardHeader}>
                                        <Text style={[styles.cardDate, currentTheme === 'light' && styles.cardDateLight]}>
                                            {formatDate(phrase.createdAt)}
                                        </Text>
                                        <View style={styles.cardActions}>
                                            <MaterialIcons name="favorite" size={16} color="#c026d3" style={{ marginRight: 12 }} />
                                            <TouchableOpacity onPress={() => handleDeletePhrase(phrase.id)}>
                                                <MaterialIcons
                                                    name="more-horiz"
                                                    size={20}
                                                    color={currentTheme === 'light' ? 'rgba(0,0,0,0.4)' : 'rgba(255,255,255,0.4)'}
                                                />
                                            </TouchableOpacity>
                                        </View>
                                    </View>
                                    <Text style={[styles.cardText, currentTheme === 'light' && styles.textLight]}>
                                        {phrase.text}
                                    </Text>
                                </View>
                            ))
                        )}
                        <View style={{ height: 100 }} />
                    </ScrollView>
                </View>

                {/* Floating Action Button */}
                <View style={styles.fabContainer}>
                    <TouchableOpacity
                        style={styles.fab}
                        onPress={() => setModalVisible(true)}
                        activeOpacity={0.9}
                    >
                        <LinearGradient
                            colors={['#d946ef', '#c026d3']}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                            style={styles.fabGradient}
                        >
                            <MaterialIcons name="add" size={24} color="#FFF" style={{ marginRight: 8 }} />
                            <Text style={styles.fabText}>Añadir mi propia afirmación</Text>
                        </LinearGradient>
                    </TouchableOpacity>
                </View>

                {/* Input Modal */}
                <Modal
                    visible={modalVisible}
                    transparent={true}
                    animationType="slide"
                    onRequestClose={() => setModalVisible(false)}
                >
                    <KeyboardAvoidingView
                        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                        style={styles.modalOverlay}
                    >
                        <TouchableOpacity
                            style={{ flex: 1 }}
                            activeOpacity={1}
                            onPress={() => setModalVisible(false)}
                        />
                        <View style={[styles.modalContent, currentTheme === 'light' && styles.modalContentLight]}>
                            <View style={styles.modalHeader}>
                                <Text style={[styles.modalTitle, currentTheme === 'light' && styles.textLight]}>Nueva afirmación</Text>
                                <TouchableOpacity onPress={() => setModalVisible(false)}>
                                    <MaterialIcons name="close" size={24} color={currentTheme === 'light' ? "#6B7280" : "rgba(255,255,255,0.5)"} />
                                </TouchableOpacity>
                            </View>

                            <TextInput
                                style={[styles.input, currentTheme === 'light' && styles.inputLight]}
                                placeholder="Escribe tu afirmación aquí..."
                                placeholderTextColor={currentTheme === 'light' ? "#9CA3AF" : "rgba(255, 255, 255, 0.4)"}
                                multiline
                                autoFocus
                                value={newPhraseText}
                                onChangeText={setNewPhraseText}
                                maxLength={150}
                            />

                            <TouchableOpacity
                                style={[styles.saveButton, !newPhraseText.trim() && styles.saveButtonDisabled]}
                                onPress={handleAddPhrase}
                                disabled={!newPhraseText.trim()}
                            >
                                <Text style={styles.saveButtonText}>Guardar</Text>
                            </TouchableOpacity>
                        </View>
                    </KeyboardAvoidingView>
                </Modal>
            </SafeAreaView>
        </View>
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
    safeArea: {
        flex: 1,
        zIndex: 10,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 10,
        zIndex: 10,
    },
    backButton: {
        width: 40,
        height: 40,
        justifyContent: 'center',
    },
    headerTitleContainer: {
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#FFF',
    },
    headerSubtitle: {
        fontSize: 14,
        color: '#c084fc',
        marginTop: 4,
    },
    content: {
        flex: 1,
        paddingHorizontal: 20,
        paddingTop: 20,
    },
    feedButton: {
        marginBottom: 20,
        alignSelf: 'center',
    },
    feedButtonGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: 25,
    },
    feedButtonText: {
        color: '#FFF',
        fontSize: 16,
        fontWeight: '600',
    },
    listContent: {
        paddingBottom: 20,
    },
    emptyState: {
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 60,
        paddingHorizontal: 40,
    },
    emptyStateText: {
        color: 'rgba(255, 255, 255, 0.4)',
        textAlign: 'center',
        marginTop: 16,
        fontSize: 16,
        lineHeight: 24,
    },
    card: {
        backgroundColor: 'rgba(30, 20, 45, 0.6)', // Dark purple tint
        borderRadius: 20,
        padding: 20,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.05)',
    },
    cardLight: {
        backgroundColor: '#FFFFFF',
        borderColor: 'rgba(0, 0, 0, 0.05)',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    cardDate: {
        fontSize: 12,
        color: '#a78bfa', // Purple tint date
        fontWeight: '600',
        letterSpacing: 0.5,
    },
    cardDateLight: {
        color: '#7C3AED',
    },
    cardActions: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    cardText: {
        fontSize: 18,
        color: '#FFF',
        lineHeight: 28,
        fontWeight: '500',
    },
    fabContainer: {
        position: 'absolute',
        bottom: 30,
        left: 0,
        right: 0,
        alignItems: 'center',
        paddingHorizontal: 20,
    },
    fab: {
        width: '100%',
        maxWidth: 400,
        borderRadius: 20,
        shadowColor: '#d946ef',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 10,
        elevation: 5,
    },
    fabGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 18,
        borderRadius: 20,
    },
    fabText: {
        color: '#FFF',
        fontSize: 18,
        fontWeight: 'bold',
    },
    textLight: {
        color: '#1F2937',
    },
    textLightSecondary: {
        color: '#6B7280',
    },

    // Modal
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        justifyContent: 'flex-end',
        zIndex: 9999,
    },
    modalContent: {
        backgroundColor: '#1c1022',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        padding: 24,
        minHeight: 300,
    },
    modalContentLight: {
        backgroundColor: '#FFFFFF',
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#FFF',
    },
    input: {
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        borderRadius: 16,
        padding: 16,
        color: '#FFF',
        fontSize: 18,
        minHeight: 120,
        textAlignVertical: 'top',
        marginBottom: 20,
    },
    inputLight: {
        backgroundColor: '#F3F4F6',
        color: '#1F2937',
    },
    saveButton: {
        backgroundColor: '#d946ef',
        borderRadius: 16,
        paddingVertical: 16,
        alignItems: 'center',
    },
    saveButtonDisabled: {
        opacity: 0.5,
    },
    saveButtonText: {
        color: '#FFF',
        fontSize: 18,
        fontWeight: 'bold',
    },
});
