import React, { useState } from 'react';
import { ScreenName, OnboardingData, INITIAL_DATA } from './types';
import { OnboardingLayout } from './components/OnboardingLayout';
import { StarParticles } from './components/StarParticles';
import videoUrl from './assets/videos/0dcdfdc7-154c-4728-b5a4-5dd4f80dcd61.mp4';

// --- Screen Components (Inline for single-file request simplicity, usually separate) ---

const WelcomeScreen: React.FC<{ onNext: () => void }> = ({ onNext }) => {
  return (
    <div className="relative w-full h-full flex flex-col overflow-hidden bg-background-dark">
      {/* Ethereal Background */}
      <div className="fixed inset-0 ethereal-bg pointer-events-none"></div>
      
      {/* Interactive Star Particles */}
      <StarParticles />

      {/* Premium Video Container - Integrated Animation */}
      <div className="relative z-10 w-full flex justify-center pt-14 pb-3">
        <div className="logo-video-integrated relative animate-video-entrance" style={{ background: 'transparent' }}>
          <video
            src={videoUrl}
            autoPlay
            loop
            muted
            playsInline
            preload="auto"
            className="logo-video-element"
            style={{ background: 'transparent' }}
          />
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 w-full max-w-md px-8 pt-2 pb-6 flex flex-col items-center justify-center flex-grow">
        <div className="text-center space-y-4 max-w-sm">
          <div className="space-y-2">
            <h1 className="text-5xl font-light tracking-[-0.01em] text-white leading-[1.15]">
              Hola, soy Lio
            </h1>
            <h2 className="text-xl font-light text-white/90 tracking-[-0.005em] leading-relaxed">
              Estoy aquí para iluminar tu día
            </h2>
          </div>
          <div className="pt-3">
            <p className="text-[15px] font-medium text-white/70 leading-[1.65] px-1 tracking-normal">
              Tu dosis diaria de luz. Cultiva una mente positiva y reduce el estrés con afirmaciones diseñadas para ti.
            </p>
          </div>
        </div>
      </div>

      {/* Bottom Section with Button */}
      <div className="relative z-10 w-full max-w-md px-8 pb-16">
        <div className="w-full">
          <button
            onClick={onNext}
            className="button-golden w-full py-5 rounded-full text-[16px] tracking-[0.01em]"
          >
            Encender mi luz
          </button>
        </div>
      </div>
    </div>
  );
};

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
      <div className="w-full flex flex-col items-center text-center space-y-10">
        <div className="space-y-3">
          <h1 className="text-[32px] font-semibold tracking-tight leading-tight text-white">
            ¿Qué categorías te interesan?
          </h1>
          <p className="text-base font-light text-white/60">
            Esto se usará para personalizar tu feed
          </p>
        </div>
        
        <div className="w-full grid grid-cols-2 gap-3 px-4">
          {interests.map((interest) => {
            const isSelected = selected.includes(interest);
            return (
              <button
                key={interest}
                onClick={() => toggle(interest)}
                className={`glass-card rounded-full py-4 px-6 flex items-center gap-2 transition-all duration-300 ${
                  isSelected ? 'bg-white/10 border-white/25' : ''
                }`}
              >
                <span className="text-white text-lg">+</span>
                <span className="text-white text-base font-light tracking-wide text-left flex-1">
                  {interest}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </OnboardingLayout>
  );
};

const StreakScreen: React.FC<{ onNext: () => void }> = ({ onNext }) => {
  return (
    <OnboardingLayout 
      onContinue={onNext} 
      showSkip={false} 
    >
      <div className="w-full flex flex-col items-center text-center space-y-10">
        <div className="space-y-3">
          <h1 className="text-[32px] font-semibold tracking-tight leading-tight text-white">
            Construye un hábito diario de práctica de afirmaciones
          </h1>
        </div>

        <div className="w-full glass-card rounded-[22px] p-6 flex flex-col items-center">
          <div className="w-full flex justify-between mb-6 px-1">
            {['Ma', 'Mi', 'Ju', 'Vi', 'Sa', 'Do', 'Lu'].map((day, idx) => (
              <div key={day} className="flex flex-col items-center gap-2">
                <span className={`text-xs font-medium uppercase tracking-wider ${idx === 0 ? 'text-white' : 'text-white/60'}`}>
                  {day}
                </span>
                <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300
                  ${idx === 0 ? 'bg-white/20 border border-white/30' : 'bg-white/5 border border-white/10'}`}
                >
                  {idx === 0 && <span className="material-symbols-outlined text-white text-lg">check</span>}
                </div>
              </div>
            ))}
          </div>
          <p className="text-white/60 text-sm font-light tracking-wide">
            Construye una racha, día a día
          </p>
        </div>
      </div>
    </OnboardingLayout>
  );
};

const AgeScreen: React.FC<{ 
  selected: string; 
  onSelect: (v: string) => void; 
  onNext: () => void 
}> = ({ selected, onSelect, onNext }) => {
  const ranges = ["13 a 17", "18 a 24", "25 a 34", "35 a 44", "45 a 54", "+55"];

  return (
    <OnboardingLayout onContinue={onNext} isValid={!!selected}>
      <div className="w-full flex flex-col items-center text-center space-y-10">
        <div className="space-y-3">
          <h1 className="text-[32px] font-semibold tracking-tight leading-tight text-white">
            ¿Cuántos años tienes?
          </h1>
          <p className="text-base font-light text-white/60">
            Tu edad se usa para personalizar el contenido
          </p>
        </div>
        <div className="w-full space-y-3">
          {ranges.map((range) => (
            <button
              key={range}
              onClick={() => onSelect(range)}
              className="glass-card w-full py-5 px-8 flex items-center justify-between rounded-[22px]"
            >
              <span className="text-lg font-light tracking-wide text-white">{range}</span>
              <div className={`radio-circle ${selected === range ? 'border-white/60' : ''}`}>
                {selected === range && (
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                )}
              </div>
            </button>
          ))}
        </div>
      </div>
    </OnboardingLayout>
  );
};

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
      <div className="w-full flex flex-col items-center text-center space-y-10">
        <div className="space-y-3">
          <h1 className="text-[32px] font-semibold tracking-tight leading-tight text-white">
            ¿Qué quieres mejorar?
          </h1>
          <p className="text-base font-light text-white/60">
            Elige al menos una para adaptar el contenido a tus necesidades
          </p>
        </div>
        
        <div className="w-full space-y-3">
          {options.map((opt) => {
            const isSelected = selected.includes(opt.text);
            return (
              <button
                key={opt.text}
                onClick={() => toggle(opt.text)}
                className={`glass-card w-full py-5 px-8 flex items-center justify-between rounded-[22px] ${
                  isSelected ? 'bg-white/10 border-white/25' : ''
                }`}
              >
                <div className="flex items-center gap-4">
                  <span className="material-symbols-outlined text-white text-xl">{opt.icon}</span>
                  <span className="text-lg font-light tracking-wide text-white text-left">
                    {opt.text}
                  </span>
                </div>
                <div className={`radio-circle ${isSelected ? 'border-white/60' : ''}`}>
                  {isSelected && (
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </OnboardingLayout>
  );
};

const NameScreen: React.FC<{ 
  name: string; 
  setName: (n: string) => void; 
  onNext: () => void 
}> = ({ name, setName, onNext }) => {
  return (
    <OnboardingLayout onContinue={onNext} isValid={name.length > 0}>
      <div className="w-full flex flex-col items-center text-center space-y-10">
        <div className="space-y-3">
          <h1 className="text-[32px] font-semibold tracking-tight leading-tight text-white">
            ¿Cómo quieres que te llamemos?
          </h1>
          <p className="text-base font-light text-white/60">
            Tu nombre aparecerá en tus afirmaciones
          </p>
        </div>
        
        <div className="w-full px-4">
          <input 
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Tu nombre"
            className="w-full bg-white/5 backdrop-blur-md border-2 border-blue-500 rounded-[22px] py-5 px-6 text-lg text-white placeholder:text-white/50 focus:border-blue-400 focus:ring-0 transition-all duration-300 outline-none"
            autoFocus
          />
        </div>
      </div>
    </OnboardingLayout>
  );
};

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
      <div className="w-full flex flex-col items-center text-center space-y-10">
        <div className="space-y-3">
          <h1 className="text-[32px] font-semibold tracking-tight leading-tight text-white">
            Recibe afirmaciones a lo largo del día
          </h1>
          <p className="text-base font-light text-white/60">
            Leer afirmaciones regularmente te ayudará a alcanzar tus metas
          </p>
        </div>

        {/* Card Preview */}
        <div className="w-full glass-card rounded-[22px] p-5">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center shrink-0">
              <span className="text-white font-bold text-xs">Lio</span>
            </div>
            <div className="flex-1">
              <div className="flex justify-between items-center mb-1">
                <span className="text-white font-medium text-sm tracking-wide">Lio</span>
                <span className="text-white/60 text-xs">Ahora</span>
              </div>
              <p className="text-white/80 text-sm leading-snug">
                Merezco la posibilidad de alcanzar mi máximo potencial.
              </p>
            </div>
          </div>
        </div>

        <div className="w-full space-y-3">
          {/* Count */}
          <div className="glass-card w-full flex items-center justify-between px-6 py-4 rounded-[22px]">
            <span className="text-white font-light text-lg tracking-wide">Cantidad</span>
            <div className="flex items-center gap-4">
              <button onClick={() => adjustCount(-1)} className="w-9 h-9 rounded-full border border-white/20 flex items-center justify-center text-white active:bg-white/10 transition-all duration-200">
                <span className="material-symbols-outlined text-lg">remove</span>
              </button>
              <span className="text-white font-medium text-lg w-8 text-center">{data.notificationCount}x</span>
              <button onClick={() => adjustCount(1)} className="w-9 h-9 rounded-full border border-white/20 flex items-center justify-center text-white active:bg-white/10 transition-all duration-200">
                <span className="material-symbols-outlined text-lg">add</span>
              </button>
            </div>
          </div>
          
          {/* Time */}
          <div className="glass-card w-full flex items-center justify-between px-6 py-4 rounded-[22px]">
            <span className="text-white font-light text-lg tracking-wide">Desde las</span>
            <div className="bg-white/5 rounded-lg px-3 py-1.5 flex items-center gap-2 border border-white/10">
              <span className="text-white font-medium text-sm">{data.startTime}</span>
              <span className="material-symbols-outlined text-white text-sm">expand_more</span>
            </div>
          </div>

          <div className="glass-card w-full flex items-center justify-between px-6 py-4 rounded-[22px]">
            <span className="text-white font-light text-lg tracking-wide">Hasta las</span>
            <div className="bg-white/5 rounded-lg px-3 py-1.5 flex items-center gap-2 border border-white/10">
              <span className="text-white font-medium text-sm">{data.endTime}</span>
              <span className="material-symbols-outlined text-white text-sm">expand_more</span>
            </div>
          </div>
        </div>
      </div>
    </OnboardingLayout>
  );
};

const GenderScreen: React.FC<{ 
  selected: string; 
  onSelect: (v: string) => void; 
  onNext: () => void 
}> = ({ selected, onSelect, onNext }) => {
  const options = ["Femenino", "Masculino", "Otros", "Prefiero no decirlo"];

  return (
    <OnboardingLayout onContinue={onNext} isValid={!!selected}>
      <div className="w-full flex flex-col items-center text-center space-y-10">
        <div className="space-y-3">
          <h1 className="text-[32px] font-semibold tracking-tight leading-tight text-white">
            ¿Qué opción te representa mejor?
          </h1>
          <p className="text-base font-light text-white/60">
            Algunas afirmaciones usarán tu género o tus pronombres
          </p>
        </div>

        <div className="w-full space-y-3">
          {options.map((opt) => (
            <button
              key={opt}
              onClick={() => onSelect(opt)}
              className={`glass-card w-full py-5 px-8 flex items-center justify-between rounded-[22px] ${
                selected === opt ? 'bg-white/10 border-white/25' : ''
              }`}
            >
              <span className="text-lg font-light tracking-wide text-white">{opt}</span>
              <div className={`radio-circle ${selected === opt ? 'border-white/60' : ''}`}>
                {selected === opt && (
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                )}
              </div>
            </button>
          ))}
        </div>
      </div>
    </OnboardingLayout>
  );
};

// --- Main App Component ---

const App: React.FC = () => {
  const [screen, setScreen] = useState<ScreenName>(ScreenName.WELCOME);
  const [formData, setFormData] = useState<OnboardingData>(INITIAL_DATA);
  const [darkMode, setDarkMode] = useState(true); // Default for Home

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

  // Screen Switcher
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
        return <div>Unknown Screen</div>;
    }
  };

  return (
    <div className="relative w-full max-w-md mx-auto h-[100dvh] shadow-2xl overflow-hidden bg-background-dark">
      {renderScreen()}
    </div>
  );
};

// --- Home Screen (Separate visual style) ---

const HomeScreen: React.FC<{ onReset: () => void }> = ({ onReset }) => {
  // Hardcoded dark mode for home screen as per design
  return (
    <div className="relative w-full h-full flex flex-col bg-background-dark text-slate-200 font-sans overflow-hidden animate-fade-in">
      {/* Radial Gradient Overlay */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(212,175,55,0.08)_0%,transparent_70%)] pointer-events-none"></div>

      {/* Top Bar */}
      <div className="h-12 w-full flex justify-between items-center px-8 pt-4 mb-2">
        <span className="text-xs font-semibold">20:57</span>
        <div className="flex items-center gap-1">
           <span className="material-symbols-rounded text-sm">signal_cellular_alt</span>
           <span className="text-xs font-semibold italic">4G</span>
           <span className="material-symbols-rounded text-sm rotate-90">battery_horiz_050</span>
        </div>
      </div>

      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 z-10">
        <button onClick={onReset} className="w-12 h-12 flex items-center justify-center rounded-full glass-panel-premium bg-accent-dark/50 active:scale-95 transition-all duration-300 hover:scale-105">
           <span className="material-symbols-rounded text-2xl text-slate-300">person</span>
        </button>
        
        <div className="flex items-center gap-3 px-4 py-2.5 rounded-full glass-panel-premium bg-accent-dark/50 shadow-medium">
           <span className="material-symbols-rounded text-primary text-lg fill-current">favorite</span>
           <span className="text-xs font-medium tracking-wider text-slate-300">0/5</span>
           <div className="w-20 h-1.5 bg-slate-200/20 rounded-full overflow-hidden">
             <div className="w-0 h-full bg-gradient-gold rounded-full" style={{ background: 'linear-gradient(90deg, #D4AF37 0%, #F4D03F 100%)' }}></div>
           </div>
        </div>

        <button className="w-12 h-12 flex items-center justify-center rounded-full glass-panel-premium bg-accent-dark/50 active:scale-95 transition-all duration-300 hover:scale-105">
           <span className="material-symbols-rounded text-primary text-2xl">workspace_premium</span>
        </button>
      </header>

      {/* Main Content (Affirmation) */}
      <main className="flex-grow flex flex-col items-center justify-center px-10 text-center relative z-10">
        <h1 className="font-display text-4xl sm:text-5xl leading-tight text-primary gold-glow-strong italic tracking-tight">
          Soy una persona fuerte, segura de sí misma y atraigo conscientemente la felicidad.
        </h1>
      </main>

      {/* Actions */}
      <div className="flex flex-col items-center gap-8 pb-12 z-10">
        <div className="flex items-center gap-12">
           <button className="flex flex-col items-center gap-1 group transition-all duration-300 active:scale-90 hover:scale-110">
             <span className="material-symbols-rounded text-3xl text-slate-400 group-hover:text-primary transition-colors duration-300">ios_share</span>
           </button>
           <button className="flex flex-col items-center gap-1 group transition-all duration-300 active:scale-90 hover:scale-110">
             <span className="material-symbols-rounded text-4xl text-slate-400 group-hover:text-red-400 transition-colors duration-300">favorite</span>
           </button>
        </div>

        <div className="flex flex-col items-center gap-2 opacity-60">
           <span className="text-[10px] uppercase tracking-[0.2em] font-medium text-slate-400">Desliza hacia arriba</span>
           <div className="w-1 h-8 rounded-full bg-gradient-to-b from-primary/50 to-transparent"></div>
        </div>

        {/* Bottom Nav */}
        <nav className="flex items-center justify-between w-[90%] glass-panel-premium border border-white/15 p-2.5 rounded-[2rem] shadow-premium">
           <button className="relative w-14 h-14 flex flex-col items-center justify-center transition-all duration-300 hover:scale-110">
             <span className="absolute -top-1 -right-1 bg-red-400 text-[9px] text-white font-bold px-1.5 py-0.5 rounded-full uppercase shadow-medium">Nuevo</span>
             <span className="material-symbols-rounded text-2xl text-slate-300 opacity-60">grid_view</span>
           </button>
           
           <button className="flex items-center gap-2 px-6 py-3 bg-white/8 border border-white/15 rounded-full active:bg-white/15 transition-all duration-300 hover:bg-white/12 hover:scale-105">
              <span className="material-symbols-rounded text-xl text-slate-200">self_improvement</span>
              <span className="text-sm font-medium tracking-wide text-slate-200">Práctica</span>
           </button>
           
           <button className="w-14 h-14 flex flex-col items-center justify-center transition-all duration-300 hover:scale-110">
             <span className="material-symbols-rounded text-2xl text-slate-300 opacity-60">palette</span>
           </button>
        </nav>
      </div>
      
      {/* Home Indicator */}
      <div className="h-1.5 w-32 bg-slate-500/30 rounded-full mx-auto mb-2 z-10"></div>
    </div>
  );
};

export default App;