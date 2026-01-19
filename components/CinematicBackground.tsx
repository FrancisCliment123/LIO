import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { StarParticles } from './StarParticles';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export const CinematicBackground: React.FC = () => {
  return (
    <View style={styles.container}>
      {/* Base gradient - Deep Blue to lighter blue */}
      <LinearGradient
        colors={['#070A1A', '#121B46', '#0F1538']}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={styles.baseGradient}
      />
      
      {/* Radial spotlight gradient near logo area (lilac tint) */}
      <View style={styles.spotlightContainer}>
        <View style={[styles.spotlight, { 
          width: SCREEN_WIDTH * 1.2, 
          height: SCREEN_WIDTH * 1.2,
          borderRadius: SCREEN_WIDTH * 0.6,
        }]}>
          <LinearGradient
            colors={['rgba(167, 139, 250, 0.15)', 'rgba(167, 139, 250, 0.05)', 'transparent']}
            style={StyleSheet.absoluteFill}
          />
        </View>
      </View>

      {/* Vignette effect - subtle fade at edges */}
      <LinearGradient
        colors={['transparent', 'transparent', 'rgba(7, 10, 26, 0.4)', 'rgba(7, 10, 26, 0.6)']}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={styles.vignette}
      />
      
      {/* Top vignette fade */}
      <LinearGradient
        colors={['rgba(7, 10, 26, 0.3)', 'transparent']}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 0.3 }}
        style={styles.topVignette}
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
  baseGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  spotlightContainer: {
    position: 'absolute',
    top: SCREEN_HEIGHT * 0.15,
    left: SCREEN_WIDTH * 0.5 - SCREEN_WIDTH * 0.6,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
  spotlight: {
    position: 'absolute',
  },
  vignette: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 3,
  },
  topVignette: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: SCREEN_HEIGHT * 0.3,
    zIndex: 3,
  },
});
