import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import Svg, { Path, Defs, LinearGradient as SvgGradient, Stop, Circle } from 'react-native-svg';
import { OnboardingData } from '../types';
import { GeminiSVG } from './GeminiSVG';

const { width } = Dimensions.get('window');

interface ProfileScreenProps {
    onBack: () => void;
    userData?: OnboardingData;
}

const StarIcon = () => (
    <View style={styles.starContainer}>
        <View style={styles.starGlow} />
        <Svg width={100} height={100} viewBox="0 0 100 100">
            <Defs>
                <SvgGradient id="starGradient" x1="0%" x2="100%" y1="0%" y2="100%">
                    <Stop offset="0%" stopColor="#A78BFA" stopOpacity="1" />
                    <Stop offset="100%" stopColor="#4C1D95" stopOpacity="1" />
                </SvgGradient>
            </Defs>
            <Path
                d="M50 5 L63 35 L95 50 L63 65 L50 95 L37 65 L5 50 L37 35 Z"
                fill="url(#starGradient)"
                stroke="white"
                strokeWidth="2"
                strokeLinejoin="round"
            />
            <Circle cx="43" cy="45" r="3" fill="white" />
            <Circle cx="57" cy="45" r="3" fill="white" />
        </Svg>
    </View>
);

const SettingRow: React.FC<{
    icon: keyof typeof MaterialIcons.glyphMap;
    label: string;
    value?: string;
    onPress?: () => void;
    showChevron?: boolean;
}> = ({ icon, label, value, onPress, showChevron = true }) => (
    <TouchableOpacity style={styles.settingRow} onPress={onPress}>
        <View style={styles.settingMain}>
            <MaterialIcons name={icon} size={24} color="#A78BFA" />
            <Text style={styles.settingLabel}>{label}</Text>
        </View>
        <View style={styles.settingRight}>
            {value && <Text style={styles.settingValue}>{value}</Text>}
            {showChevron && <MaterialIcons name="chevron-right" size={20} color="#6B7280" />}
        </View>
    </TouchableOpacity>
);

