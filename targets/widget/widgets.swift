import WidgetKit
import SwiftUI

// MARK: - Data Models

enum AffirmationCategory: String, CaseIterable {
    case mindfulness = "Mindfulness"
    case motivacion = "Motivación"
    case autocuidado = "Autocuidado"
    case paz = "Paz"
    case bienestar = "Bienestar"
}

struct Affirmation {
    let text: String
    let category: AffirmationCategory
}

// MARK: - Affirmations Database

struct AffirmationsDatabase {
    static let all: [Affirmation] = [
        // Mindfulness
        Affirmation(text: "Vivo en el presente y abrazo cada momento con gratitud", category: .mindfulness),
        Affirmation(text: "Mi respiración me conecta con el ahora", category: .mindfulness),
        Affirmation(text: "Observo mis pensamientos sin juzgarlos", category: .mindfulness),
        Affirmation(text: "Estoy aquí, ahora, y eso es suficiente", category: .mindfulness),
        Affirmation(text: "Encuentro paz en la quietud de este momento", category: .mindfulness),
        Affirmation(text: "Cada respiración me trae calma y claridad", category: .mindfulness),
        Affirmation(text: "Soy consciente de mi cuerpo y sus sensaciones", category: .mindfulness),
        Affirmation(text: "El presente es un regalo que acepto con amor", category: .mindfulness),
        Affirmation(text: "Mi mente está clara y enfocada", category: .mindfulness),
        Affirmation(text: "Observo el mundo con ojos nuevos cada día", category: .mindfulness),
        
        // Motivación
        Affirmation(text: "Tengo el poder de crear la vida que deseo", category: .motivacion),
        Affirmation(text: "Cada día es una nueva oportunidad para crecer", category: .motivacion),
        Affirmation(text: "Soy capaz de superar cualquier obstáculo", category: .motivacion),
        Affirmation(text: "Mi potencial es ilimitado", category: .motivacion),
        Affirmation(text: "Confío en mi capacidad para lograr mis metas", category: .motivacion),
        Affirmation(text: "Soy valiente y enfrentó los desafíos con confianza", category: .motivacion),
        Affirmation(text: "Cada paso que doy me acerca a mis sueños", category: .motivacion),
        Affirmation(text: "Soy resiliente y siempre encuentro una solución", category: .motivacion),
        Affirmation(text: "Merezco el éxito y lo atraigo a mi vida", category: .motivacion),
        Affirmation(text: "Transformo mis miedos en fortaleza", category: .motivacion),
        
        // Autocuidado
        Affirmation(text: "Mi bienestar es una prioridad", category: .autocuidado),
        Affirmation(text: "Me trato con amor y compasión", category: .autocuidado),
        Affirmation(text: "Escucho las necesidades de mi cuerpo y mente", category: .autocuidado),
        Affirmation(text: "Merezco tiempo para descansar y recuperarme", category: .autocuidado),
        Affirmation(text: "Me permito decir no cuando lo necesito", category: .autocuidado),
        Affirmation(text: "Nutro mi ser con pensamientos positivos", category: .autocuidado),
        Affirmation(text: "Soy digno de amor y cuidado", category: .autocuidado),
        Affirmation(text: "Celebro mis logros, grandes y pequeños", category: .autocuidado),
        Affirmation(text: "Me doy permiso para ser imperfecto", category: .autocuidado),
        Affirmation(text: "Mi salud mental es tan importante como la física", category: .autocuidado),
        
        // Paz
        Affirmation(text: "Elijo la paz sobre la preocupación", category: .paz),
        Affirmation(text: "Suelto lo que no puedo controlar", category: .paz),
        Affirmation(text: "La serenidad fluye a través de mí", category: .paz),
        Affirmation(text: "Encuentro armonía en medio del caos", category: .paz),
        Affirmation(text: "Perdono con facilidad y libero resentimientos", category: .paz),
        Affirmation(text: "Mi corazón está en paz", category: .paz),
        Affirmation(text: "Confío en el ritmo natural de la vida", category: .paz),
        Affirmation(text: "La tranquilidad es mi estado natural", category: .paz),
        Affirmation(text: "Respiro profundo y libero la tensión", category: .paz),
        Affirmation(text: "Acepto lo que es y fluyo con la vida", category: .paz),
        
        // Bienestar
        Affirmation(text: "Mi cuerpo y mente están en equilibrio", category: .bienestar),
        Affirmation(text: "Irradio energía positiva y vitalidad", category: .bienestar),
        Affirmation(text: "Elijo hábitos que nutren mi bienestar", category: .bienestar),
        Affirmation(text: "Soy un ser lleno de luz y energía", category: .bienestar),
        Affirmation(text: "Mi salud mejora cada día", category: .bienestar),
        Affirmation(text: "Agradezco a mi cuerpo por todo lo que hace", category: .bienestar),
        Affirmation(text: "Vivo en armonía con mi ser interior", category: .bienestar),
        Affirmation(text: "La alegría fluye naturalmente en mi vida", category: .bienestar),
        Affirmation(text: "Estoy completo tal como soy", category: .bienestar),
        Affirmation(text: "Atraigo experiencias que enriquecen mi vida", category: .bienestar),
    ]
    
