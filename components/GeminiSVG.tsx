import React, { useEffect, useRef, useMemo } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SvgXml } from 'react-native-svg';
import { GEMINI_SVG_CONTENT } from './gemini-svg-content';

interface GeminiSVGProps {
  width?: number;
  height?: number;
}

// Remove the background path (fill="#231D4D") from SVG content
const removeBackgroundPath = (svgContent: string): string => {
  // Match the complete self-closing path element that starts with fill="#231D4D"
  // The path tag spans multiple lines: <path fill="#231D4D" ... d="...z"/>
  // This regex matches from <path fill="#231D4D" through all attributes and path data until z"/>
  const backgroundPathRegex = /<path\s+fill="#231D4D"[\s\S]*?d="[\s\S]*?z"\/>/;
  let cleaned = svgContent.replace(backgroundPathRegex, '');
  
  // Improve SVG rendering quality - keep minimal to preserve all elements including borders
  // Only add shape-rendering for smooth edges, avoid properties that might hide borders
  cleaned = cleaned.replace(
    /<svg([^>]*)>/,
    `<svg$1 shape-rendering="geometricPrecision">`
  );
  
  return cleaned;
};

export const GeminiSVG: React.FC<GeminiSVGProps> = ({ 
  width = 260, 
  height = 260
}) => {
  // Process SVG to remove only the background square, keep all other elements including white border
  const processedSvgContent = useMemo(() => {
    // Only remove the first path with fill="#231D4D" (the background square)
    // All other paths including white borders are preserved
    return removeBackgroundPath(GEMINI_SVG_CONTENT);
  }, []);

  // Float animation
  const floatAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
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
    ).start();
  }, [floatAnim]);

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
      <View style={[styles.haloContainer, { width: haloSize, height: haloSize }]}>
        <LinearGradient
          colors={['rgba(167, 139, 250, 0.2)', 'rgba(167, 139, 250, 0.1)', 'transparent']}
          style={[styles.halo, { width: haloSize, height: haloSize, borderRadius: haloSize / 2 }]}
        />
      </View>
      
      {/* Logo with float animation */}
      <Animated.View
        style={[
          styles.logoWrapper,
          {
            width,
            height: calculatedHeight,
            transform: [{ translateY }],
          },
        ]}
      >
        <View style={styles.svgContainer}>
          <SvgXml 
            xml={processedSvgContent} 
            width={width} 
            height={calculatedHeight}
          />
        </View>
      </Animated.View>
    </View>
  );
};

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
