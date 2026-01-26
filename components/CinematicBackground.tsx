import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { StarParticles } from './StarParticles';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export const CinematicBackground: React.FC = () => {
  return (
    <View style={styles.container}>
      {/* Base gradient - Deep Blue foundation */}
      <LinearGradient
        colors={['#0a0d1f', '#1a1535', '#0f1a3d', '#0a0d1f']}
        locations={[0, 0.3, 0.7, 1]}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={styles.layer}
      />

      {/* Upper diffuse glow - Purple tint */}
      <LinearGradient
        colors={[
          'rgba(147, 112, 219, 0.18)',
          'rgba(147, 112, 219, 0.12)',
          'rgba(147, 112, 219, 0.06)',
          'transparent',
          'transparent'
        ]}
        locations={[0, 0.2, 0.4, 0.6, 1]}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 0.5 }}
        style={styles.layer}
      />

      {/* Center ambient glow - Soft radial effect */}
      <LinearGradient
        colors={[
          'transparent',
          'transparent',
          'rgba(167, 139, 250, 0.08)',
          'rgba(167, 139, 250, 0.04)',
          'transparent'
        ]}
        locations={[0, 0.25, 0.45, 0.65, 1]}
        start={{ x: 0.5, y: 0.3 }}
        end={{ x: 0.5, y: 0.7 }}
        style={styles.layer}
      />

      {/* Bottom gradient - Darker anchor */}
      <LinearGradient
        colors={[
          'transparent',
          'transparent',
          'rgba(10, 13, 31, 0.4)',
          'rgba(10, 13, 31, 0.7)'
        ]}
        locations={[0, 0.6, 0.85, 1]}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={styles.layer}
      />

      {/* Subtle side vignettes */}
      <LinearGradient
        colors={['rgba(10, 13, 31, 0.3)', 'transparent', 'rgba(10, 13, 31, 0.3)']}
        locations={[0, 0.5, 1]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.layer}
      />

      {/* Star Particles Overlay */}
      <StarParticles />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1,
  },
  layer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
});
