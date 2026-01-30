import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, TextInput, Dimensions, Animated, Modal } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';
import { ScreenName, OnboardingData, INITIAL_DATA } from './types';
import { OnboardingLayout } from './components/OnboardingLayout';
import { StarParticles } from './components/StarParticles';
import { GeminiSVG } from './components/GeminiSVG';
import { CinematicBackground } from './components/CinematicBackground';
import { generateAffirmationsBatch, Affirmation } from './services/gemini';
import { FlatList, ActivityIndicator } from 'react-native';
import LottieView from 'lottie-react-native';
import { registerForPushNotificationsAsync, scheduleTestNotification } from './services/notifications';

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
  onNext: () => void;
  onBack: () => void;
}> = ({ name, setName, onNext, onBack }) => {
  return (
    <OnboardingLayout
      onContinue={onNext}
      onBack={onBack}
      isValid={name.length > 0}
      showSkip={false}
      currentStep={1}
      totalSteps={8}
    >
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
          />
        </View>
      </View>
    </OnboardingLayout>
  );
};

const AgeScreen: React.FC<{
  selected: string;
  onSelect: (v: string) => void;
  onNext: () => void;
  onBack: () => void;
}> = ({ selected, onSelect, onNext, onBack }) => {
  const ranges = ["13 a 17", "18 a 24", "25 a 34", "35 a 44", "45 a 54", "+55"];

  return (
    <OnboardingLayout onContinue={onNext} onBack={onBack} isValid={!!selected} currentStep={2} totalSteps={8}>
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

const InterestsScreen: React.FC<{
  selected: string[];
  toggle: (id: string) => void;
  onNext: () => void;
  onBack: () => void;
}> = ({ selected, toggle, onNext, onBack }) => {
  const interests = [
    "Sueña a lo grande", "Sentirse atrevido", "Amor propio", "Niño interior",
    "Positividad", "Ansiedad", "Agradecimiento", "Voz interior",
    "Confianza", "Atracción", "Mañanas", "Pensar demasiado"
  ];

  return (
    <OnboardingLayout onContinue={onNext} onBack={onBack} isValid={selected.length > 0} currentStep={3} totalSteps={8}>
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
                <MaterialIcons
                  name={isSelected ? "check" : "add"}
                  size={18}
                  color={isSelected ? "#FFFFFF" : "rgba(255, 255, 255, 0.6)"}
                />
                <Text style={[styles.interestText, isSelected && styles.interestTextSelected]}>
                  {interest}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    </OnboardingLayout>
  );
};

// Streak Screen
const StreakScreen: React.FC<{ onNext: () => void; onBack: () => void }> = ({ onNext, onBack }) => {
  const days = ['Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sa', 'Do'];
  const pulseAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 3000,
          useNativeDriver: false,
        }),
        Animated.timing(pulseAnim, {
          toValue: 0,
          duration: 3000,
          useNativeDriver: false,
        }),
      ])
    ).start();
  }, []);

  return (
    <OnboardingLayout onContinue={onNext} onBack={onBack} showSkip={false} currentStep={4} totalSteps={8}>
      <View style={styles.screenContent}>
        {/* Top Icon */}
        <View style={{ alignItems: 'center', marginBottom: 20 }}>
          <MaterialCommunityIcons name="fire" size={80} color="#FF9500" />
        </View>

        <Text style={styles.screenTitle}>Construye un hábito diario</Text>
        <Text style={styles.screenSubtitle}>La constancia es la clave para un cambio duradero</Text>

        <GlassCard style={styles.streakCard}>
          <View style={styles.streakDays}>
            {days.map((day, idx) => {
              // Wednesday is Mi (index 2)
              const isActive = idx === 2;
              return (
                <View key={day} style={styles.streakDay}>
                  <Text style={[styles.streakDayLabel, isActive && styles.streakDayLabelActive]}>
                    {day}
                  </Text>
                  <View style={[styles.streakCircle, isActive && styles.streakCircleActive, isActive && { overflow: 'hidden' }]}>
                    {isActive ? (
                      <>
                        <Animated.View style={{
                          position: 'absolute',
                          width: '200%',
                          height: '100%',
                          left: pulseAnim.interpolate({
                            inputRange: [0, 1],
                            outputRange: ['-100%', '0%']
                          })
                        }}>
                          <LinearGradient
                            colors={['#7C3AED', '#9061F9', '#7C3AED']}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                            style={{ flex: 1 }}
                          />
                        </Animated.View>
                        <MaterialIcons name="check" size={16} color="#FFFFFF" />
                      </>
                    ) : null}
                  </View>
                </View>
              );
            })}
          </View>

          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 10, backgroundColor: 'rgba(255, 149, 0, 0.1)', padding: 12, borderRadius: 16 }}>
            <MaterialCommunityIcons name="fire" size={24} color="#FF9500" />
            <Text style={{ color: 'rgba(255,255,255,0.9)', fontSize: 13, flex: 1, lineHeight: 18 }}>
              Las personas con rachas de 7 días tienen 3 veces más probabilidades de formar hábitos duraderos
            </Text>
          </View>
        </GlassCard>
      </View>
    </OnboardingLayout>
  );
};