    static func random() -> Affirmation {
        all.randomElement() ?? all[0]
    }
}

// MARK: - Timeline Provider

struct Provider: AppIntentTimelineProvider {
    func placeholder(in context: Context) -> SimpleEntry {
        SimpleEntry(date: Date(), affirmation: AffirmationsDatabase.random(), configuration: ConfigurationAppIntent())
    }

    func snapshot(for configuration: ConfigurationAppIntent, in context: Context) async -> SimpleEntry {
        SimpleEntry(date: Date(), affirmation: AffirmationsDatabase.random(), configuration: configuration)
    }
    
    func timeline(for configuration: ConfigurationAppIntent, in context: Context) async -> Timeline<SimpleEntry> {
        var entries: [SimpleEntry] = []

        // Generate timeline entries every 3 hours for 24 hours
        let currentDate = Date()
        for hourOffset in stride(from: 0, to: 24, by: 3) {
            let entryDate = Calendar.current.date(byAdding: .hour, value: hourOffset, to: currentDate)!
            let entry = SimpleEntry(date: entryDate, affirmation: AffirmationsDatabase.random(), configuration: configuration)
            entries.append(entry)
        }

        return Timeline(entries: entries, policy: .atEnd)
    }
}

struct SimpleEntry: TimelineEntry {
    let date: Date
    let affirmation: Affirmation
    let configuration: ConfigurationAppIntent
}

// MARK: - Widget Views

struct widgetEntryView : View {
    var entry: Provider.Entry
    @Environment(\.widgetFamily) var family

