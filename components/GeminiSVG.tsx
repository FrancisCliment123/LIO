import React, { useEffect, useRef, useMemo } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SvgXml } from 'react-native-svg';
import { GEMINI_SVG_CONTENT } from './gemini-svg-content';

interface GeminiSVGProps {
  width?: number;
  height?: number;
}

// SVG content is now pre-processed (background removed + shape-rendering added)
// to avoid expensive runtime regex operations


export const GeminiSVG = React.memo<GeminiSVGProps & { showHalo?: boolean }>((
  {
    width = 260,
    height = 260,
    showHalo = true
  }) => {
  // Use pre-processed SVG directly
  const svgXml = GEMINI_SVG_CONTENT;

  // Float animation - only run when showHalo is true for better performance
  const floatAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!showHalo) return; // Skip animation if halo is disabled

    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, {
          toValue: 1,
          duration: 3000,
          useNativeDriver: true,
        }),
        Animated.timing(floatAnim, {
          toValue: 0,
          duration: 3000,
          useNativeDriver: true,
        }),
      ])
    );

    animation.start();

    return () => animation.stop();
  }, [floatAnim, showHalo]);

  const translateY = floatAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -8],
  });

  // SVG viewBox is "0 0 2048 2048", so maintain aspect ratio
  const aspectRatio = 2048 / 2048; // 1:1
  const calculatedHeight = width * aspectRatio;
  const haloSize = width * 1.4;

  return (
    <View style={[styles.container, { width, height: calculatedHeight }]} pointerEvents="none">
      {/* Halo/Glow behind logo */}
      {showHalo && (
        <View style={[styles.haloContainer, { width: haloSize, height: haloSize }]}>
          <LinearGradient
            colors={['rgba(167, 139, 250, 0.2)', 'rgba(167, 139, 250, 0.1)', 'transparent']}
            style={[styles.halo, { width: haloSize, height: haloSize, borderRadius: haloSize / 2 }]}
          />
        </View>
      )}

      {/* Logo with float animation */}
      <Animated.View
        style={[
          styles.logoWrapper,
          {
            width,
            height: calculatedHeight,
            transform: showHalo ? [{ translateY }] : [], // Only animate if halo is enabled
          },
        ]}
      >
        <View style={styles.svgContainer}>
          <SvgXml
            xml={svgXml}
            width={width}
            height={calculatedHeight}
          />
        </View>
      </Animated.View>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
    position: 'relative',
  },
  haloContainer: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  halo: {
    position: 'absolute',
  },
  logoWrapper: {
    position: 'relative',
    zIndex: 2,
  },
  svgContainer: {
    overflow: 'visible',
    // Enable hardware acceleration and smoothing
    transform: [{ scale: 1 }],
  },
});
