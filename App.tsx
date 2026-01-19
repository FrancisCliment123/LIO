import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, TextInput, Dimensions } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import { ScreenName, OnboardingData, INITIAL_DATA } from './types';
import { OnboardingLayout } from './components/OnboardingLayout';
import { StarParticles } from './components/StarParticles';
import { GeminiSVG } from './components/GeminiSVG';
import { CinematicBackground } from './components/CinematicBackground';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Glass Card Component
const GlassCard: React.FC<{ children: React.ReactNode; style?: any; onPress?: () => void }> = ({ children, style, onPress }) => {
  const CardComponent = onPress ? TouchableOpacity : View;
  return (
    <CardComponent
      onPress={onPress}
      style={[
        {
          backgroundColor: 'rgba(255, 255, 255, 0.08)',
          borderRadius: 22,
          borderWidth: 1,
          borderColor: 'rgba(255, 255, 255, 0.15)',
          padding: 20,
        },
        style,
      ]}
    >
      {children}
    </CardComponent>
  );
};

// Welcome Screen
const WelcomeScreen: React.FC<{ onNext: () => void }> = ({ onNext }) => {
  return (
    <View style={styles.welcomeContainer}>
      <CinematicBackground />
      
      <SafeAreaView style={styles.welcomeSafeArea}>
        {/* Logo/Video at the top */}
        <View style={styles.logoContainer}>
          <GeminiSVG width={260} height={260} />
      </View>

      {/* Main Content */}
      <View style={styles.welcomeContent}>
        <Text style={styles.welcomeTitle}>Hola, soy Lio</Text>
        <Text style={styles.welcomeSubtitle}>Estoy aquí para iluminar tu día</Text>
          
        <Text style={styles.welcomeDescription}>
            Descubre el poder de las afirmaciones diarias para cultivar una mente positiva y conectar con tu mejor versión.
        </Text>
      </View>

      {/* Button */}
      <View style={styles.welcomeButtonContainer}>
          <TouchableOpacity style={styles.gradientButton} onPress={onNext} activeOpacity={0.9}>
            <LinearGradient
              colors={['#4C1D95', '#6D28D9', '#7C3AED']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.gradientButtonInner}
            >
              <Text style={styles.gradientButtonText}>Encender mi luz</Text>
            </LinearGradient>
        </TouchableOpacity>
      </View>
      </SafeAreaView>
    </View>
  );
};

// Name Screen
const NameScreen: React.FC<{ 
  name: string; 
  setName: (n: string) => void; 
  onNext: () => void 
}> = ({ name, setName, onNext }) => {
  return (
    <OnboardingLayout onContinue={onNext} isValid={name.length > 0}>
      <View style={styles.screenContent}>
        <Text style={styles.screenTitle}>¿Cómo quieres que te llamemos?</Text>
        <Text style={styles.screenSubtitle}>Tu nombre aparecerá en tus afirmaciones</Text>
        
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Tu nombre"
            placeholderTextColor="rgba(255, 255, 255, 0.5)"
            value={name}
            onChangeText={setName}
            autoFocus
          />
        </View>
      </View>
    </OnboardingLayout>
  );
};

