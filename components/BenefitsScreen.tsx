import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { OnboardingLayout } from './OnboardingLayout';

interface BenefitsScreenProps {
    onNext: () => void;
    onBack: () => void;
}

export const BenefitsScreen: React.FC<BenefitsScreenProps> = ({ onNext, onBack }) => {
    const benefits = [
        {
            icon: 'meditation', // or 'self-improvement'
            title: 'Reduce el estrés',
            description: 'Momentos conscientes durante el día te ayudan a mantenerte centrado y manejar la ansiedad'
        },
        {
            icon: 'sparkles', // or 'star-four-points'
            title: 'Aumenta la positividad',
            description: 'Los recordatorios diarios cambian tu mentalidad hacia la gratitud y el optimismo'
        },
        {
            icon: 'target', // or 'bullseye-arrow'
            title: 'Logra tus metas',
            description: 'El diálogo interno positivo refuerza tus capacidades y motiva la acción'
        }
    ];

    return (
        <OnboardingLayout onContinue={onNext} onSkip={onNext} onBack={onBack} currentStep={6} totalSteps={8}>
            <View style={styles.screenContent}>
                <View style={{ alignItems: 'center', marginBottom: 20 }}>
                    <Image
                        source={require('../assets/frames/lio-logoalone.png')}
                        style={{ width: 80, height: 80, resizeMode: 'contain' }}
                    />
                </View>

                <Text style={styles.screenTitle}>Los beneficios de las afirmaciones diarias</Text>

                <View style={styles.cardsContainer}>
                    {benefits.map((item, index) => (
                        <View key={index} style={styles.benefitCard}>
                            <View style={styles.iconContainer}>
                                <MaterialCommunityIcons name={item.icon as any} size={24} color="#AF25F4" />
                            </View>
                            <View style={styles.textContainer}>
                                <Text style={styles.cardTitle}>{item.title}</Text>
                                <Text style={styles.cardDescription}>{item.description}</Text>
                            </View>
                        </View>
                    ))}
                </View>
            </View>
        </OnboardingLayout>
    );
};

const styles = StyleSheet.create({
    screenContent: {
        flex: 1,
        paddingTop: 20,
        alignItems: 'center',
    },
    screenTitle: {
        fontSize: 24,
        fontWeight: '700',
        color: '#FFFFFF',
        marginBottom: 30,
        textAlign: 'center',
        paddingHorizontal: 20,
        lineHeight: 32,
    },
    cardsContainer: {
        width: '100%',
        gap: 16,
        paddingHorizontal: 4,
    },
    benefitCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(30, 27, 75, 0.6)', // deep purple/blue glass
        borderRadius: 20,
        padding: 20,
        width: '100%',
        borderWidth: 1,
        borderColor: 'rgba(175, 37, 244, 0.2)', // purple accent border
    },
    iconContainer: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: 'rgba(175, 37, 244, 0.1)',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 16,
    },
    textContainer: {
        flex: 1,
    },
    cardTitle: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '700',
        marginBottom: 4,
    },
    cardDescription: {
        color: 'rgba(255, 255, 255, 0.6)',
        fontSize: 13,
        lineHeight: 18,
    },
});
