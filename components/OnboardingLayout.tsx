import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView } from 'react-native';
import { BlurView } from 'expo-blur';
import { StarParticles } from './StarParticles';

interface OnboardingLayoutProps {
  children: React.ReactNode;
  onContinue: () => void;
  onSkip?: () => void;
  showSkip?: boolean;
  continueText?: string;
  isValid?: boolean;
  backgroundClass?: string;
  customFooter?: boolean;
}

export const OnboardingLayout: React.FC<OnboardingLayoutProps> = ({
  children,
  onContinue,
  onSkip,
  showSkip = true,
  continueText = 'Continuar',
  isValid = true,
  backgroundClass,
  customFooter = false
}) => {
  return (
    <View style={styles.container}>
      {/* Ethereal Background */}
      <View style={styles.etherealBg} />
      
      {/* Star Particles */}
      <StarParticles />

      {/* Header / Skip */}
      <SafeAreaView style={styles.header}>
        {showSkip && onSkip && (
          <TouchableOpacity onPress={onSkip} style={styles.skipButton}>
            <Text style={styles.skipText}>Saltar</Text>
          </TouchableOpacity>
        )}
      </SafeAreaView>

      {/* Main Content */}
      <View style={styles.mainContent}>
        {children}
      </View>

      {/* Footer / Continue Button */}
      {!customFooter && (
        <View style={styles.footer}>
          <TouchableOpacity
            onPress={onContinue}
            disabled={!isValid}
            style={[styles.continueButton, !isValid && styles.continueButtonDisabled]}
          >
            <Text style={styles.continueText}>{continueText}</Text>
          </TouchableOpacity>
          <View style={styles.progressBar} />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
    position: 'relative',
  },
  etherealBg: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#000000',
    // Add gradient effect with LinearGradient if needed
  },
  header: {
    position: 'relative',
    zIndex: 20,
    paddingTop: 56,
    paddingHorizontal: 32,
    alignItems: 'flex-end',
  },
  skipButton: {
    padding: 8,
  },
  skipText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '300',
    opacity: 0.6,
  },
  mainContent: {
    flex: 1,
    position: 'relative',
    zIndex: 10,
    paddingHorizontal: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: -24,
  },
  footer: {
    position: 'relative',
    zIndex: 20,
    paddingHorizontal: 32,
    paddingBottom: 40,
    paddingTop: 16,
    alignItems: 'center',
  },
  continueButton: {
    width: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    paddingVertical: 20,
    borderRadius: 30,
    alignItems: 'center',
  },
  continueButtonDisabled: {
    opacity: 0.5,
  },
  continueText: {
    color: '#000000',
    fontSize: 18,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  progressBar: {
    width: 128,
    height: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 3,
    marginTop: 16,
  },
});