export const ProfileScreen: React.FC<ProfileScreenProps> = ({ onBack, userData }) => {
    return (
        <View style={styles.container}>
            <LinearGradient
                colors={['#1e1b4b', '#0f172a', '#000000']}
                style={styles.background}
            />

            {/* Stars Background Overlay */}
            <View style={[styles.backgroundOverlay, { opacity: 0.3 }]} />

            <SafeAreaView style={styles.safeArea}>
                <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

                    {/* Header */}
                    <View style={styles.header}>
                        <TouchableOpacity onPress={onBack} style={styles.closeButton}>
                            <MaterialIcons name="close" size={24} color="#FFF" />
                        </TouchableOpacity>
                    </View>

                    {/* Title & Star */}
                    <View style={styles.titleSection}>
                        <Text style={styles.screenTitle}>Perfil</Text>
                        <View style={styles.starContainer}>
                            <GeminiSVG width={100} height={100} showHalo={false} />
                        </View>
                    </View>

                    {/* Premium Card */}
                    <TouchableOpacity style={styles.premiumCard}>
                        <LinearGradient
                            colors={['#7C3AED', '#C084FC']}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                            style={styles.premiumGradient}
                        >
                            <View style={styles.premiumContent}>
                                <View style={styles.premiumTextContainer}>
                                    <Text style={styles.premiumTitle}>Desbloquear todo</Text>
                                    <Text style={styles.premiumDesc}>Todas las categorías, temas, modo de práctica y sin anuncios</Text>
                                </View>
                                <View style={[styles.iconCircle, { backgroundColor: 'rgba(255,255,255,0.2)' }]}>
                                    <MaterialIcons name="auto-awesome" size={24} color="#FFF" />
                                </View>
                            </View>
                            {/* Background Icon */}
                            <View style={styles.premiumBgIcon}>
                                <MaterialIcons name="auto-awesome" size={96} color="white" style={{ opacity: 0.2, transform: [{ rotate: '12deg' }] }} />
                            </View>
                        </LinearGradient>
                    </TouchableOpacity>

                    {/* Stats Row */}
                    <View style={styles.statsCard}>
                        <View style={styles.statsHeader}>
                            <View>
                                <Text style={styles.statsBigNumber}>1</Text>
                                <Text style={styles.statsLabel}>DÍA</Text>
                            </View>

                            <View style={styles.daysRow}>
                                {['Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sa', 'Do'].map((day, index) => {
                                    const isToday = day === 'Ju'; // Hardcoded for demo matching design
                                    const active = isToday;
                                    return (
                                        <View key={day} style={[styles.dayCol, !active && { opacity: 0.4 }]}>
                                            <Text style={[styles.dayText, active && { color: '#A78BFA', fontWeight: 'bold' }]}>{day}</Text>
                                            <View style={[styles.dayCircle, active ? styles.dayCircleActive : styles.dayCircleInactive]}>
                                                {active && <MaterialIcons name="check" size={14} color="#FFF" />}
                                            </View>
                                        </View>
                                    );
                                })}
                            </View>
                        </View>
                    </View>

                    {/* Configuration Group */}
                    <View style={styles.section}>
                        <Text style={styles.sectionHeader}>Configuración</Text>
                        <View style={styles.listContainer}>
                            <SettingRow icon="person" label="Nombre" value={userData?.name || "Usuario"} />
                            <SettingRow icon="wc" label="Género" value={userData?.gender || "No definido"} />
                            <SettingRow icon="dark-mode" label="Tema" value="Oscuro" />
                            <SettingRow icon="notifications" label="Notificaciones" />
                            <SettingRow icon="widgets" label="Widget" />
                            <SettingRow icon="support-agent" label="Centro de atención" />
                            <SettingRow icon="favorite" label="Mis favoritos" />
                            <SettingRow icon="chat-bubble" label="Feedback" />
                        </View>
                    </View>

                    {/* Legal Group */}
                    <View style={styles.section}>
                        <Text style={styles.sectionHeader}>Legal</Text>
                        <View style={styles.listContainer}>
                            <SettingRow icon="shield" label="Política de privacidad" />
                            <SettingRow icon="description" label="Términos de uso" />
                        </View>
                    </View>

                    {/* Footer ID */}
                    <Text style={styles.footerId}>01bc430b44e849c88a2a81658cebec84</Text>

                </ScrollView>
            </SafeAreaView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0F1029',
        zIndex: 50, // Ensure it sits above the CinematicBackground
    },
    background: {
        ...StyleSheet.absoluteFillObject,
    },
    backgroundOverlay: {
        ...StyleSheet.absoluteFillObject,
    },
    safeArea: {
        flex: 1,
    },
    scrollContent: {
        paddingBottom: 40,
    },
    header: {
        paddingHorizontal: 20,
        paddingTop: 10,
        alignItems: 'flex-start',
    },
    closeButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    titleSection: {
        alignItems: 'center',
        marginBottom: 20,
    },
    screenTitle: {
        fontSize: 30,
        fontWeight: '700',
        color: 'white',
        marginBottom: 24,
    },
    starContainer: {
        width: 112,
        height: 112,
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
    },
    starGlow: {
        position: 'absolute',
        width: '100%',
        height: '100%',
        backgroundColor: 'rgba(139, 92, 246, 0.3)',
        borderRadius: 56,
        transform: [{ scale: 0.8 }],
        // blurRadius: 20 not supported natively on View, need image or shadow
        shadowColor: '#8B5CF6',
        shadowOpacity: 0.5,
        shadowRadius: 20,
    },
    premiumCard: {
        marginHorizontal: 20,
        borderRadius: 24,
        marginBottom: 24,
        shadowColor: 'rgba(139, 92, 246, 0.2)',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 1,
        shadowRadius: 10,
        elevation: 5,
        overflow: 'hidden',
    },
    premiumGradient: {
        padding: 20,
        position: 'relative',
    },
    premiumContent: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        zIndex: 10,
    },
    premiumTextContainer: {
        flex: 1,
        paddingRight: 16,
    },
    premiumTitle: {
        color: 'white',
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    premiumDesc: {
        color: 'rgba(255, 255, 255, 0.9)',
        fontSize: 14,
        lineHeight: 20,
    },
    premiumBgIcon: {
        position: 'absolute',
        right: 0,
        bottom: 0,
        transform: [{ translateX: 16 }, { translateY: 16 }],
        zIndex: 1,
    },
    iconCircle: {
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
    },
    statsCard: {
        backgroundColor: 'rgba(30, 27, 75, 0.6)',
        marginHorizontal: 20,
        borderRadius: 24,
        padding: 20,
        marginBottom: 32,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.05)',
    },
    statsHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    statsBigNumber: {
        fontSize: 36,
        fontWeight: 'bold',
        color: '#A78BFA',
    },
    statsLabel: {
        fontSize: 12,
        fontWeight: '600',
        color: '#A78BFA',
        letterSpacing: 1,
    },
    daysRow: {
        flexDirection: 'row',
        gap: 8,
    },
    dayCol: {
        alignItems: 'center',
        gap: 4,
    },
    dayText: {
        fontSize: 10,
        color: '#FFF',
        textTransform: 'uppercase',
    },
    dayCircle: {
        width: 32,
        height: 32,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
    },
    dayCircleActive: {
        backgroundColor: '#8B5CF6',
        shadowColor: '#8B5CF6',
        shadowOpacity: 0.4,
        shadowRadius: 5,
    },
    dayCircleInactive: {
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
    },
    section: {
        marginBottom: 32,
        marginHorizontal: 20,
    },
    sectionHeader: {
        fontSize: 18,
        fontWeight: 'bold',
        color: 'white',
        marginBottom: 12,
        marginLeft: 4,
    },
    listContainer: {
        backgroundColor: 'rgba(30, 27, 75, 0.6)',
        borderRadius: 24,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.05)',
        overflow: 'hidden',
    },
    settingRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255, 255, 255, 0.05)',
    },
    settingMain: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    settingLabel: {
        color: 'white',
        fontSize: 16,
    },
    settingRight: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    settingValue: {
        color: '#9CA3AF',
        fontSize: 14,
    },
    footerId: {
        textAlign: 'center',
        color: '#4B5563',
        fontSize: 10,
        letterSpacing: 1,
        fontFamily: 'Courier', // Monospace
        textTransform: 'uppercase',
    },
});