// Age Screen
const AgeScreen: React.FC<{ 
  selected: string; 
  onSelect: (v: string) => void; 
  onNext: () => void 
}> = ({ selected, onSelect, onNext }) => {
  const ranges = ["13 a 17", "18 a 24", "25 a 34", "35 a 44", "45 a 54", "+55"];

  return (
    <OnboardingLayout onContinue={onNext} isValid={!!selected}>
      <View style={styles.screenContent}>
        <Text style={styles.screenTitle}>¿Cuántos años tienes?</Text>
        <Text style={styles.screenSubtitle}>Tu edad se usa para personalizar el contenido</Text>
        
        <View style={styles.optionsContainer}>
          {ranges.map((range) => (
            <TouchableOpacity
              key={range}
              onPress={() => onSelect(range)}
              style={[
                styles.optionCard,
                selected === range && styles.optionCardSelected
              ]}
            >
              <Text style={styles.optionText}>{range}</Text>
              <View style={[styles.radioCircle, selected === range && styles.radioCircleSelected]}>
                {selected === range && <View style={styles.radioDot} />}
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </OnboardingLayout>
  );
};

// Interests Screen
const InterestsScreen: React.FC<{ 
  selected: string[]; 
  toggle: (id: string) => void; 
  onNext: () => void 
}> = ({ selected, toggle, onNext }) => {
  const interests = [
    "Sueña a lo grande", "Sentirse atrevido", "Amor propio", "Niño interior",
    "Positividad", "Ansiedad", "Agradecimiento", "Voz interior",
    "Confianza", "Atracción", "Mañanas", "Pensar demasiado"
  ];

  return (
    <OnboardingLayout onContinue={onNext} isValid={selected.length > 0}>
      <View style={styles.screenContent}>
        <Text style={styles.screenTitle}>¿Qué categorías te interesan?</Text>
        <Text style={styles.screenSubtitle}>Esto se usará para personalizar tu feed</Text>
        
        <View style={styles.interestsGrid}>
          {interests.map((interest) => {
            const isSelected = selected.includes(interest);
            return (
              <TouchableOpacity
                key={interest}
                onPress={() => toggle(interest)}
                style={[
                  styles.interestCard,
                  isSelected && styles.interestCardSelected
                ]}
              >
                <Text style={styles.interestPlus}>+</Text>
                <Text style={styles.interestText}>{interest}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    </OnboardingLayout>
  );
};

// Streak Screen
const StreakScreen: React.FC<{ onNext: () => void }> = ({ onNext }) => {
  const days = ['Ma', 'Mi', 'Ju', 'Vi', 'Sa', 'Do', 'Lu'];
  
  return (
    <OnboardingLayout onContinue={onNext} showSkip={false}>
      <View style={styles.screenContent}>
        <Text style={styles.screenTitle}>Construye un hábito diario de práctica de afirmaciones</Text>
        
        <GlassCard style={styles.streakCard}>
          <View style={styles.streakDays}>
            {days.map((day, idx) => (
              <View key={day} style={styles.streakDay}>
                <Text style={[styles.streakDayLabel, idx === 0 && styles.streakDayLabelActive]}>
                  {day}
                </Text>
                <View style={[styles.streakCircle, idx === 0 && styles.streakCircleActive]}>
                  {idx === 0 && <MaterialIcons name="check" size={18} color="#FFFFFF" />}
                </View>
              </View>
            ))}
          </View>
          <Text style={styles.streakText}>Construye una racha, día a día</Text>
        </GlassCard>
      </View>
    </OnboardingLayout>
  );
};

// Mental Health Screen
const MentalHealthScreen: React.FC<{ 
  selected: string[]; 
  toggle: (v: string) => void; 
  onNext: () => void 
}> = ({ selected, toggle, onNext }) => {
  const options = [
    { text: "Gratitud", icon: "favorite" },
    { text: "Crecimiento personal", icon: "psychology" },
    { text: "Positividad corporal", icon: "self_improvement" },
    { text: "Pensar en positivo", icon: "sentiment_satisfied" },
    { text: "Amor", icon: "favorite" },
    { text: "Felicidad", icon: "auto_awesome" },
    { text: "Amarme a mí mismo", icon: "person" }
  ];

  return (
    <OnboardingLayout onContinue={onNext}>
      <View style={styles.screenContent}>
        <Text style={styles.screenTitle}>¿Qué quieres mejorar?</Text>
        <Text style={styles.screenSubtitle}>Elige al menos una para adaptar el contenido a tus necesidades</Text>
        
        <View style={styles.optionsContainer}>
          {options.map((opt) => {
            const isSelected = selected.includes(opt.text);
            return (
              <TouchableOpacity
                key={opt.text}
                onPress={() => toggle(opt.text)}
                style={[
                  styles.optionCard,
                  isSelected && styles.optionCardSelected
                ]}
              >
                <View style={styles.optionLeft}>
                  <MaterialIcons name={opt.icon as any} size={24} color="#FFFFFF" />
                  <Text style={styles.optionText}>{opt.text}</Text>
                </View>
                <View style={[styles.radioCircle, isSelected && styles.radioCircleSelected]}>
                  {isSelected && <View style={styles.radioDot} />}
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    </OnboardingLayout>
  );
};

// Notifications Screen
const NotificationScreen: React.FC<{ 
  data: OnboardingData; 
  update: (d: Partial<OnboardingData>) => void;
  onNext: () => void;
}> = ({ data, update, onNext }) => {
  const adjustCount = (amount: number) => {
    const newVal = Math.max(1, Math.min(50, data.notificationCount + amount));
    update({ notificationCount: newVal });
  };

  return (
    <OnboardingLayout onContinue={onNext} continueText="Permitir">
      <View style={styles.screenContent}>
        <Text style={styles.screenTitle}>Recibe afirmaciones a lo largo del día</Text>
        <Text style={styles.screenSubtitle}>Leer afirmaciones regularmente te ayudará a alcanzar tus metas</Text>

        <GlassCard style={styles.notificationPreview}>
          <View style={styles.notificationContent}>
            <View style={styles.notificationIcon}>
              <Text style={styles.notificationIconText}>Lio</Text>
            </View>
            <View style={styles.notificationBody}>
              <View style={styles.notificationHeader}>
                <Text style={styles.notificationTitle}>Lio</Text>
                <Text style={styles.notificationTime}>Ahora</Text>
              </View>
              <Text style={styles.notificationMessage}>
                Merezco la posibilidad de alcanzar mi máximo potencial.
              </Text>
            </View>
          </View>
        </GlassCard>

        <View style={styles.optionsContainer}>
          <GlassCard style={styles.settingCard}>
            <Text style={styles.settingLabel}>Cantidad</Text>
            <View style={styles.settingControls}>
              <TouchableOpacity onPress={() => adjustCount(-1)} style={styles.settingButton}>
                <MaterialIcons name="remove" size={20} color="#FFFFFF" />
              </TouchableOpacity>
              <Text style={styles.settingValue}>{data.notificationCount}x</Text>
              <TouchableOpacity onPress={() => adjustCount(1)} style={styles.settingButton}>
                <MaterialIcons name="add" size={20} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          </GlassCard>
          
          <GlassCard style={styles.settingCard}>
            <Text style={styles.settingLabel}>Desde las</Text>
            <View style={styles.settingTime}>
              <Text style={styles.settingTimeText}>{data.startTime}</Text>
              <MaterialIcons name="expand-more" size={16} color="#FFFFFF" />
            </View>
          </GlassCard>

          <GlassCard style={styles.settingCard}>
            <Text style={styles.settingLabel}>Hasta las</Text>
            <View style={styles.settingTime}>
              <Text style={styles.settingTimeText}>{data.endTime}</Text>
              <MaterialIcons name="expand-more" size={16} color="#FFFFFF" />
            </View>
          </GlassCard>
        </View>
      </View>
    </OnboardingLayout>
  );
};

// Gender Screen
const GenderScreen: React.FC<{ 
  selected: string; 
  onSelect: (v: string) => void; 
  onNext: () => void 
}> = ({ selected, onSelect, onNext }) => {
  const options = ["Femenino", "Masculino", "Otros", "Prefiero no decirlo"];

  return (
    <OnboardingLayout onContinue={onNext} isValid={!!selected}>
      <View style={styles.screenContent}>
        <Text style={styles.screenTitle}>¿Qué opción te representa mejor?</Text>
        <Text style={styles.screenSubtitle}>Algunas afirmaciones usarán tu género o tus pronombres</Text>

        <View style={styles.optionsContainer}>
          {options.map((opt) => (
            <TouchableOpacity
              key={opt}
              onPress={() => onSelect(opt)}
              style={[
                styles.optionCard,
                selected === opt && styles.optionCardSelected
              ]}
            >
              <Text style={styles.optionText}>{opt}</Text>
              <View style={[styles.radioCircle, selected === opt && styles.radioCircleSelected]}>
                {selected === opt && <View style={styles.radioDot} />}
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </OnboardingLayout>
  );
};

// Home Screen
const HomeScreen: React.FC<{ onReset: () => void }> = ({ onReset }) => {
  return (
    <View style={styles.homeContainer}>
      <LinearGradient
        colors={['transparent', 'rgba(212, 175, 55, 0.08)']}
        style={styles.homeGradient}
      />
      
      <SafeAreaView style={styles.homeTopBar}>
        <Text style={styles.homeTime}>20:57</Text>
        <View style={styles.homeStatus}>
          <MaterialIcons name="signal-cellular-alt" size={14} color="#FFFFFF" />
          <Text style={styles.homeStatusText}>4G</Text>
          <MaterialIcons name="battery-horiz-050" size={14} color="#FFFFFF" style={{ transform: [{ rotate: '90deg' }] }} />
        </View>
      </SafeAreaView>

      <View style={styles.homeHeader}>
        <TouchableOpacity style={styles.homeHeaderButton} onPress={onReset}>
          <MaterialIcons name="person" size={24} color="#E2E8F0" />
        </TouchableOpacity>
        
        <View style={styles.homeHeaderCenter}>
          <MaterialIcons name="favorite" size={18} color="#D4AF37" />
          <Text style={styles.homeHeaderText}>0/5</Text>
          <View style={styles.homeProgressBar}>
            <View style={[styles.homeProgressFill, { width: 0 }]} />
          </View>
        </View>

        <TouchableOpacity style={styles.homeHeaderButton}>
          <MaterialIcons name="workspace-premium" size={24} color="#D4AF37" />
        </TouchableOpacity>
      </View>

      <View style={styles.homeMain}>
        <Text style={styles.homeAffirmation}>
          Soy una persona fuerte, segura de sí misma y atraigo conscientemente la felicidad.
        </Text>
      </View>

      <View style={styles.homeActions}>
        <View style={styles.homeActionButtons}>
          <TouchableOpacity style={styles.homeActionButton}>
            <MaterialIcons name="ios-share" size={30} color="#94A3B8" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.homeActionButton}>
            <MaterialIcons name="favorite" size={36} color="#94A3B8" />
          </TouchableOpacity>
        </View>

        <View style={styles.homeSwipeHint}>
          <Text style={styles.homeSwipeText}>Desliza hacia arriba</Text>
          <View style={styles.homeSwipeIndicator} />
        </View>

        <View style={styles.homeNav}>
          <TouchableOpacity style={styles.homeNavButton}>
            <View style={styles.homeNavBadge} />
            <MaterialIcons name="grid-view" size={24} color="rgba(226, 232, 240, 0.6)" />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.homeNavCenter}>
            <MaterialIcons name="self-improvement" size={20} color="#E2E8F0" />
            <Text style={styles.homeNavText}>Práctica</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.homeNavButton}>
            <MaterialIcons name="palette" size={24} color="rgba(226, 232, 240, 0.6)" />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.homeIndicator} />
    </View>
  );
};

// Main App Component
const App: React.FC = () => {
  const [screen, setScreen] = useState<ScreenName>(ScreenName.WELCOME);
  const [formData, setFormData] = useState<OnboardingData>(INITIAL_DATA);

  const updateData = (data: Partial<OnboardingData>) => {
    setFormData(prev => ({ ...prev, ...data }));
  };

  const toggleSelection = (key: keyof OnboardingData, value: string) => {
    setFormData(prev => {
      const list = prev[key] as string[];
      if (list.includes(value)) {
        return { ...prev, [key]: list.filter(item => item !== value) };
      }
      return { ...prev, [key]: [...list, value] };
    });
  };

  const renderScreen = () => {
    switch (screen) {
      case ScreenName.WELCOME:
        return <WelcomeScreen onNext={() => setScreen(ScreenName.NAME)} />;
      case ScreenName.NAME:
        return <NameScreen 
          name={formData.name}
          setName={(v) => updateData({ name: v })}
          onNext={() => setScreen(ScreenName.AGE)}
        />;
      case ScreenName.AGE:
        return <AgeScreen 
          selected={formData.ageRange}
          onSelect={(v) => updateData({ ageRange: v })}
          onNext={() => setScreen(ScreenName.INTERESTS)}
        />;
      case ScreenName.INTERESTS:
        return <InterestsScreen 
          selected={formData.interests} 
          toggle={(id) => toggleSelection('interests', id)} 
          onNext={() => setScreen(ScreenName.STREAK)} 
        />;
      case ScreenName.STREAK:
        return <StreakScreen onNext={() => setScreen(ScreenName.MENTAL_HEALTH)} />;
      case ScreenName.MENTAL_HEALTH:
        return <MentalHealthScreen 
          selected={formData.mentalHealthHabits}
          toggle={(id) => toggleSelection('mentalHealthHabits', id)}
          onNext={() => setScreen(ScreenName.NOTIFICATIONS)}
        />;
      case ScreenName.NOTIFICATIONS:
        return <NotificationScreen 
          data={formData}
          update={updateData}
          onNext={() => setScreen(ScreenName.GENDER)}
        />;
      case ScreenName.GENDER:
        return <GenderScreen 
          selected={formData.gender}
          onSelect={(v) => updateData({ gender: v })}
          onNext={() => setScreen(ScreenName.HOME)}
        />;
      case ScreenName.HOME:
        return <HomeScreen onReset={() => setScreen(ScreenName.WELCOME)} />;
      default:
        return <View><Text>Unknown Screen</Text></View>;
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="light" />
        {renderScreen()}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#000000',
  },
  // Welcome Screen
  welcomeContainer: {
    flex: 1,
    backgroundColor: '#070A1A',
    position: 'relative',
  },
  etherealBg: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#070A1A',
  },
  welcomeSafeArea: {
    flex: 1,
    position: 'relative',
    zIndex: 10,
  },
  logoContainer: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 45,
    paddingBottom: 24,
    zIndex: 3,
    backgroundColor: 'transparent',
  },
  welcomeContent: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingHorizontal: 36,
    paddingTop: 16,
    zIndex: 10,
  },
  welcomeTitle: {
    fontSize: 44,
    fontWeight: '700',
    color: '#F8FAFF',
    textAlign: 'center',
    letterSpacing: -0.5,
    lineHeight: 52,
    marginBottom: 22,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  welcomeSubtitle: {
    fontSize: 19,
    fontWeight: '400',
    color: '#BFA7FF',
    textAlign: 'center',
    letterSpacing: 0.3,
    marginBottom: 26,
  },
  welcomeDescription: {
    fontSize: 16,
    fontWeight: '400',
    color: 'rgba(248, 250, 255, 0.72)',
    textAlign: 'center',
    lineHeight: 26,
    paddingHorizontal: 12,
    maxWidth: '90%',
    marginTop: 4,
  },
  welcomeButtonContainer: {
    paddingHorizontal: 36,
    paddingTop: 32,
    paddingBottom: 32,
    zIndex: 10,
    width: '100%',
  },
  gradientButton: {
    width: '100%',
    borderRadius: 30,
    overflow: 'hidden',
    shadowColor: '#7C3AED',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  gradientButtonInner: {
    paddingVertical: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  gradientButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  // Common Screen Styles
  screenContent: {
    width: '100%',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  screenTitle: {
    fontSize: 32,
    fontWeight: '600',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 12,
    letterSpacing: -0.5,
  },
  screenSubtitle: {
    fontSize: 16,
    fontWeight: '300',
    color: 'rgba(255, 255, 255, 0.6)',
    textAlign: 'center',
    marginBottom: 40,
  },
  inputContainer: {
    width: '100%',
    paddingHorizontal: 16,
    marginTop: 20,
  },
  input: {
    width: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 2,
    borderColor: '#3B82F6',
    borderRadius: 22,
    paddingVertical: 20,
    paddingHorizontal: 24,
    fontSize: 18,
    color: '#FFFFFF',
  },
  optionsContainer: {
    width: '100%',
    gap: 12,
    marginTop: 20,
  },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 22,
    paddingVertical: 20,
    paddingHorizontal: 32,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  optionCardSelected: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderColor: 'rgba(255, 255, 255, 0.25)',
  },
  optionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    flex: 1,
  },
  optionText: {
    fontSize: 18,
    fontWeight: '300',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  radioCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioCircleSelected: {
    borderColor: 'rgba(255, 255, 255, 0.6)',
  },
  radioDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FFFFFF',
  },
  interestsGrid: {
    width: '100%',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    paddingHorizontal: 16,
    marginTop: 20,
  },
  interestCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 30,
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    width: '48%',
  },
  interestCardSelected: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderColor: 'rgba(255, 255, 255, 0.25)',
  },
  interestPlus: {
    fontSize: 18,
    color: '#FFFFFF',
  },
  interestText: {
    fontSize: 16,
    fontWeight: '300',
    color: '#FFFFFF',
    flex: 1,
    textAlign: 'left',
  },
  streakCard: {
    width: '100%',
    marginTop: 20,
  },
  streakDays: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
    paddingHorizontal: 4,
  },
  streakDay: {
    alignItems: 'center',
    gap: 8,
  },
  streakDayLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.6)',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  streakDayLabelActive: {
    color: '#FFFFFF',
  },
  streakCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  streakCircleActive: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  streakText: {
    fontSize: 14,
    fontWeight: '300',
    color: 'rgba(255, 255, 255, 0.6)',
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  notificationPreview: {
    width: '100%',
    marginTop: 20,
    padding: 20,
  },
  notificationContent: {
    flexDirection: 'row',
    gap: 12,
  },
  notificationIcon: {
    width: 40,
    height: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notificationIconText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 12,
  },
  notificationBody: {
    flex: 1,
  },
  notificationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  notificationTitle: {
    color: '#FFFFFF',
    fontWeight: '500',
    fontSize: 14,
    letterSpacing: 0.5,
  },
  notificationTime: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 12,
  },
  notificationMessage: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 14,
    lineHeight: 20,
  },
  settingCard: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 24,
    marginBottom: 12,
  },
  settingLabel: {
    fontSize: 18,
    fontWeight: '300',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  settingControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  settingButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  settingValue: {
    color: '#FFFFFF',
    fontWeight: '500',
    fontSize: 18,
    width: 32,
    textAlign: 'center',
  },
  settingTime: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  settingTimeText: {
    color: '#FFFFFF',
    fontWeight: '500',
    fontSize: 14,
  },
  // Home Screen
  homeContainer: {
    flex: 1,
    backgroundColor: '#000000',
  },
  homeGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  homeTopBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingTop: 16,
    marginBottom: 8,
  },
  homeTime: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  homeStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  homeStatusText: {
    fontSize: 12,
    fontWeight: '600',
    fontStyle: 'italic',
    color: '#FFFFFF',
  },
  homeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 16,
    zIndex: 10,
  },
  homeHeaderButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  homeHeaderCenter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  homeHeaderText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#E2E8F0',
    letterSpacing: 1,
  },
  homeProgressBar: {
    width: 80,
    height: 6,
    backgroundColor: 'rgba(226, 232, 240, 0.2)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  homeProgressFill: {
    height: '100%',
    backgroundColor: '#D4AF37',
  },
  homeMain: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    zIndex: 10,
  },
  homeAffirmation: {
    fontSize: 36,
    fontWeight: '400',
    color: '#D4AF37',
    textAlign: 'center',
    fontStyle: 'italic',
    letterSpacing: -0.5,
    lineHeight: 44,
  },
  homeActions: {
    alignItems: 'center',
    gap: 32,
    paddingBottom: 48,
    zIndex: 10,
  },
  homeActionButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 48,
  },
  homeActionButton: {
    alignItems: 'center',
  },
  homeSwipeHint: {
    alignItems: 'center',
    gap: 4,
    opacity: 0.6,
  },
  homeSwipeText: {
    fontSize: 10,
    fontWeight: '500',
    color: '#94A3B8',
    textTransform: 'uppercase',
    letterSpacing: 2,
  },
  homeSwipeIndicator: {
    width: 4,
    height: 32,
    borderRadius: 2,
    backgroundColor: '#D4AF37',
    opacity: 0.5,
  },
  homeNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '90%',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 32,
    padding: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  homeNavButton: {
    width: 56,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  homeNavBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#EF4444',
  },
  homeNavCenter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 30,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  homeNavText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#E2E8F0',
    letterSpacing: 0.5,
  },
  homeIndicator: {
    height: 6,
    width: 128,
    backgroundColor: 'rgba(148, 163, 184, 0.3)',
    borderRadius: 3,
    alignSelf: 'center',
    marginBottom: 8,
  },
});

export default App;