const MentalHealthScreen: React.FC<{
  selected: string[];
  toggle: (v: string) => void;
  onNext: () => void;
  onBack: () => void;
}> = ({ selected, toggle, onNext, onBack }) => {
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
    <OnboardingLayout onContinue={onNext} onBack={onBack} currentStep={5} totalSteps={8}>
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
  onBack: () => void;
}> = ({ data, update, onNext, onBack }) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [editingType, setEditingType] = useState<'start' | 'end' | null>(null);

  const adjustCount = (amount: number) => {
    const newVal = Math.max(1, Math.min(30, data.notificationCount + amount));
    update({ notificationCount: newVal });
  };

  const hours = Array.from({ length: 24 }, (_, i) => `${i}:00`);

  const selectTime = (time: string) => {
    if (editingType === 'start') {
      update({ startTime: time });
    } else {
      update({ endTime: time });
    }
    setModalVisible(false);
    setEditingType(null);
  };

  return (
    <OnboardingLayout onContinue={onNext} onBack={onBack} continueText="Permitir" currentStep={6} totalSteps={8}>
      <View style={styles.screenContent}>
        <Text style={[styles.screenTitle, { marginBottom: 4, fontSize: 26, lineHeight: 32 }]}>Recibe afirmaciones a lo largo del día</Text>
        <Text style={[styles.screenSubtitle, { marginBottom: 0, fontSize: 14 }]}>Leer afirmaciones regularmente te ayudará a alcanzar tus metas</Text>

        {/* Animated Notification Preview */}
        <View style={[styles.notificationPreview, { marginVertical: 8 }]}>
          <LottieView
            source={require('./assets/lio-notification/Noti-animation.json')}
            autoPlay
            loop={false}
            resizeMode="contain"
            style={{
              width: '100%',
              height: 140,
              alignSelf: 'center',
            }}
          />
        </View>

        <View style={[styles.optionsContainer, { gap: 6 }]}>
          <GlassCard style={[styles.settingCard, { paddingVertical: 10 }]}>
            <Text style={styles.settingLabel}>Cantidad</Text>
            <View style={styles.settingControls}>
              <TouchableOpacity onPress={() => adjustCount(-1)} style={[styles.settingButton, { backgroundColor: '#7C3AED', borderColor: '#A78BFA' }]}>
                <MaterialIcons name="remove" size={20} color="#FFFFFF" />
              </TouchableOpacity>
              <Text style={[styles.settingValue, { fontSize: 26, fontWeight: '700' }]}>{data.notificationCount}x</Text>
              <TouchableOpacity onPress={() => adjustCount(1)} style={[styles.settingButton, { backgroundColor: '#7C3AED', borderColor: '#A78BFA' }]}>
                <MaterialIcons name="add" size={20} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          </GlassCard>

          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => {
              setEditingType('start');
              setModalVisible(true);
            }}
          >
            <GlassCard style={[styles.settingCard, { paddingVertical: 10 }]}>
              <Text style={styles.settingLabel}>Desde las</Text>
              <View style={styles.settingTime}>
                <Text style={styles.settingTimeText}>{data.startTime}</Text>
                <MaterialIcons name="expand-more" size={18} color="#A78BFA" />
              </View>
            </GlassCard>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => {
              setEditingType('end');
              setModalVisible(true);
            }}
          >
            <GlassCard style={[styles.settingCard, { paddingVertical: 10 }]}>
              <Text style={styles.settingLabel}>Hasta las</Text>
              <View style={styles.settingTime}>
                <Text style={styles.settingTimeText}>{data.endTime}</Text>
                <MaterialIcons name="expand-more" size={18} color="#A78BFA" />
              </View>
            </GlassCard>
          </TouchableOpacity>
        </View>

        {/* Dynamic Summary */}
        <Text style={{ color: 'rgba(255,255,255,0.6)', fontSize: 13, fontStyle: 'italic', textAlign: 'center', marginTop: 12, lineHeight: 18 }}>
          Recibirás <Text style={{ color: '#A78BFA', fontWeight: '600' }}>{data.notificationCount}</Text> notificaciones al día entre las <Text style={{ color: '#A78BFA', fontWeight: '600' }}>{data.startTime}</Text> y las <Text style={{ color: '#A78BFA', fontWeight: '600' }}>{data.endTime}</Text>
        </Text>

        <TouchableOpacity onPress={scheduleTestNotification} style={{ marginTop: 15, alignSelf: 'center' }}>
          <Text style={{ color: '#A78BFA', fontSize: 14, textDecorationLine: 'underline' }}>Probar notificación</Text>
        </TouchableOpacity>

        {/* Improved Time Selection Modal */}
        <Modal
          visible={modalVisible}
          transparent={true}
          animationType="slide"
          onRequestClose={() => setModalVisible(false)}
        >
          <TouchableOpacity
            style={styles.modalOverlay}
            activeOpacity={1}
            onPress={() => setModalVisible(false)}
          >
            <View style={styles.modalContent}>
              <GlassCard style={styles.timePickerContainer}>
                <View style={{ width: '100%', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                  <Text style={[styles.modalTitle, { marginBottom: 0 }]}>
                    {editingType === 'start' ? 'Hora de inicio' : 'Hora de fin'}
                  </Text>
                  <TouchableOpacity onPress={() => setModalVisible(false)}>
                    <MaterialIcons name="close" size={24} color="rgba(255,255,255,0.5)" />
                  </TouchableOpacity>
                </View>

                <FlatList
                  data={hours}
                  keyExtractor={(item) => item}
                  style={{ width: '100%' }}
                  initialScrollIndex={parseInt((editingType === 'start' ? data.startTime : data.endTime) || '0')}
                  getItemLayout={(data, index) => (
                    { length: 61, offset: 61 * index, index }
                  )}
                  renderItem={({ item }) => (
                    <TouchableOpacity
                      style={[
                        styles.timeRow,
                        (editingType === 'start' ? data.startTime === item : data.endTime === item) && styles.timeRowActive
                      ]}
                      onPress={() => selectTime(item)}
                    >
                      <Text style={[
                        styles.timeRowText,
                        (editingType === 'start' ? data.startTime === item : data.endTime === item) && styles.timeRowTextActive
                      ]}>
                        {item}
                      </Text>
                      {(editingType === 'start' ? data.startTime === item : data.endTime === item) && (
                        <MaterialIcons name="check" size={20} color="#A78BFA" />
                      )}
                    </TouchableOpacity>
                  )}
                  showsVerticalScrollIndicator={false}
                />
              </GlassCard>
            </View>
          </TouchableOpacity>
        </Modal>
      </View>
    </OnboardingLayout>
  );
};

