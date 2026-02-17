import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Dimensions, Image, Modal, TextInput, FlatList, Switch, Linking, Alert, Keyboard, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';
import Svg, { Path, Defs, LinearGradient as SvgGradient, Stop, Circle } from 'react-native-svg';
import { OnboardingData } from '../types';
import { getStreak, getWeeklyStreak } from '../services/streak';
import RevenueCatUI from 'react-native-purchases-ui';
import Purchases from 'react-native-purchases';

const { width } = Dimensions.get('window');

interface ProfileScreenProps {
    onBack: () => void;
    userData?: OnboardingData;
    onNavigate?: (screen: string) => void;
    onDataUpdate?: (data: Partial<OnboardingData>) => void;
}

const SettingRow: React.FC<{
    icon: keyof typeof MaterialIcons.glyphMap;
    label: string;
    value?: string;
    onPress?: () => void;
    showChevron?: boolean;
}> = ({ icon, label, value, onPress, showChevron = true }) => (
    <TouchableOpacity style={styles.settingRow} onPress={onPress} activeOpacity={onPress ? 0.7 : 1}>
        <View style={styles.settingMain}>
            <MaterialIcons name={icon} size={24} color="#A78BFA" />
            <Text style={styles.settingLabel}>{label}</Text>
        </View>
        <View style={styles.settingRight}>
            {value && <Text style={styles.settingValue}>{value}</Text>}
            {showChevron && onPress && <MaterialIcons name="chevron-right" size={20} color="#6B7280" />}
        </View>
    </TouchableOpacity>
);

const GlassCard: React.FC<{ children: React.ReactNode; style?: any }> = ({ children, style }) => (
    <View style={[styles.glassCard, style]}>
        {children}
    </View>
);

