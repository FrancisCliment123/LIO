import React from 'react';
import { View, StyleSheet, Dimensions, Animated, Easing } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { StarParticles } from './StarParticles';

const AnimatedGradient = Animated.createAnimatedComponent(LinearGradient);
const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

import { ThemeType, getTheme } from '../styles/theme';

export const CinematicBackground: React.FC<{ theme?: ThemeType }> = ({ theme = 'dark' }) => {
  const breathingAnim = React.useRef(new Animated.Value(0)).current;
  const currentTheme = getTheme(theme);

  React.useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(breathingAnim, {
          toValue: 1,
          duration: 6000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(breathingAnim, {
          toValue: 0,
          duration: 6000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  return (
    <View style={styles.container}>
      {/* Base gradient - Dynamic based on theme */}
      <LinearGradient
        colors={currentTheme.background.primary as any}
        locations={currentTheme.background.locations as any}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={styles.layer}
      />

      {/* Upper diffuse glow - Purple tint (Breathing) */}
      <AnimatedGradient
        colors={[
          theme === 'dark' ? 'rgba(147, 112, 219, 0.12)' : 'rgba(124, 58, 237, 0.05)',
          theme === 'dark' ? 'rgba(147, 112, 219, 0.08)' : 'rgba(124, 58, 237, 0.02)',
          'transparent',
          'transparent'
        ]}
        locations={[0, 0.4, 0.6, 1]}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 0.8 }}
        style={[styles.layer, {
          opacity: breathingAnim.interpolate({
            inputRange: [0, 1],
            outputRange: [0.3, 0.6]
          })
        }]}
      />

      {/* Star Particles Overlay - Pass theme color */}
      <StarParticles color={currentTheme.particles.color} opacity={currentTheme.particles.opacity} />

      {/* Subtle vignettes for depth (Dark mode only or very subtle in light) */}
      <LinearGradient
        colors={[
          theme === 'dark' ? 'rgba(10, 13, 31, 0.3)' : 'transparent',
          'transparent',
          theme === 'dark' ? 'rgba(10, 13, 31, 0.5)' : 'rgba(255, 255, 255, 0.2)'
        ]}
        locations={[0, 0.5, 1]}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={styles.layer}
        pointerEvents="none"
      />
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