// Gender Screen
const GenderScreen: React.FC<{
  selected: string;
  onSelect: (v: string) => void;
  onNext: () => void;
  onBack: () => void;
}> = ({ selected, onSelect, onNext, onBack }) => {
  const options = ["Femenino", "Masculino", "Otros", "Prefiero no decirlo"];

  return (
    <OnboardingLayout onContinue={onNext} onBack={onBack} isValid={!!selected} currentStep={7} totalSteps={8}>
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
}

// Widget Screen
const WidgetScreen: React.FC<{ onNext: () => void; onBack: () => void }> = ({ onNext, onBack }) => {
  return (
    <OnboardingLayout onContinue={onNext} onBack={onBack} showSkip={false} currentStep={8} totalSteps={8} continueText="Instalar widget">
      <View style={styles.screenContent}>
        {/* Icon with Glow Effect */}
        <View style={styles.widgetIconContainer}>
          <View style={styles.widgetIconBox}>
            <MaterialIcons name="auto-awesome" size={48} color="#FFFFFF" />
          </View>
        </View>

        <Text style={[styles.screenTitle, { marginTop: 40, fontSize: 24, paddingHorizontal: 20 }]}>Añade un widget a tu pantalla de inicio</Text>
        <Text style={styles.screenSubtitle}>
          Mantén tus afirmaciones a la vista durante todo el día con nuestros hermosos widgets
        </Text>

        {/* Phone Mockup */}
        <View style={styles.widgetMockup}>
          <View style={styles.widgetPhone}>
            {/* Phone top notch */}
            <View style={styles.widgetPhoneNotch} />

            {/* Widget preview card */}
            <View style={styles.widgetPreview}>
              <View style={styles.widgetCard}>
                <View style={styles.widgetCardIconContainer}>
                  <LinearGradient
                    colors={['#4C1D95', '#7C3AED']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.widgetCardIcon}
                  >
                    <MaterialIcons name="auto-awesome" size={20} color="#FFFFFF" />
                  </LinearGradient>
                </View>
                <View style={styles.widgetCardText}>
                  <Text style={styles.widgetCardLabel}>LIO</Text>
                  <Text style={styles.widgetCardAffirmation}>Tu luz importa</Text>
                </View>
              </View>
            </View>

            {/* App grid placeholder - 4x3 */}
            <View style={styles.widgetAppGrid}>
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((i) => (
                <View key={i} style={styles.widgetAppIcon} />
              ))}
            </View>

            {/* Bottom Dock */}
            <View style={styles.widgetDock}>
              {[1, 2, 3, 4].map((i) => (
                <View key={i} style={styles.widgetDockIcon} />
              ))}
            </View>
          </View>
        </View>
      </View>
    </OnboardingLayout>
  );
};