    var body: some View {
        ZStack {
            // Main gradient background - matches Lio app theme
            LinearGradient(
                gradient: Gradient(colors: [
                    Color(red: 0.298, green: 0.114, blue: 0.584), // #4C1D95
                    Color(red: 0.427, green: 0.157, blue: 0.847), // #6D28D9
                    Color(red: 0.486, green: 0.227, blue: 0.929)  // #7C3AED
                ]),
                startPoint: .topLeading,
                endPoint: .bottomTrailing
            )
            .ignoresSafeArea()
            
            // Subtle overlay pattern for depth
            LinearGradient(
                gradient: Gradient(colors: [
                    Color.white.opacity(0.05),
                    Color.clear,
                    Color.black.opacity(0.1)
                ]),
                startPoint: .top,
                endPoint: .bottom
            )
            .ignoresSafeArea()
            
            // Glassmorphism container
            VStack(spacing: 0) {
                // Category label with glassmorphism
                HStack {
                    Text(entry.affirmation.category.rawValue)
                        .font(.system(size: family == .systemSmall ? 9 : 10, weight: .semibold, design: .rounded))
                        .textCase(.uppercase)
                        .foregroundColor(.white.opacity(0.7))
                        .tracking(1.2)
                    Spacer()
                }
                .padding(.horizontal, family == .systemSmall ? 14 : 16)
                .padding(.top, family == .systemSmall ? 14 : 16)
                .padding(.bottom, 8)
                
                Spacer()
                
                // Affirmation text - centered
                Text(entry.affirmation.text)
                    .font(.system(
                        size: family == .systemSmall ? 15 : (family == .systemMedium ? 18 : 20),
                        weight: .semibold,
                        design: .rounded
                    ))
                    .foregroundColor(.white)
                    .multilineTextAlignment(.center)
                    .lineLimit(family == .systemSmall ? 6 : 10)
                    .minimumScaleFactor(0.7)
                    .lineSpacing(3)
                    .padding(.horizontal, family == .systemSmall ? 14 : 20)
                
                Spacer()
                
                // Bottom section
                if family != .systemSmall {
                    HStack {
                        // Small sparkle icon
                        Image(systemName: "sparkles")
                            .font(.system(size: 10, weight: .medium))
                            .foregroundColor(.white.opacity(0.5))
                        
                        Text("Lio")
                            .font(.system(size: 10, weight: .medium, design: .rounded))
                            .foregroundColor(.white.opacity(0.5))
                        
                        Spacer()
                        
                        // Time
                        Text(entry.date, style: .time)
                            .font(.system(size: 10, weight: .medium))
                            .foregroundColor(.white.opacity(0.4))
                    }
                    .padding(.horizontal, 16)
                    .padding(.bottom, 14)
                }
            }
            
            // Glass border effect
            RoundedRectangle(cornerRadius: 0)
                .strokeBorder(
                    LinearGradient(
                        colors: [
                            Color.white.opacity(0.15),
                            Color.white.opacity(0.05)
                        ],
                        startPoint: .topLeading,
                        endPoint: .bottomTrailing
                    ),
                    lineWidth: 1
                )
                .ignoresSafeArea()
        }
    }
}

// MARK: - Widget Configuration

struct LioAffirmationsWidget: Widget {
    let kind: String = "LioAffirmationsWidget"

    var body: some WidgetConfiguration {
        AppIntentConfiguration(kind: kind, intent: ConfigurationAppIntent.self, provider: Provider()) { entry in
            widgetEntryView(entry: entry)
                .containerBackground(.fill.tertiary, for: .widget)
        }
        .configurationDisplayName("Afirmaciones Diarias")
        .description("Recibe afirmaciones positivas cada 3 horas")
        .supportedFamilies([.systemSmall, .systemMedium, .systemLarge])
    }
}

// MARK: - Previews

#Preview(as: .systemSmall) {
    LioAffirmationsWidget()
} timeline: {
    SimpleEntry(date: .now, affirmation: AffirmationsDatabase.all[0], configuration: ConfigurationAppIntent())
    SimpleEntry(date: .now, affirmation: AffirmationsDatabase.all[10], configuration: ConfigurationAppIntent())
    SimpleEntry(date: .now, affirmation: AffirmationsDatabase.all[20], configuration: ConfigurationAppIntent())
}

#Preview(as: .systemMedium) {
    LioAffirmationsWidget()
} timeline: {
    SimpleEntry(date: .now, affirmation: AffirmationsDatabase.all[30], configuration: ConfigurationAppIntent())
    SimpleEntry(date: .now, affirmation: AffirmationsDatabase.all[40], configuration: ConfigurationAppIntent())
}

#Preview(as: .systemLarge) {
    LioAffirmationsWidget()
} timeline: {
    SimpleEntry(date: .now, affirmation: AffirmationsDatabase.all[5], configuration: ConfigurationAppIntent())
}
