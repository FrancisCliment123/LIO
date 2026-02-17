import React, { useEffect, useState } from 'react';
import {
    Modal,
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    SafeAreaView,
    Dimensions,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { getFullCalendar, MonthData } from '../services/streak';
import GlassCard from './GlassCard';

const { width } = Dimensions.get('window');

interface StreakCalendarModalProps {
    visible: boolean;
    onClose: () => void;
    currentStreak: number;
}

const StreakCalendarModal: React.FC<StreakCalendarModalProps> = ({ visible, onClose, currentStreak }) => {
    const [calendarData, setCalendarData] = useState<MonthData[]>([]);

    useEffect(() => {
        if (visible) {
            loadCalendar();
        }
    }, [visible]);

    const loadCalendar = async () => {
        const data = await getFullCalendar();
        setCalendarData(data);
    };

    const weekDays = ['L', 'M', 'M', 'J', 'V', 'S', 'D'];

    return (
        <Modal
            visible={visible}
            transparent={true}
            animationType="slide"
            onRequestClose={onClose}
        >
            <View style={styles.container}>
                <LinearGradient
                    colors={['#0F172A', '#1E1B4B', '#2E1065']}
                    style={styles.background}
                />
                <SafeAreaView style={styles.safeArea}>
                    <View style={styles.header}>
                        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                            <MaterialIcons name="close" size={28} color="#FFF" />
                        </TouchableOpacity>
                        <Text style={styles.headerTitle}>Tu racha</Text>
                        <View style={{ width: 40 }} />
                    </View>

                    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                        <View style={styles.streakSummary}>
                            <View style={styles.streakIconContainer}>
                                <MaterialIcons name="local-fire-department" size={48} color="#F59E0B" />
                            </View>
                            <Text style={styles.streakNumber}>{currentStreak}</Text>
                            <Text style={styles.streakLabel}>{currentStreak === 1 ? 'DÍA SEGUIDO' : 'DÍAS SEGUIDOS'}</Text>
                        </View>

                        {calendarData.map((month, mIndex) => (
                            <GlassCard key={`${month.monthName}-${month.year}`} style={styles.monthCard}>
                                <Text style={styles.monthTitle}>{month.monthName} {month.year}</Text>
                                <View style={styles.weekDaysRow}>
                                    {weekDays.map((day, dIndex) => (
                                        <Text key={dIndex} style={styles.weekDayText}>{day}</Text>
                                    ))}
                                </View>
                                <View style={styles.daysGrid}>
                                    {month.days.map((day, dIndex) => (
                                        <View key={`${mIndex}-${dIndex}`} style={styles.dayCell}>
                                            {!day.isPadding && (
                                                <View style={[
                                                    styles.dayCircle,
                                                    day.completed && styles.dayCircleCompleted,
                                                    day.isToday && styles.dayCircleToday
                                                ]}>
                                                    <Text style={[
                                                        styles.dayText,
                                                        day.completed && styles.dayTextCompleted
                                                    ]}>
                                                        {day.dayNumber}
                                                    </Text>
                                                </View>
                                            )}
                                        </View>
                                    ))}
                                </View>
                            </GlassCard>
                        ))}
                    </ScrollView>
                </SafeAreaView>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    background: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
    },
    safeArea: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 12,
    },
    closeButton: {
        padding: 4,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#FFF',
    },
    scrollContent: {
        padding: 16,
        paddingBottom: 40,
    },
    streakSummary: {
        alignItems: 'center',
        marginBottom: 32,
        marginTop: 16,
    },
    streakIconContainer: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: 'rgba(245, 158, 11, 0.1)',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 12,
    },
    streakNumber: {
        fontSize: 48,
        fontWeight: '800',
        color: '#FFF',
    },
    streakLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: '#A78BFA',
        letterSpacing: 1,
        marginTop: -4,
    },
    monthCard: {
        marginBottom: 24,
        padding: 20,
    },
    monthTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#FFF',
        marginBottom: 16,
    },
    weekDaysRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 12,
        paddingHorizontal: 4,
    },
    weekDayText: {
        width: 32,
        textAlign: 'center',
        color: 'rgba(255, 255, 255, 0.4)',
        fontSize: 12,
        fontWeight: '600',
    },
    daysGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
    },
    dayCell: {
        width: '14.28%', // 100/7
        aspectRatio: 1,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 8,
    },
    dayCircle: {
        width: 34,
        height: 34,
        borderRadius: 17,
        alignItems: 'center',
        justifyContent: 'center',
    },
    dayCircleCompleted: {
        backgroundColor: '#7C3AED',
    },
    dayCircleToday: {
        borderWidth: 2,
        borderColor: '#8B5CF6',
    },
    dayText: {
        color: 'rgba(255, 255, 255, 0.5)',
        fontSize: 14,
        fontWeight: '500',
    },
    dayTextCompleted: {
        color: '#FFF',
        fontWeight: '700',
    },
});

export default StreakCalendarModal;