// Home Screen
const HomeScreen: React.FC<{
  onReset: () => void;
  onNavigate: (screen: ScreenName) => void;
  userData: OnboardingData
}> = ({ onReset, onNavigate, userData }) => {
  const [affirmations, setAffirmations] = useState<Affirmation[]>([]);
  const [loading, setLoading] = useState(false);

  // Initial load
  React.useEffect(() => {
    loadMore();
  }, []);

  const loadMore = async () => {
    if (loading) return;
    setLoading(true);
    try {
      // Use the batch function to get multiple affirmations at once
      const newAffirmations = await generateAffirmationsBatch(userData, 3);

      setAffirmations(prev => {
        // Prevent exact text duplicates
        const uniqueNew = newAffirmations.filter(n => !prev.some(p => p.text === n.text));
        return [...prev, ...uniqueNew];
      });
    } catch (error) {
      console.warn("Failed to load affirmations:", error);
    } finally {
      setLoading(false);
    }
  };

  const renderItem = ({ item }: { item: Affirmation }) => (
    <View style={styles.affirmationPage}>
      <View style={styles.homeMain}>
        <Text style={styles.homeAffirmation}>
          {item.text}
        </Text>
      </View>

      {/* Action Buttons INSIDE the scrollable page */}
      <View style={styles.cardActions}>
        <TouchableOpacity style={styles.cardActionButton}>
          <MaterialIcons name="share" size={28} color="rgba(255,255,255,0.8)" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.cardActionButton}>
          <MaterialIcons name="favorite-border" size={32} color="rgba(255,255,255,0.8)" />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.homeContainer}>
      <CinematicBackground />


      {/* Main Swipeable Content */}
      <FlatList
        data={affirmations}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        pagingEnabled
        showsVerticalScrollIndicator={false}
        snapToAlignment="start"
        decelerationRate="fast"
        snapToInterval={Dimensions.get('window').height}
        onEndReached={loadMore}
        onEndReachedThreshold={0.8}
        contentContainerStyle={{ flexGrow: 1 }}
        style={styles.homeFlatList}
        ListEmptyComponent={
          <View style={[styles.affirmationPage, { justifyContent: 'center', alignItems: 'center' }]}>
            <ActivityIndicator size="large" color="#af25f4" />
            <Text style={{
              color: '#E9D5FF',
              marginTop: 20,
              fontSize: 16,
              fontWeight: '500',
              fontFamily: 'System'
            }}>Conectando con el universo...</Text>
          </View>
        }
      />

      {/* TOP OVERLAY: Header */}
      <SafeAreaView style={styles.homeTopOverlay} pointerEvents="box-none">
        <View style={styles.homeHeader}>
          <TouchableOpacity style={styles.homeHeaderButton} onPress={onReset}>
            <MaterialIcons name="person-outline" size={24} color="#E2E8F0" />
          </TouchableOpacity>

          <View style={styles.homeHeaderCenter}>
            <MaterialIcons name="favorite" size={16} color="#af25f4" />
            <Text style={styles.homeHeaderText}>{affirmations.length}</Text>
          </View>

          <TouchableOpacity style={styles.homeHeaderButton}>
            <MaterialIcons name="workspace-premium" size={24} color="#af25f4" />
          </TouchableOpacity>
        </View>
      </SafeAreaView>

      {/* BOTTOM OVERLAY: Navigation Only */}
      <SafeAreaView style={styles.homeBottomOverlay} pointerEvents="box-none">
        <View style={styles.homeActionsContainer} pointerEvents="box-none">

          {/* Swipe Hint - Subtle */}
          <View style={styles.homeSwipeHint}>
            <MaterialIcons name="keyboard-arrow-up" size={24} color="rgba(255,255,255,0.3)" />
          </View>

          {/* Bottom Nav Bar - Minimalist */}
          <View style={styles.homeNav}>
            <TouchableOpacity style={styles.homeNavButton} onPress={() => onNavigate(ScreenName.CATEGORIES)}>
              <MaterialIcons name="grid-view" size={28} color="rgba(255, 255, 255, 0.4)" />
            </TouchableOpacity>

            <View style={styles.homeNavCenter}>
              {/* Practice button moved or removed for simplicity as requested, keeping center clean */}
            </View>

            <TouchableOpacity style={styles.homeNavButton}>
              <MaterialIcons name="person-outline" size={28} color="rgba(255, 255, 255, 0.4)" />
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    </View>
  );
};

