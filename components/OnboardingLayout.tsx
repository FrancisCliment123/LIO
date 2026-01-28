import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import { StarParticles } from './StarParticles';
import { CinematicBackground } from './CinematicBackground';

interface OnboardingLayoutProps {
  children: React.ReactNode;
  onContinue: () => void;
  onSkip?: () => void;
  onBack?: () => void;
  showSkip?: boolean;
  continueText?: string;
  headerTitle?: string;
  isValid?: boolean;
  backgroundClass?: string;
  customFooter?: boolean;
  currentStep?: number;
  totalSteps?: number;
}

export const OnboardingLayout: React.FC<OnboardingLayoutProps> = ({
  children,
  onContinue,
  onSkip,
  onBack,
  showSkip = true,
  continueText = 'Continuar',
  headerTitle,
  isValid = true,
  backgroundClass,
  customFooter = false,
  currentStep,
  totalSteps = 4
}) => {
  return (
    <View style={styles.container}>

      {/* Header / Navigation */}
      <SafeAreaView style={styles.header}>
        <View style={styles.headerContent}>
          {/* Left: Back Button */}
          <View style={styles.headerLeft}>
            {onBack && (
              <TouchableOpacity onPress={onBack} style={styles.iconButton}>
                <MaterialIcons name="arrow-back-ios" size={20} color="#FFF" />
              </TouchableOpacity>
            )}
          </View>

          {/* Center: Progress Bar */}
          <View style={styles.headerCenter}>
            {currentStep && totalSteps && (
              <View style={styles.progressBarContainer}>
                {Array.from({ length: totalSteps }).map((_, index) => (
                  <View
                    key={index}
                    style={[
                      styles.progressSegment,
                      index < currentStep && styles.progressSegmentActive
                    ]}
                  />
                ))}
              </View>
            )}
          </View>

          {/* Right: Skip Button */}
          <View style={styles.headerRight}>
            {showSkip && onSkip && (
              <TouchableOpacity onPress={onSkip} style={styles.skipButton}>
                <Text style={styles.skipText}>Saltar</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
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
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    height: 50, // Fixed height for header area
  },
  headerLeft: {
    flex: 1,
    alignItems: 'flex-start',
  },
  headerCenter: {
    flex: 2,
    alignItems: 'center',
  },
  progressBarContainer: {
    flexDirection: 'row',
    gap: 6,
    alignItems: 'center',
  },
  progressSegment: {
    width: 32,
    height: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 2,
  },
  progressSegmentActive: {
    backgroundColor: '#A78BFA',
  },
  headerRight: {
    flex: 1,
    alignItems: 'flex-end',
  },
  headerTitle: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '400',
    opacity: 0.5, // Subtle/hidden effect
    letterSpacing: 0.5,
  },
  iconButton: {
    padding: 8,
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
