import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';

interface GlassCardProps {
    children: React.ReactNode;
    style?: ViewStyle | ViewStyle[];
}

const GlassCard: React.FC<GlassCardProps> = ({ children, style }) => (
    <View style={[styles.glassCard, style]}>
        {children}
    </View>
);

const styles = StyleSheet.create({
    glassCard: {
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        borderRadius: 24,
        padding: 16,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.1)',
    },
});

export default GlassCard;
