import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { StarParticles } from './StarParticles';
import { CinematicBackground } from './CinematicBackground';

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
      <CinematicBackground />

      {/* Header / Skip */}
      <SafeAreaView style={styles.header}>
        {showSkip && onSkip && (
          <TouchableOpacity onPress={onSkip} style={styles.skipButton}>
            <Text style={styles.skipText}>Saltar</Text>
          </TouchableOpacity>
        )}
      </SafeAreaView>

      {/* Main Content */}
      <ScrollView
        style={styles.mainContent}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {children}
      </ScrollView>

      {/* Footer / Continue Button */}
      {!customFooter && (
        <View style={styles.footer}>
          <TouchableOpacity
            onPress={onContinue}
            disabled={!isValid}
            style={[styles.continueButtonWrapper, !isValid && styles.continueButtonDisabled]}
            activeOpacity={0.9}
          >
            <LinearGradient
              colors={['#4C1D95', '#6D28D9', '#7C3AED']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.continueButtonGradient}
            >
              <Text style={styles.continueText}>{continueText}</Text>
            </LinearGradient>
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
    backgroundColor: '#070A1A',
    position: 'relative',
  },
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 20,
    paddingHorizontal: 32,
    alignItems: 'flex-end',
  },
  skipButton: {
    padding: 8,
    marginTop: 10,
  },
  skipText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '300',
    opacity: 0.6,
  },
  mainContent: {
    flex: 1,
    zIndex: 10,
    width: '100%',
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 100, // Safe space for title below status bar
    paddingBottom: 40,
    alignItems: 'center',
    flexGrow: 1,
  },
  footer: {
    position: 'relative',
    zIndex: 20,
    paddingHorizontal: 32,
    paddingBottom: 40,
    paddingTop: 16,
    alignItems: 'center',
    width: '100%',
    backgroundColor: 'transparent',
  },
  continueButtonWrapper: {
    width: '100%',
    shadowColor: '#7C3AED',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
    borderRadius: 30,
  },
  continueButtonGradient: {
    width: '100%',
    paddingVertical: 20,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  continueButtonDisabled: {
    opacity: 0.5,
  },
  continueText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  progressBar: {
    width: 60,
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 2,
    marginTop: 24,
  },
});