export const ProfileScreen: React.FC<ProfileScreenProps> = ({ onBack, userData, onNavigate, onDataUpdate }) => {
    const [streakCount, setStreakCount] = useState(0);
    const [weeklyData, setWeeklyData] = useState<Array<{ date: string; day: string; completed: boolean; isToday: boolean; isFuture: boolean }>>([]);

    // Editable state
    const [name, setName] = useState(userData?.name || '');
    const [gender, setGender] = useState(userData?.gender || '');
    const [theme, setTheme] = useState('Oscuro');
    const [notificationsEnabled, setNotificationsEnabled] = useState(userData?.notificationsEnabled ?? true);
    const [notificationCount, setNotificationCount] = useState(userData?.notificationCount || 10);
    const [startTime, setStartTime] = useState(userData?.startTime || '9:00');
    const [endTime, setEndTime] = useState(userData?.endTime || '22:00');
    const [streakReminderEnabled, setStreakReminderEnabled] = useState(userData?.streakReminderEnabled ?? true);

    // Modal states
    const [nameModalVisible, setNameModalVisible] = useState(false);
    const [genderModalVisible, setGenderModalVisible] = useState(false);
    const [themeModalVisible, setThemeModalVisible] = useState(false);
    const [notificationsModalVisible, setNotificationsModalVisible] = useState(false);
    const [widgetModalVisible, setWidgetModalVisible] = useState(false);
    const [timeModalVisible, setTimeModalVisible] = useState(false);
    const [editingTimeType, setEditingTimeType] = useState<'start' | 'end' | null>(null);
    const [feedbackModalVisible, setFeedbackModalVisible] = useState(false);
    const [supportModalVisible, setSupportModalVisible] = useState(false);
    const [isPremium, setIsPremium] = useState(false);
    const [retryCount, setRetryCount] = useState(0);

    // Temp editing states
    const [tempName, setTempName] = useState('');
    const [tempGender, setTempGender] = useState('');
    const [feedbackText, setFeedbackText] = useState('');

    useEffect(() => {
        loadStreakData();
        checkPremiumStatus();
    }, []);

    const checkPremiumStatus = async (attempt = 0) => {
        try {
            const customerInfo = await Purchases.getCustomerInfo();
            // Check if user has any active entitlements (including sandbox/dev mode)
            const hasActiveEntitlements = Object.keys(customerInfo.entitlements.active).length > 0;
            setIsPremium(hasActiveEntitlements);
            console.log('Premium status:', hasActiveEntitlements, 'Active entitlements:', Object.keys(customerInfo.entitlements.active));
        } catch (error: any) {
            // If RevenueCat is not configured yet or there's an error, default to free
            if (error?.message?.includes('no singleton instance')) {
                // Only retry up to 3 times
                if (attempt < 3) {
                    console.log(`RevenueCat not configured yet, retrying (${attempt + 1}/3)...`);
                    setTimeout(() => {
                        checkPremiumStatus(attempt + 1);
                    }, 1000);
                } else {
                    console.log('RevenueCat not available after 3 attempts, defaulting to free user');
                    setIsPremium(false);
                }
            } else {
                console.error('Error checking premium status:', error);
                setIsPremium(false);
            }
        }
    };

    const loadStreakData = async () => {
        try {
            const streak = await getStreak();
            const weekly = await getWeeklyStreak();
            setStreakCount(streak.currentStreak);
            setWeeklyData(weekly);
        } catch (error) {
            console.error('Error loading streak data:', error);
        }
    };

    // Save handlers
    const handleSaveName = () => {
        if (tempName.trim()) {
            setName(tempName);
            onDataUpdate?.({ name: tempName });
        }
        setNameModalVisible(false);
    };

    const handleSaveGender = (selectedGender: string) => {
        setGender(selectedGender);
        onDataUpdate?.({ gender: selectedGender });
        setGenderModalVisible(false);
    };

    const saveAndCloseNotifications = () => {
        onDataUpdate?.({
            notificationCount,
            startTime,
            endTime,
            notificationsEnabled,
            streakReminderEnabled
        });
        setNotificationsModalVisible(false);
    };

    const adjustNotificationCount = (delta: number) => {
        const newCount = Math.max(1, Math.min(30, notificationCount + delta));
        setNotificationCount(newCount);
    };

    const selectTime = (time: string) => {
        if (editingTimeType === 'start') {
            setStartTime(time);
        } else {
            setEndTime(time);
        }
        setTimeModalVisible(false);
        setEditingTimeType(null);
    };

    const hours = Array.from({ length: 24 }, (_, i) => `${i}:00`);
    const genderOptions = ['Femenino', 'Masculino', 'Otros', 'Prefiero no decirlo'];
    const themeOptions = ['Sistema', 'Oscuro', 'Día'];

    return (
        <View style={styles.container}>
            <LinearGradient
                colors={['#1e1b4b', '#0f172a', '#000000']}
                style={styles.background}
            />

            <SafeAreaView style={styles.safeArea}>
                <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

                    {/* Header */}
                    <View style={styles.header}>
                        <TouchableOpacity onPress={onBack} style={styles.closeButton}>
                            <MaterialIcons name="close" size={24} color="#FFF" />
                        </TouchableOpacity>
                    </View>

                    {/* Title & Logo */}
                    <View style={styles.titleSection}>
                        <Text style={styles.screenTitle}>Perfil</Text>
                        <View style={styles.starContainer}>
                            <Image
                                source={require('../assets/frames/lio-logoalone.png')}
                                style={{ width: 100, height: 100, resizeMode: 'contain' }}
                            />
                        </View>
                    </View>

                    {/* Premium Card */}
                    <TouchableOpacity
                        style={styles.premiumCard}
                        onPress={() => onNavigate?.('SUBSCRIPTION')}
                        activeOpacity={0.8}
                    >
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
                                    <Image
                                        source={require('../assets/frames/lio-logoalone.png')}
                                        style={{ width: 24, height: 24, resizeMode: 'contain' }}
                                    />
                                </View>
                            </View>
                            <View style={styles.premiumBgIcon}>
                                <Image
                                    source={require('../assets/frames/lio-logoalone.png')}
                                    style={{ width: 96, height: 96, resizeMode: 'contain', opacity: 0.1, transform: [{ rotate: '12deg' }] }}
                                />
                            </View>
                        </LinearGradient>
                    </TouchableOpacity>

                    {/* Stats Row */}
                    <View style={styles.statsCard}>
                        <View style={styles.statsHeader}>
                            <View>
                                <Text style={styles.statsBigNumber}>{streakCount}</Text>
                                <Text style={styles.statsLabel}>{streakCount === 1 ? 'DÍA' : 'DÍAS'}</Text>
                            </View>

                            <View style={styles.daysRow}>
                                {weeklyData.map((dayData, index) => {
                                    const active = dayData.completed;
                                    const isToday = dayData.isToday;
                                    const shouldDim = !active && !isToday;
                                    return (
                                        <View key={index} style={[styles.dayCol, shouldDim && { opacity: 0.4 }]}>
                                            <Text style={[styles.dayText, isToday && { color: '#A78BFA', fontWeight: 'bold' }]}>{dayData.day}</Text>
                                            <View style={[styles.dayCircle, active ? styles.dayCircleActive : styles.dayCircleInactive]}>
                                                {active && <MaterialIcons name="check" size={14} color="#FFF" />}
                                            </View>
                                        </View>
                                    );
                                })}
                            </View>
                        </View>
                    </View>

                    {/* Perfil Section */}
                    <View style={styles.section}>
                        <Text style={styles.sectionHeader}>Perfil</Text>
                        <View style={styles.listContainer}>
                            <SettingRow
                                icon="person"
                                label="Nombre"
                                value={name || "Usuario"}
                                onPress={() => {
                                    setTempName(name);
                                    setNameModalVisible(true);
                                }}
                            />
                            <SettingRow
                                icon="wc"
                                label="Género"
                                value={gender || "No definido"}
                                onPress={() => setGenderModalVisible(true)}
                            />
                        </View>
                    </View>

                    {/* Apariencia Section */}
                    <View style={styles.section}>
                        <Text style={styles.sectionHeader}>Apariencia</Text>
                        <View style={styles.listContainer}>
                            <SettingRow
                                icon="dark-mode"
                                label="Tema"
                                value={theme}
                                onPress={() => setThemeModalVisible(true)}
                            />
                        </View>
                    </View>

                    {/* Configuración Section */}
                    <View style={styles.section}>
                        <Text style={styles.sectionHeader}>Configuración</Text>
                        <View style={styles.listContainer}>
                            <View style={{ opacity: 0.5 }}>
                                <SettingRow
                                    icon="notifications"
                                    label="Notificaciones (En mantenimiento)"
                                // Button disabled as requested
                                />
                            </View>
                            <SettingRow
                                icon="widgets"
                                label="Widget"
                                onPress={() => setWidgetModalVisible(true)}
                            />
                            <SettingRow icon="support-agent" label="Centro de atención" onPress={() => {
                                setSupportModalVisible(true);
                            }} />
                            <SettingRow icon="favorite" label="Mis favoritos" onPress={() => onNavigate?.('FAVORITES')} />
                            <SettingRow icon="chat-bubble" label="Feedback" onPress={() => {
                                setFeedbackModalVisible(true);
                            }} />
                        </View>
                    </View>

                    {/* Legal Group */}
                    <View style={styles.section}>
                        <Text style={styles.sectionHeader}>Legal</Text>
                        <View style={styles.listContainer}>
                            <SettingRow icon="shield" label="Política de privacidad" onPress={async () => {
                                const url = 'https://lio-landingpage.vercel.app/privacy';
                                const canOpen = await Linking.canOpenURL(url);
                                if (canOpen) {
                                    await Linking.openURL(url);
                                } else {
                                    Alert.alert('Error', 'No se pudo abrir el enlace');
                                }
                            }} />
                            <SettingRow icon="description" label="Términos de uso" onPress={async () => {
                                const url = 'https://lio-landingpage.vercel.app/terms';
                                const canOpen = await Linking.canOpenURL(url);
                                if (canOpen) {
                                    await Linking.openURL(url);
                                } else {
                                    Alert.alert('Error', 'No se pudo abrir el enlace');
                                }
                            }} />
                        </View>
                    </View>

                    {/* Footer ID */}
                    <Text style={styles.footerId}>01bc430b44e849c88a2a81658cebec84</Text>

                </ScrollView>
            </SafeAreaView>

            {/* Name Edit Modal */}
            <Modal
                visible={nameModalVisible}
                transparent={true}
                animationType="slide"
                onRequestClose={() => {
                    Keyboard.dismiss();
                    setNameModalVisible(false);
                }}
            >
                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    style={{ flex: 1 }}
                >
                    <TouchableOpacity
                        style={styles.modalOverlay}
                        activeOpacity={1}
                        onPress={() => {
                            Keyboard.dismiss();
                            setNameModalVisible(false);
                        }}
                    >
                        <ScrollView
                            contentContainerStyle={styles.modalContentCentered}
                            keyboardShouldPersistTaps="handled"
                            showsVerticalScrollIndicator={false}
                        >
                            <View onStartShouldSetResponder={() => true}>
                                <GlassCard style={styles.modalCard}>
                                    <View style={styles.modalHeader}>
                                        <Text style={styles.modalTitle}>Editar nombre</Text>
                                        <TouchableOpacity onPress={() => {
                                            Keyboard.dismiss();
                                            setNameModalVisible(false);
                                        }}>
                                            <MaterialIcons name="close" size={24} color="rgba(255,255,255,0.5)" />
                                        </TouchableOpacity>
                                    </View>
                                    <View style={[styles.input, { flexDirection: 'row', alignItems: 'center', paddingVertical: 12 }]}>
                                        <MaterialIcons name="edit" size={20} color="rgba(255,255,255,0.5)" style={{ marginRight: 10 }} />
                                        <TextInput
                                            style={{ flex: 1, color: '#FFF', fontSize: 16 }}
                                            placeholder="Tu nombre"
                                            placeholderTextColor="rgba(255, 255, 255, 0.5)"
                                            value={tempName}
                                            onChangeText={setTempName}
                                            autoFocus={false}
                                            returnKeyType="done"
                                            onSubmitEditing={() => Keyboard.dismiss()}
                                        />
                                    </View>
                                    <TouchableOpacity
                                        onPress={() => Keyboard.dismiss()}
                                        style={[styles.keyboardDismissButton, { marginBottom: 16 }]}
                                        activeOpacity={0.7}
                                    >
                                        <MaterialIcons name="keyboard-hide" size={20} color="#A78BFA" />
                                        <Text style={styles.keyboardDismissText}>Ocultar teclado</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        onPress={() => {
                                            Keyboard.dismiss();
                                            handleSaveName();
                                        }}
                                        style={styles.saveButton}
                                        activeOpacity={0.9}
                                    >
                                        <LinearGradient
                                            colors={['#4C1D95', '#6D28D9', '#7C3AED']}
                                            start={{ x: 0, y: 0 }}
                                            end={{ x: 1, y: 0 }}
                                            style={styles.saveButtonGradient}
                                        >
                                            <Text style={styles.saveButtonText}>Guardar</Text>
                                        </LinearGradient>
                                    </TouchableOpacity>
                                </GlassCard>
                            </View>
                        </ScrollView>
                    </TouchableOpacity>
                </KeyboardAvoidingView>
            </Modal>

            {/* Gender Selection Modal */}
            <Modal
                visible={genderModalVisible}
                transparent={true}
                animationType="slide"
                onRequestClose={() => setGenderModalVisible(false)}
            >
                <TouchableOpacity
                    style={styles.modalOverlay}
                    activeOpacity={1}
                    onPress={() => setGenderModalVisible(false)}
                >
                    <View style={styles.modalContent}>
                        <GlassCard style={styles.modalCard}>
                            <View style={styles.modalHeader}>
                                <Text style={styles.modalTitle}>Seleccionar género</Text>
                                <TouchableOpacity onPress={() => setGenderModalVisible(false)}>
                                    <MaterialIcons name="close" size={24} color="rgba(255,255,255,0.5)" />
                                </TouchableOpacity>
                            </View>
                            {genderOptions.map((option) => {
                                let iconName: keyof typeof MaterialIcons.glyphMap = 'person-outline';
                                if (option.includes('Masculino')) iconName = 'male';
                                else if (option.includes('Femenino')) iconName = 'female';
                                else if (option.includes('Otros')) iconName = 'transgender'; // Use transgender for 'Otros'
                                else if (option.includes('Prefiero')) iconName = 'block';

                                return (
                                    <TouchableOpacity
                                        key={option}
                                        style={[
                                            styles.optionRow,
                                            gender === option && styles.optionRowSelected
                                        ]}
                                        onPress={() => handleSaveGender(option)}
                                    >
                                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                                            <MaterialIcons name={iconName} size={24} color={gender === option ? "#A78BFA" : "rgba(255,255,255,0.5)"} />
                                            <Text style={[styles.optionText, gender === option && { color: '#A78BFA', fontWeight: 'bold' }]}>{option}</Text>
                                        </View>
                                        <View style={[styles.radioCircle, gender === option && styles.radioCircleSelected]}>
                                            {gender === option && <View style={styles.radioDot} />}
                                        </View>
                                    </TouchableOpacity>
                                );
                            })}
                        </GlassCard>
                    </View>
                </TouchableOpacity>
            </Modal>

            {/* Theme Selection Modal */}
            <Modal
                visible={themeModalVisible}
                transparent={true}
                animationType="slide"
                onRequestClose={() => setThemeModalVisible(false)}
            >
                <TouchableOpacity
                    style={styles.modalOverlay}
                    activeOpacity={1}
                    onPress={() => setThemeModalVisible(false)}
                >
                    <View style={styles.modalContent}>
                        <GlassCard style={styles.modalCard}>
                            <View style={styles.modalHeader}>
                                <Text style={styles.modalTitle}>Seleccionar tema</Text>
                                <TouchableOpacity onPress={() => setThemeModalVisible(false)}>
                                    <MaterialIcons name="close" size={24} color="rgba(255,255,255,0.5)" />
                                </TouchableOpacity>
                            </View>
                            {themeOptions.map((option) => {
                                let iconName: keyof typeof MaterialIcons.glyphMap = 'brightness-6'; // Default for system?
                                if (option.includes('Oscuro')) iconName = 'dark-mode';
                                else if (option.includes('Día') || option.includes('Claro')) iconName = 'light-mode';
                                else if (option.includes('Sistema')) iconName = 'settings-system-daydream';

                                return (
                                    <TouchableOpacity
                                        key={option}
                                        style={[
                                            styles.optionRow,
                                            theme === option && styles.optionRowSelected
                                        ]}
                                        onPress={() => {
                                            setTheme(option);
                                            setThemeModalVisible(false);
                                        }}
                                    >
                                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                                            <MaterialIcons name={iconName} size={24} color={theme === option ? "#A78BFA" : "rgba(255,255,255,0.5)"} />
                                            <Text style={[styles.optionText, theme === option && { color: '#A78BFA', fontWeight: 'bold' }]}>{option}</Text>
                                        </View>
                                        <View style={[styles.radioCircle, theme === option && styles.radioCircleSelected]}>
                                            {theme === option && <View style={styles.radioDot} />}
                                        </View>
                                    </TouchableOpacity>
                                );
                            })}
                        </GlassCard>
                    </View>
                </TouchableOpacity>
            </Modal>

            {/* Notifications Modal */}
            <Modal
                visible={notificationsModalVisible}
                transparent={true}
                animationType="slide"
                onRequestClose={() => setNotificationsModalVisible(false)}
            >
                <View style={styles.fullScreenModal}>
                    <LinearGradient
                        colors={['#1e1b4b', '#0f172a', '#000000']}
                        style={styles.background}
                    />
                    <SafeAreaView style={styles.safeArea}>
                        <View style={styles.modalHeader}>
                            <TouchableOpacity onPress={saveAndCloseNotifications} style={styles.backButton}>
                                <MaterialIcons name="arrow-back" size={24} color="#FFF" />
                            </TouchableOpacity>
                            <Text style={styles.modalTitleCentered}>Notificaciones</Text>
                            <View style={{ width: 40 }} />
                        </View>

                        <ScrollView style={styles.notificationSettings}>
                            {/* Daily Notifications Toggle */}
                            <View style={styles.notificationCard}>
                                <View style={styles.notificationRow}>
                                    <View style={styles.notificationTextContainer}>
                                        <Text style={styles.notificationTitle}>Notificaciones diarias</Text>
                                        <Text style={styles.notificationSubtitle}>Recibe afirmaciones a lo largo del día</Text>
                                    </View>
                                    <Switch
                                        value={notificationsEnabled}
                                        onValueChange={setNotificationsEnabled}
                                        trackColor={{ false: '#3e3e3e', true: '#A78BFA' }}
                                        thumbColor={notificationsEnabled ? '#7C3AED' : '#f4f3f4'}
                                    />
                                </View>
                            </View>

                            {/* Notification Settings Card */}
                            {notificationsEnabled && (
                                <View style={styles.notificationCard}>
                                    {/* Count Selector */}
                                    <View style={styles.countSelector}>
                                        <Text style={styles.countLabel}>¿Cuántas?</Text>
                                        <View style={styles.countControls}>
                                            <TouchableOpacity
                                                style={styles.countButton}
                                                onPress={() => adjustNotificationCount(-1)}
                                            >
                                                <MaterialIcons name="remove" size={20} color="#FFFFFF" />
                                            </TouchableOpacity>
                                            <Text style={styles.countValue}>{notificationCount}x</Text>
                                            <TouchableOpacity
                                                style={styles.countButton}
                                                onPress={() => adjustNotificationCount(1)}
                                            >
                                                <MaterialIcons name="add" size={20} color="#FFFFFF" />
                                            </TouchableOpacity>
                                        </View>
                                    </View>

                                    {/* Time Selectors */}
                                    <TouchableOpacity
                                        style={styles.timeRow}
                                        onPress={() => {
                                            setEditingTimeType('start');
                                            setTimeModalVisible(true);
                                        }}
                                    >
                                        <Text style={styles.timeLabel}>Empieza a las</Text>
                                        <View style={styles.timeValue}>
                                            <Text style={styles.timeValueText}>{startTime}</Text>
                                            <MaterialIcons name="expand-more" size={18} color="#A78BFA" />
                                        </View>
                                    </TouchableOpacity>

                                    <TouchableOpacity
                                        style={styles.timeRow}
                                        onPress={() => {
                                            setEditingTimeType('end');
                                            setTimeModalVisible(true);
                                        }}
                                    >
                                        <Text style={styles.timeLabel}>Termina a las</Text>
                                        <View style={styles.timeValue}>
                                            <Text style={styles.timeValueText}>{endTime}</Text>
                                            <MaterialIcons name="expand-more" size={18} color="#A78BFA" />
                                        </View>
                                    </TouchableOpacity>

                                    {/* Summary */}
                                    <Text style={styles.notificationSummary}>
                                        Recibirás {notificationCount} notificaciones al día entre las {startTime} y las {endTime}
                                    </Text>
                                </View>
                            )}

                            {/* Streak Reminder */}
                            <View style={styles.notificationCard}>
                                <View style={styles.notificationRow}>
                                    <View style={styles.notificationTextContainer}>
                                        <Text style={styles.notificationTitle}>Recordatorio de racha diaria</Text>
                                        <Text style={styles.notificationSubtitle}>Recordatorio nocturno para mantener tu racha</Text>
                                    </View>
                                    <Switch
                                        value={streakReminderEnabled}
                                        onValueChange={setStreakReminderEnabled}
                                        trackColor={{ false: '#3e3e3e', true: '#A78BFA' }}
                                        thumbColor={streakReminderEnabled ? '#7C3AED' : '#f4f3f4'}
                                    />
                                </View>
                            </View>
                        </ScrollView>
                    </SafeAreaView>
                </View>
            </Modal>

            {/* Time Selection Modal - Using Working Onboarding Pattern */}
            <Modal
                visible={timeModalVisible}
                transparent={true}
                animationType="slide"
                onRequestClose={() => setTimeModalVisible(false)}
            >
                <TouchableOpacity
                    style={styles.modalOverlay}
                    activeOpacity={1}
                    onPress={() => setTimeModalVisible(false)}
                >
                    <View style={styles.modalContent}>
                        <GlassCard style={styles.timePickerContainer}>
                            <View style={{ width: '100%', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                                <Text style={[styles.modalTitleCentered, { marginBottom: 0, flex: 0 }]}>
                                    {editingTimeType === 'start' ? 'Hora de inicio' : 'Hora de fin'}
                                </Text>
                                <TouchableOpacity onPress={() => setTimeModalVisible(false)}>
                                    <MaterialIcons name="close" size={24} color="rgba(255,255,255,0.5)" />
                                </TouchableOpacity>
                            </View>

                            <FlatList
                                data={hours}
                                keyExtractor={(item) => item}
                                style={{ width: '100%' }}
                                initialScrollIndex={parseInt((editingTimeType === 'start' ? startTime : endTime) || '0')}
                                getItemLayout={(data, index) => (
                                    { length: 61, offset: 61 * index, index }
                                )}
                                renderItem={({ item }) => (
                                    <TouchableOpacity
                                        style={[
                                            styles.timeOption,
                                            (editingTimeType === 'start' ? startTime === item : endTime === item) && styles.timeOptionActive
                                        ]}
                                        onPress={() => selectTime(item)}
                                    >
                                        <Text style={[
                                            styles.timeOptionText,
                                            (editingTimeType === 'start' ? startTime === item : endTime === item) && styles.timeOptionTextActive
                                        ]}>
                                            {item}
                                        </Text>
                                        {(editingTimeType === 'start' ? startTime === item : endTime === item) && (
                                            <MaterialIcons name="check" size={20} color="#A78BFA" />
                                        )}
                                    </TouchableOpacity>
                                )}
                                showsVerticalScrollIndicator={false}
                            />
                        </GlassCard>
                    </View>
                </TouchableOpacity>
            </Modal>

            {/* Widget Instructions Modal */}
            <Modal
                visible={widgetModalVisible}
                transparent={true}
                animationType="slide"
                onRequestClose={() => setWidgetModalVisible(false)}
            >
                <View style={styles.fullScreenModal}>
                    <LinearGradient
                        colors={['#1e1b4b', '#0f172a', '#000000']}
                        style={styles.background}
                    />
                    <SafeAreaView style={styles.safeArea}>
                        <View style={[styles.modalHeader, { marginTop: 50, paddingHorizontal: 20 }]}>
                            <TouchableOpacity onPress={() => setWidgetModalVisible(false)} style={styles.backButton}>
                                <MaterialIcons name="arrow-back" size={24} color="#FFF" />
                            </TouchableOpacity>
                            <Text style={styles.modalTitleCentered}>Widget</Text>
                            <View style={{ width: 40 }} />
                        </View>

                        <ScrollView style={styles.widgetContent}>
                            {/* Phone Mockup */}
                            <View style={styles.phoneMockup}>
                                <View style={styles.phoneScreen}>
                                    {/* Notch */}
                                    <View style={styles.phoneNotch} />

                                    {/* Widget Preview */}
                                    <View style={styles.widgetPreview}>
                                        <Text style={styles.widgetText}>You are capable of{'\n'}amazing things today.</Text>
                                    </View>

                                    {/* App Grid */}
                                    <View style={styles.appGrid}>
                                        {Array(8).fill(0).map((_, i) => (
                                            <View key={i} style={styles.appIcon} />
                                        ))}
                                    </View>
                                </View>
                            </View>

                            {/* Instructions */}
                            <Text style={styles.widgetSectionTitle}>Homescreen widgets</Text>
                            <View style={styles.instructionsList}>
                                <View style={styles.instructionRow}>
                                    <Text style={styles.instructionNumber}>1.</Text>
                                    <Text style={styles.instructionText}>Long press on your home screen</Text>
                                </View>
                                <View style={styles.instructionRow}>
                                    <Text style={styles.instructionNumber}>2.</Text>
                                    <Text style={styles.instructionText}>Tap the + button in the top corner</Text>
                                </View>
                                <View style={styles.instructionRow}>
                                    <Text style={styles.instructionNumber}>3.</Text>
                                    <Text style={styles.instructionText}>Search for "Lio" and add the widget</Text>
                                </View>
                            </View>
                        </ScrollView>
                    </SafeAreaView>
                </View>
            </Modal>

            {/* Feedback Modal */}
            <Modal
                visible={feedbackModalVisible}
                transparent={true}
                animationType="slide"
                onRequestClose={() => {
                    Keyboard.dismiss();
                    setFeedbackModalVisible(false);
                }}
            >
                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    style={{ flex: 1 }}
                >
                    <TouchableOpacity
                        style={styles.modalOverlay}
                        activeOpacity={1}
                        onPress={() => {
                            Keyboard.dismiss();
                            setFeedbackModalVisible(false);
                        }}
                    >
                        <ScrollView
                            contentContainerStyle={styles.modalContentCentered}
                            keyboardShouldPersistTaps="handled"
                            showsVerticalScrollIndicator={false}
                        >
                            <View onStartShouldSetResponder={() => true}>
                                <GlassCard style={styles.modalCard}>
                                    <View style={styles.modalHeader}>
                                        <Text style={styles.modalTitle}>Enviar Feedback</Text>
                                        <TouchableOpacity onPress={() => {
                                            Keyboard.dismiss();
                                            setFeedbackModalVisible(false);
                                            setFeedbackText('');
                                        }}>
                                            <MaterialIcons name="close" size={24} color="rgba(255,255,255,0.5)" />
                                        </TouchableOpacity>
                                    </View>
                                    <Text style={styles.feedbackSubtitle}>
                                        ¿Tienes alguna sugerencia o comentario? Nos encantaría escucharte.
                                    </Text>
                                    <View style={[styles.input, { height: 120, paddingTop: 16, alignItems: 'flex-start' }]}>
                                        <TextInput
                                            style={{ flex: 1, color: '#FFF', fontSize: 16, textAlignVertical: 'top', width: '100%' }}
                                            placeholder="Escribe tu comentario aquí..."
                                            placeholderTextColor="rgba(255, 255, 255, 0.4)"
                                            value={feedbackText}
                                            onChangeText={setFeedbackText}
                                            multiline={true}
                                            numberOfLines={5}
                                            maxLength={500}
                                            autoFocus={false}
                                            blurOnSubmit={false}
                                            returnKeyType="done"
                                            onSubmitEditing={() => Keyboard.dismiss()}
                                        />
                                    </View>
                                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 8, marginBottom: 16 }}>
                                        <TouchableOpacity
                                            onPress={() => Keyboard.dismiss()}
                                            style={styles.keyboardDismissButton}
                                            activeOpacity={0.7}
                                        >
                                            <MaterialIcons name="keyboard-hide" size={20} color="#A78BFA" />
                                            <Text style={styles.keyboardDismissText}>Ocultar teclado</Text>
                                        </TouchableOpacity>
                                        <Text style={styles.characterCount}>{feedbackText.length}/500</Text>
                                    </View>
                                    <TouchableOpacity
                                        onPress={() => {
                                            if (feedbackText.trim()) {
                                                Keyboard.dismiss();
                                                Linking.openURL(`mailto:feedback@lioapp.com?subject=Feedback sobre Lio App&body=${encodeURIComponent(feedbackText)}`);
                                                setFeedbackModalVisible(false);
                                                setFeedbackText('');
                                            } else {
                                                Alert.alert('Feedback vacío', 'Por favor escribe algo antes de enviar.');
                                            }
                                        }}
                                        style={styles.saveButton}
                                        activeOpacity={0.9}
                                    >
                                        <LinearGradient
                                            colors={['#4C1D95', '#6D28D9', '#7C3AED']}
                                            start={{ x: 0, y: 0 }}
                                            end={{ x: 1, y: 0 }}
                                            style={styles.saveButtonGradient}
                                        >
                                            <Text style={styles.saveButtonText}>Enviar</Text>
                                        </LinearGradient>
                                    </TouchableOpacity>
                                </GlassCard>
                            </View>
                        </ScrollView>
                    </TouchableOpacity>
                </KeyboardAvoidingView>
            </Modal>

            {/* Support Center Modal */}
            <Modal
                visible={supportModalVisible}
                transparent={true}
                animationType="slide"
                onRequestClose={() => setSupportModalVisible(false)}
            >
                <TouchableOpacity
                    style={styles.modalOverlay}
                    activeOpacity={1}
                    onPress={() => setSupportModalVisible(false)}
                >
                    <View style={styles.modalContent} onStartShouldSetResponder={() => true}>
                        <GlassCard style={[styles.modalCard, { paddingVertical: 40 }]}>
                            <TouchableOpacity
                                style={styles.modalCloseButton}
                                onPress={() => setSupportModalVisible(false)}
                            >
                                <MaterialIcons name="close" size={24} color="rgba(255,255,255,0.5)" />
                            </TouchableOpacity>

                            <View style={styles.supportIconContainer}>
                                <View style={styles.supportIconCircle}>
                                    <MaterialIcons name="info-outline" size={40} color="#A78BFA" />
                                </View>
                            </View>

                            <Text style={[styles.modalTitle, { textAlign: 'center', marginBottom: 8, fontSize: 24 }]}>Centro de Atención</Text>

                            {!isPremium ? (
                                <>
                                    <Text style={[styles.modalTitle, { textAlign: 'center', marginBottom: 8, fontSize: 20, fontWeight: '600' }]}>Plan Gratuito</Text>
                                    <Text style={styles.supportSubtitle}>
                                        No tienes una suscripción activa. Desbloquea todas las funciones premium.
                                    </Text>
                                    <TouchableOpacity
                                        onPress={async () => {
                                            setSupportModalVisible(false);
                                            try {
                                                await RevenueCatUI.presentPaywall();
                                            } catch (error) {
                                                console.error('Error opening paywall:', error);
                                            }
                                        }}
                                        style={[styles.saveButton, { marginTop: 24 }]}
                                        activeOpacity={0.9}
                                    >
                                        <LinearGradient
                                            colors={['#4C1D95', '#6D28D9', '#7C3AED']}
                                            start={{ x: 0, y: 0 }}
                                            end={{ x: 1, y: 0 }}
                                            style={styles.saveButtonGradient}
                                        >
                                            <Text style={styles.saveButtonText}>Ver planes premium</Text>
                                        </LinearGradient>
                                    </TouchableOpacity>
                                </>
                            ) : (
                                <>
                                    <Text style={styles.supportSubtitle}>
                                        ¿Cómo podemos ayudarte?
                                    </Text>
                                    <TouchableOpacity
                                        onPress={async () => {
                                            setSupportModalVisible(false);
                                            try {
                                                await RevenueCatUI.presentCustomerCenter();
                                            } catch (error) {
                                                console.error('Error opening customer center:', error);
                                            }
                                        }}
                                        style={[styles.saveButton, { marginTop: 24, marginBottom: 12 }]}
                                        activeOpacity={0.9}
                                    >
                                        <LinearGradient
                                            colors={['#4C1D95', '#6D28D9', '#7C3AED']}
                                            start={{ x: 0, y: 0 }}
                                            end={{ x: 1, y: 0 }}
                                            style={styles.saveButtonGradient}
                                        >
                                            <Text style={styles.saveButtonText}>Gestionar suscripción</Text>
                                        </LinearGradient>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        onPress={() => {
                                            setSupportModalVisible(false);
                                            Linking.openURL('mailto:support@lioapp.com?subject=Soporte Lio App');
                                        }}
                                        style={styles.secondaryButton}
                                        activeOpacity={0.9}
                                    >
                                        <Text style={styles.secondaryButtonText}>Contactar soporte</Text>
                                    </TouchableOpacity>
                                </>
                            )}
                        </GlassCard>
                    </View>
                </TouchableOpacity>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0F1029',
    },
    background: {
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
        fontFamily: 'Courier',
        textTransform: 'uppercase',
    },
    // Modal styles
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    modalContent: {
        width: '100%',
        maxHeight: '80%',
    },
    glassCard: {
        backgroundColor: 'rgba(30, 27, 75, 0.95)',
        borderRadius: 24,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.1)',
        padding: 24,
    },
    modalCard: {
        maxHeight: 500,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: '#FFF',
    },
    input: {
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        borderRadius: 12,
        padding: 16,
        color: '#FFF',
        fontSize: 16,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.2)',
    },
    saveButton: {
        borderRadius: 12,
        overflow: 'hidden',
    },
    saveButtonGradient: {
        paddingVertical: 16,
        alignItems: 'center',
    },
    saveButtonText: {
        color: '#FFF',
        fontSize: 16,
        fontWeight: '600',
    },
    optionRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 16,
        paddingHorizontal: 4,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255, 255, 255, 0.05)',
    },
    optionRowSelected: {
        backgroundColor: 'rgba(124, 58, 237, 0.1)',
    },
    optionText: {
        color: '#FFF',
        fontSize: 16,
    },
    radioCircle: {
        width: 20,
        height: 20,
        borderRadius: 10,
        borderWidth: 2,
        borderColor: 'rgba(255, 255, 255, 0.3)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    radioCircleSelected: {
        borderColor: '#A78BFA',
    },
    radioDot: {
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: '#A78BFA',
    },
    fullScreenModal: {
        flex: 1,
        backgroundColor: '#0F1029',
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    modalTitleCentered: {
        fontSize: 20,
        fontWeight: '700',
        color: '#FFF',
        flex: 1,
        textAlign: 'center',
    },
    // Notifications styles
    notificationSettings: {
        flex: 1,
        paddingHorizontal: 20,
    },
    notificationCard: {
        backgroundColor: 'rgba(30, 27, 75, 0.8)',
        borderRadius: 24,
        padding: 20,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.05)',
    },
    notificationRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    notificationTextContainer: {
        flex: 1,
        paddingRight: 16,
    },
    notificationTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#FFF',
        marginBottom: 4,
    },
    notificationSubtitle: {
        fontSize: 13,
        color: 'rgba(255, 255, 255, 0.6)',
    },
    countSelector: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingBottom: 16,
        marginBottom: 16,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255, 255, 255, 0.05)',
    },
    countLabel: {
        fontSize: 16,
        fontWeight: '600',
        color: '#FFF',
    },
    countControls: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 20,
    },
    countButton: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: '#7C3AED',
        alignItems: 'center',
        justifyContent: 'center',
    },
    countValue: {
        fontSize: 24,
        fontWeight: '700',
        color: '#FFF',
        minWidth: 60,
        textAlign: 'center',
    },
    timeRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255, 255, 255, 0.05)',
    },
    timeLabel: {
        fontSize: 16,
        color: '#FFF',
    },
    timeValue: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 12,
    },
    timeValueText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#FFF',
    },
    notificationSummary: {
        fontSize: 13,
        color: 'rgba(255, 255, 255, 0.6)',
        textAlign: 'center',
        marginTop: 16,
        fontStyle: 'italic',
        lineHeight: 18,
    },

    timePickerContainer: {
        width: '100%',
        padding: 24,
        alignItems: 'center',
    },
    timeList: {
        maxHeight: 300,
    },
    timeOption: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255, 255, 255, 0.05)',
    },
    timeOptionActive: {
        backgroundColor: 'rgba(124, 58, 237, 0.1)',
    },
    timeOptionText: {
        fontSize: 16,
        color: '#FFF',
    },
    timeOptionTextActive: {
        color: '#A78BFA',
        fontWeight: '600',
    },
    // Widget styles
    widgetContent: {
        flex: 1,
        paddingHorizontal: 20,
    },
    phoneMockup: {
        alignItems: 'center',
        marginVertical: 32,
    },
    phoneScreen: {
        width: 280,
        height: 500,
        backgroundColor: '#1a1a1a',
        borderRadius: 32,
        padding: 20,
        borderWidth: 8,
        borderColor: '#333',
    },
    phoneNotch: {
        width: 120,
        height: 28,
        backgroundColor: '#000',
        borderRadius: 14,
        alignSelf: 'center',
        marginBottom: 20,
    },
    widgetPreview: {
        backgroundColor: 'rgba(124, 58, 237, 0.15)',
        borderRadius: 16,
        padding: 16,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: 'rgba(124, 58, 237, 0.3)',
    },
    widgetText: {
        fontSize: 14,
        color: '#A78BFA',
        fontWeight: '500',
        lineHeight: 20,
    },
    appGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 16,
        justifyContent: 'space-between',
    },
    appIcon: {
        width: 56,
        height: 56,
        backgroundColor: '#333',
        borderRadius: 12,
    },
    widgetSectionTitle: {
        fontSize: 20,
        fontWeight: '600',
        color: '#FFF',
        marginBottom: 20,
        textAlign: 'center',
    },
    instructionsList: {
        gap: 16,
        marginBottom: 32,
    },
    instructionRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: 12,
    },
    instructionNumber: {
        fontSize: 16,
        fontWeight: '600',
        color: '#A78BFA',
    },
    instructionText: {
        fontSize: 16,
        color: 'rgba(255, 255, 255, 0.8)',
        flex: 1,
        lineHeight: 24,
    },
    // Feedback Modal Styles
    feedbackSubtitle: {
        fontSize: 14,
        color: 'rgba(255, 255, 255, 0.7)',
        marginBottom: 20,
        lineHeight: 20,
    },
    characterCount: {
        fontSize: 12,
        color: 'rgba(255, 255, 255, 0.5)',
        textAlign: 'right',
        marginTop: 8,
        marginBottom: 16,
    },
    // Support Center Modal Styles
    modalCloseButton: {
        position: 'absolute',
        top: 16,
        right: 16,
        zIndex: 10,
    },
    supportIconContainer: {
        alignItems: 'center',
        marginBottom: 20,
    },
    supportIconCircle: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: 'rgba(167, 139, 250, 0.15)',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 2,
        borderColor: 'rgba(167, 139, 250, 0.3)',
    },
    supportSubtitle: {
        fontSize: 15,
        color: 'rgba(255, 255, 255, 0.7)',
        textAlign: 'center',
        lineHeight: 22,
        paddingHorizontal: 16,
    },
    secondaryButton: {
        width: '100%',
        borderRadius: 16,
        paddingVertical: 16,
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.1)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    secondaryButtonText: {
        color: '#A78BFA',
        fontSize: 16,
        fontWeight: '600',
    },
    modalContentCentered: {
        flexGrow: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    keyboardDismissButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        padding: 8,
        paddingHorizontal: 12,
        backgroundColor: 'rgba(167, 139, 250, 0.1)',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: 'rgba(167, 139, 250, 0.2)',
    },
    keyboardDismissText: {
        fontSize: 13,
        color: '#A78BFA',
        fontWeight: '500',
    },
});