import { CategoriesScreen } from './components/CategoriesScreen';

// Main App Component
const App: React.FC = () => {
  const [screen, setScreen] = useState<ScreenName>(ScreenName.WELCOME);
  const [formData, setFormData] = useState<OnboardingData>(INITIAL_DATA);

  const updateData = (data: Partial<OnboardingData>) => {
    setFormData(prev => ({ ...prev, ...data }));
  };

  useEffect(() => {
    registerForPushNotificationsAsync();
  }, []);

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
          onBack={() => setScreen(ScreenName.WELCOME)}
        />;
      case ScreenName.AGE:
        return <AgeScreen
          selected={formData.ageRange}
          onSelect={(v) => updateData({ ageRange: v })}
          onNext={() => setScreen(ScreenName.INTERESTS)}
          onBack={() => setScreen(ScreenName.NAME)}
        />;
      case ScreenName.INTERESTS:
        return <InterestsScreen
          selected={formData.interests}
          toggle={(id) => toggleSelection('interests', id)}
          onNext={() => setScreen(ScreenName.STREAK)}
          onBack={() => setScreen(ScreenName.AGE)}
        />;
      case ScreenName.STREAK:
        return <StreakScreen
          onNext={() => setScreen(ScreenName.MENTAL_HEALTH)}
          onBack={() => setScreen(ScreenName.INTERESTS)}
        />;
      case ScreenName.MENTAL_HEALTH:
        return <MentalHealthScreen
          selected={formData.mentalHealthHabits}
          toggle={(id) => toggleSelection('mentalHealthHabits', id)}
          onNext={() => setScreen(ScreenName.NOTIFICATIONS)}
          onBack={() => setScreen(ScreenName.STREAK)}
        />;
      case ScreenName.NOTIFICATIONS:
        return <NotificationScreen
          data={formData}
          update={updateData}
          onNext={() => setScreen(ScreenName.GENDER)}
          onBack={() => setScreen(ScreenName.MENTAL_HEALTH)}
        />;
      case ScreenName.GENDER:
        return <GenderScreen
          selected={formData.gender}
          onSelect={(v) => updateData({ gender: v })}
          onNext={() => setScreen(ScreenName.WIDGET)}
          onBack={() => setScreen(ScreenName.NOTIFICATIONS)}
        />;
      case ScreenName.WIDGET:
        return <WidgetScreen
          onNext={() => setScreen(ScreenName.HOME)}
          onBack={() => setScreen(ScreenName.GENDER)}
        />;
      case ScreenName.HOME:
        return <HomeScreen
          onReset={() => setScreen(ScreenName.WELCOME)}
          onNavigate={(s) => setScreen(s)}
          userData={formData}
        />;
      case ScreenName.CATEGORIES:
        return <CategoriesScreen onBack={() => setScreen(ScreenName.HOME)} />;
      default:
        return <View><Text>Unknown Screen</Text></View>;
    }
  };

  return (
    <View style={styles.safeArea}>
      <StatusBar style="light" />
      <CinematicBackground />
      {renderScreen()}
    </View>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#070A1A', // Global base color
  },
  // Welcome Screen
  welcomeContainer: {
    flex: 1,
    backgroundColor: 'transparent',
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
  },
  screenTitle: {
    fontSize: 32,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 16,
    letterSpacing: -0.5,
    lineHeight: 38,
  },
  screenSubtitle: {
    fontSize: 16,
    fontWeight: '400',
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'center',
    marginBottom: 40,
    lineHeight: 24,
    paddingHorizontal: 20,
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
    borderColor: '#7C3AED',
    borderRadius: 22,
    paddingVertical: 20,
    paddingHorizontal: 24,
    fontSize: 18,
    color: '#FFFFFF',
  },
  optionsContainer: {
    width: '100%',
    gap: 8,
    marginTop: 8,
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
    backgroundColor: 'rgba(124, 58, 237, 0.15)',
    borderColor: '#7C3AED',
    borderWidth: 2,
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
    borderColor: '#7C3AED',
  },
  radioDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#7C3AED',
  },
  interestsGrid: {
    width: '100%',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginTop: 10,
    justifyContent: 'center', // Center chips
  },
  interestCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 30,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    // Removed fixed width for chip style
  },
  interestCardSelected: {
    backgroundColor: 'rgba(124, 58, 237, 0.15)',
    borderColor: '#7C3AED',
    borderWidth: 1.5,
  },
  interestText: {
    fontSize: 16,
    fontWeight: '400',
    color: 'rgba(255, 255, 255, 0.7)',
    // Check this: removed flex: 1 and textAlign to fit content
  },
  interestTextSelected: {
    color: '#FFFFFF',
    fontWeight: '600',
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
    backgroundColor: '#7C3AED',
    borderColor: '#A78BFA',
    borderWidth: 1.5,
    shadowColor: '#7C3AED',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 10,
    elevation: 8,
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
    marginTop: 0,
    marginBottom: 8,
    padding: 0,
    height: 240,
    justifyContent: 'center',
    alignItems: 'center',
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
    paddingVertical: 12,
    paddingHorizontal: 20,
    marginBottom: 0,
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
    minWidth: 60,
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
  // Home Styles
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
  homeFlatList: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 10,
  },
  affirmationPage: {
    height: Dimensions.get('window').height,
    width: SCREEN_WIDTH,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    position: 'relative',
  },
  homeMain: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    // Removed excessive margin to center content better
    marginBottom: 0,
  },
  homeAffirmation: {
    fontSize: 36, // Increased size
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
    lineHeight: 48,
    letterSpacing: -0.5,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 10,
  },
  cardActions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 40,
    marginTop: 60,
  },
  cardActionButton: {
    padding: 12,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 50,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  homeTopOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 50,
  },
  homeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 10,
    height: 60,
  },
  homeHeaderButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  homeHeaderCenter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255,255,255,0.08)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  homeHeaderText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 14,
  },
  homeBottomOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 50,
    justifyContent: 'flex-end',
  },
  homeActionsContainer: {
    width: '100%',
    alignItems: 'center',
    paddingBottom: 20,
  },
  homeSwipeHint: {
    alignItems: 'center',
    marginBottom: 20,
    opacity: 0.6,
  },
  homeNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between', // Spread buttons to corners
    width: '100%',
    paddingHorizontal: 40,
    paddingVertical: 10,
  },
  homeNavButton: {
    padding: 10,
  },
  homeNavCenter: {
    flex: 1,
  },
  homeIndicator: {
    height: 5,
    width: 134,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 3,
    alignSelf: 'center',
    marginBottom: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 30,
  },
  modalContent: {
    width: '100%',
    maxHeight: '60%',
  },
  timePickerContainer: {
    width: '100%',
    padding: 24,
    alignItems: 'center',
  },
  modalTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 20,
    textAlign: 'center',
  },
  timeRow: {
    width: '100%',
    paddingVertical: 18,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  timeRowActive: {
    backgroundColor: 'rgba(124, 58, 237, 0.08)',
  },
  timeRowText: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 18,
    fontWeight: '400',
  },
  timeRowTextActive: {
    color: '#A78BFA',
    fontWeight: '600',
  },
  // Widget Screen Styles
  widgetIconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
    position: 'relative',
  },
  widgetIconBox: {
    width: 80,
    height: 80,
    borderRadius: 18,
    backgroundColor: '#5B21B6',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    transform: [{ rotate: '3deg' }],
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  widgetMockup: {
    width: '100%',
    alignItems: 'center',
    marginTop: 20,
  },
  widgetPhone: {
    width: 280,
    aspectRatio: 9 / 15, // Balanced height
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 40,
    borderWidth: 4,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 15,
    position: 'relative',
  },
  widgetPhoneNotch: {
    position: 'absolute',
    top: 0,
    alignSelf: 'center', // Use flexbox centering instead of transform
    width: 96,
    height: 24,
    backgroundColor: '#000000',
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
    zIndex: 20,
  },
  widgetPreview: {
    width: '100%',
    paddingTop: 32,
    marginBottom: 12, // Reduced spacing
  },
  widgetCard: {
    width: '100%',
    backgroundColor: 'rgba(45, 42, 85, 0.9)',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    shadowColor: '#7C3AED',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  widgetCardIconContainer: {
    flexShrink: 0,
  },
  widgetCardIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#7C3AED',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 4,
    elevation: 3,
  },
  widgetCardText: {
    flex: 1,
    gap: 2,
  },
  widgetCardLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: 'rgba(255, 255, 255, 0.5)',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  widgetCardAffirmation: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.2,
  },
  widgetAppGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    rowGap: 12, // Reduced from 16 to fit 3 rows
    paddingHorizontal: 0,
    width: '100%',
    justifyContent: 'center',
    marginBottom: 16, // Reduced margin
  },
  widgetAppIcon: {
    width: 48,
    height: 48,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
  },
  widgetDock: {
    flexDirection: 'row',
    justifyContent: 'center', // Changed from space-between to center to avoid edge collision
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 24,
    padding: 12,
    marginTop: 'auto',
    marginBottom: 16,
    width: '100%',
    gap: 12, // Explicit gap handles separation
  },
  widgetDockIcon: {
    width: 48,
    height: 48,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 14,
  },
});

export default App;
