
import React, { useRef, useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Modal,
    TouchableOpacity,
    Dimensions,
    Alert,
    ActivityIndicator,
    Platform
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import * as Clipboard from 'expo-clipboard';
import * as MediaLibrary from 'expo-media-library';
import * as Sharing from 'expo-sharing';
import { ShareCard, ShareCardHandle } from './ShareCard';
import { SharePreview } from './SharePreview';

interface ShareModalProps {
    visible: boolean;
    onClose: () => void;
    affirmation: string;
    author?: string;
}

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Preview Dimensions
const PREVIEW_WIDTH = SCREEN_WIDTH * 0.65;
const PREVIEW_HEIGHT = (PREVIEW_WIDTH / 9) * 16;

export const ShareModal: React.FC<ShareModalProps> = ({ visible, onClose, affirmation, author }) => {
    const [showLogo, setShowLogo] = useState(true);
    const [loading, setLoading] = useState(false);

    // Refs for capture
    const hiddenCardRef = useRef<ShareCardHandle>(null);

    // Reset state when opening
    useEffect(() => {
        if (visible) {
            setShowLogo(true);
            setLoading(false);
        }
    }, [visible]);

    const handleCopyText = async () => {
        await Clipboard.setStringAsync(`"${affirmation}" - Lio App`);
        Alert.alert("¡Copiado!", "El texto se ha copiado al portapapeles.");
    };

    const handleToggleLogo = () => {
        setShowLogo(prev => !prev);
    };

    const handleSaveImage = async () => {
        try {
            const { status } = await MediaLibrary.requestPermissionsAsync();
            if (status !== 'granted') {
                Alert.alert("Permiso denegado", "Necesitamos acceso a tus fotos para guardar la imagen.");
                return;
            }

            setLoading(true);
            // Wait slightly for render update if toggled recently
            await new Promise(resolve => setTimeout(resolve, 100));

            if (hiddenCardRef.current) {
                const uri = await hiddenCardRef.current.capture();
                await MediaLibrary.saveToLibraryAsync(uri);
                Alert.alert("¡Guardado!", "La imagen se ha guardado en tu galería.");
            }
        } catch (error) {
            console.error("Error saving image:", error);
            Alert.alert("Error", "No se pudo guardar la imagen.");
        } finally {
            setLoading(false);
        }
    };

    const handleShare = async () => {
        try {
            setLoading(true);
            await new Promise(resolve => setTimeout(resolve, 100));

            if (hiddenCardRef.current) {
                const uri = await hiddenCardRef.current.capture();
                await Sharing.shareAsync(uri, {
                    mimeType: 'image/jpeg',
                    dialogTitle: 'Compartir afirmación de Lio'
                });
            }
        } catch (error) {
            console.error("Error sharing:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal
            visible={visible}
            transparent
            animationType="slide"
            onRequestClose={onClose}
        >
            <View style={styles.container}>
                {/* Blur Background */}
                <BlurView intensity={80} tint="dark" style={StyleSheet.absoluteFill} />

                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                        <MaterialIcons name="close" size={28} color="#FFFFFF" />
                    </TouchableOpacity>
                </View>

                {/* Content */}
                <View style={styles.content}>

                    {/* Preview Card Container */}
                    <View style={styles.previewContainer}>
                        <View style={styles.previewWrapper}>
                            <SharePreview
                                affirmation={affirmation}
                                showLogo={showLogo}
                            />
                        </View>
                    </View>

                    {/* Action Buttons Row */}
                    <View style={styles.actionsRow}>
                        <ActionButton
                            icon="save-alt"
                            label="Guardar"
                            onPress={handleSaveImage}
                        />
                        <ActionButton
                            icon={showLogo ? "visibility-off" : "visibility"}
                            label={showLogo ? "Quitar logo" : "Poner logo"}
                            onPress={handleToggleLogo}
                        />
                        <ActionButton
                            icon="content-copy"
                            label="Copiar"
                            onPress={handleCopyText}
                        />
                    </View>

                    {/* Main Share Button */}
                    <TouchableOpacity
                        style={styles.shareButton}
                        onPress={handleShare}
                        disabled={loading}
                    >
                        {loading ? (
                            <ActivityIndicator color="#000" />
                        ) : (
                            <>
                                <Text style={styles.shareButtonText}>Compartir más</Text>
                                <MaterialIcons name="ios-share" size={20} color="#000" style={{ marginLeft: 8 }} />
                            </>
                        )}
                    </TouchableOpacity>

                </View>

                {/* HIDDEN High-Res Card for Capture */}
                <View
                    style={{ position: 'absolute', left: -4000, top: 0 }}
                    pointerEvents="none"
                >
                    <ShareCard
                        ref={hiddenCardRef}
                        mode="capture"
                        affirmation={affirmation}
                        author={author}
                        showLogo={showLogo}
                    />
                </View>

            </View>
        </Modal>
    );
};

// Helper Component for Action Buttons
const ActionButton = ({ icon, label, onPress }: { icon: any, label: string, onPress: () => void }) => (
    <TouchableOpacity style={styles.actionButton} onPress={onPress}>
        <View style={styles.iconCircle}>
            <MaterialIcons name={icon} size={24} color="#FFFFFF" />
        </View>
        <Text style={styles.actionLabel}>{label}</Text>
    </TouchableOpacity>
);

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'flex-end',
    },
    header: {
        position: 'absolute',
        top: Platform.OS === 'ios' ? 60 : 40,
        right: 20,
        zIndex: 10,
    },
    closeButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(255,255,255,0.2)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    content: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingBottom: 40,
    },
    previewContainer: {
        width: PREVIEW_WIDTH,
        height: PREVIEW_HEIGHT,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 40,
        borderRadius: 20,
        // Shadow for depth
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.5,
        shadowRadius: 20,
        elevation: 10,
    },
    previewWrapper: {
        width: PREVIEW_WIDTH,
        height: PREVIEW_HEIGHT,
        overflow: 'hidden',
        borderRadius: 20,
        backgroundColor: '#000', // Fallback
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
        position: 'relative',
    },
    actionsRow: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 32, // Space between buttons
        marginBottom: 40,
    },
    actionButton: {
        alignItems: 'center',
        width: 80,
    },
    iconCircle: {
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: 'rgba(255,255,255,0.15)',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 8,
    },
    actionLabel: {
        color: '#FFFFFF',
        fontSize: 12,
        fontWeight: '500',
    },
    shareButton: {
        backgroundColor: '#FFFFFF',
        paddingVertical: 16,
        paddingHorizontal: 32,
        borderRadius: 30,
        flexDirection: 'row',
        alignItems: 'center',
        width: '80%',
        justifyContent: 'center',
    },
    shareButtonText: {
        color: '#000000',
        fontSize: 16,
        fontWeight: 'bold',
    },
});
