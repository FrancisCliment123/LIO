import WidgetKit
import SwiftUI

struct AffirmationProvider: TimelineProvider {
    let groupID = "group.com.cisfran.lio"
    
    // Fallback affirmations when no data is shared yet
    let fallbackAffirmations = [
        "Hoy elijo ser mi mejor versión ✨",
        "Soy capaz de cosas increíbles 🌟",
        "Mi luz interior brilla con fuerza 💫",
        "Cada día es una nueva oportunidad 🚀",
        "Confío en mi camino y mi proceso 🦋"
    ]
    
    func placeholder(in context: Context) -> AffirmationEntry {
        AffirmationEntry(
            date: Date(),
            affirmation: "Hoy elijo ser mi mejor versión ✨",
            userName: "amigo"
        )
    }

    func getSnapshot(in context: Context, completion: @escaping (AffirmationEntry) -> Void) {
        let entry = getEntryFromDefaults()
        completion(entry)
    }
    
    func getTimeline(in context: Context, completion: @escaping (Timeline<AffirmationEntry>) -> Void) {
        let currentEntry = getEntryFromDefaults()
        
        // Refresh every 30 minutes
        let nextUpdate = Calendar.current.date(byAdding: .minute, value: 30, to: Date())!
        let timeline = Timeline(entries: [currentEntry], policy: .after(nextUpdate))
        completion(timeline)
    }
    
    private func getEntryFromDefaults() -> AffirmationEntry {
        let defaults = UserDefaults(suiteName: groupID)
        let affirmation = defaults?.string(forKey: "currentAffirmation") ?? fallbackAffirmations.randomElement()!
        let userName = defaults?.string(forKey: "userName") ?? ""
        
        return AffirmationEntry(
            date: Date(),
            affirmation: affirmation,
            userName: userName
        )
    }
}

struct AffirmationEntry: TimelineEntry {
    let date: Date
    let affirmation: String
    let userName: String
}

// MARK: - Small Widget View
struct SmallWidgetView: View {
    var entry: AffirmationEntry
    
    var body: some View {
        ZStack {
            // Cosmic gradient background
            LinearGradient(
                colors: [
                    Color(red: 0.04, green: 0.05, blue: 0.12),
                    Color(red: 0.10, green: 0.08, blue: 0.21),
                    Color(red: 0.06, green: 0.10, blue: 0.24)
                ],
                startPoint: .topLeading,
                endPoint: .bottomTrailing
            )
            
            // Subtle purple glow
            Circle()
                .fill(
                    RadialGradient(
                        colors: [
                            Color(red: 0.49, green: 0.23, blue: 0.93).opacity(0.3),
                            Color.clear
                        ],
                        center: .center,
                        startRadius: 0,
                        endRadius: 80
                    )
                )
                .offset(x: -20, y: -30)
            
            VStack(alignment: .leading, spacing: 6) {
                // Lio branding
                HStack(spacing: 4) {
                    Image(systemName: "sparkles")
                        .font(.system(size: 10, weight: .bold))
                        .foregroundColor(Color(red: 0.65, green: 0.55, blue: 0.98))
                    Text("Lio")
                        .font(.system(size: 11, weight: .bold))
                        .foregroundColor(Color(red: 0.65, green: 0.55, blue: 0.98))
                }
                
                Spacer()
                
                // Affirmation text
                Text(entry.affirmation)
                    .font(.system(size: 13, weight: .semibold, design: .rounded))
                    .foregroundColor(.white)
                    .lineLimit(4)
                    .minimumScaleFactor(0.8)
                
                Spacer(minLength: 2)
            }
            .padding(14)
        }
    }
}

// MARK: - Medium Widget View
struct MediumWidgetView: View {
    var entry: AffirmationEntry
    
    var body: some View {
        ZStack {
            // Cosmic gradient background
            LinearGradient(
                colors: [
                    Color(red: 0.04, green: 0.05, blue: 0.12),
                    Color(red: 0.10, green: 0.08, blue: 0.21),
                    Color(red: 0.06, green: 0.10, blue: 0.24)
                ],
                startPoint: .topLeading,
                endPoint: .bottomTrailing
            )
            
            // Decorative glow orbs
            Circle()
                .fill(
                    RadialGradient(
                        colors: [
                            Color(red: 0.49, green: 0.23, blue: 0.93).opacity(0.25),
                            Color.clear
                        ],
                        center: .center,
                        startRadius: 0,
                        endRadius: 100
                    )
                )
                .offset(x: -80, y: -40)
            
            Circle()
                .fill(
                    RadialGradient(
                        colors: [
                            Color(red: 0.69, green: 0.15, blue: 0.96).opacity(0.15),
                            Color.clear
                        ],
                        center: .center,
                        startRadius: 0,
                        endRadius: 80
                    )
                )
                .offset(x: 100, y: 30)
            
            HStack(spacing: 16) {
                VStack(alignment: .leading, spacing: 8) {
                    // Lio branding
                    HStack(spacing: 6) {
                        Image(systemName: "sparkles")
                            .font(.system(size: 12, weight: .bold))
                            .foregroundColor(Color(red: 0.65, green: 0.55, blue: 0.98))
                        Text("Lio")
                            .font(.system(size: 13, weight: .bold))
                            .foregroundColor(Color(red: 0.65, green: 0.55, blue: 0.98))
                    }
                    
                    Spacer()
                    
                    // Affirmation text
                    Text(entry.affirmation)
                        .font(.system(size: 16, weight: .semibold, design: .rounded))
                        .foregroundColor(.white)
                        .lineLimit(3)
                        .minimumScaleFactor(0.8)
                    
                    Spacer(minLength: 2)
                    
                    // Greeting
                    if !entry.userName.isEmpty {
                        Text("Para ti, \(entry.userName) 💜")
                            .font(.system(size: 11, weight: .medium))
                            .foregroundColor(Color(red: 0.65, green: 0.55, blue: 0.98).opacity(0.8))
                    }
                }
                .frame(maxWidth: .infinity, alignment: .leading)
                
                // Decorative star icon
                VStack {
                    Spacer()
                    Image(systemName: "star.fill")
                        .font(.system(size: 28))
                        .foregroundStyle(
                            LinearGradient(
                                colors: [
                                    Color(red: 0.69, green: 0.15, blue: 0.96),
                                    Color(red: 0.49, green: 0.23, blue: 0.93)
                                ],
                                startPoint: .top,
                                endPoint: .bottom
                            )
                        )
                        .opacity(0.6)
                    Spacer()
                }
                .frame(width: 50)
            }
            .padding(16)
        }
    }
}

// MARK: - Widget Definition
struct LioAffirmationWidget: Widget {
    let kind: String = "LioAffirmationWidget"

    var body: some WidgetConfiguration {
        StaticConfiguration(kind: kind, provider: AffirmationProvider()) { entry in
            if #available(iOS 17.0, *) {
                Group {
                    widgetFamilyAdaptiveView(entry: entry)
                }
                .containerBackground(.clear, for: .widget)
            } else {
                widgetFamilyAdaptiveView(entry: entry)
            }
        }
        .configurationDisplayName("Lio - Afirmaciones")
        .description("Tu afirmación diaria para iluminar tu día ✨")
        .supportedFamilies([.systemSmall, .systemMedium])
    }
}

@ViewBuilder
func widgetFamilyAdaptiveView(entry: AffirmationEntry) -> some View {
    // We use Environment to detect family but since we can't in a free function,
    // we use both views and let the system pick based on supportedFamilies
    SmallWidgetView(entry: entry)
}

// Use WidgetBundle to show the right size
struct LioSmallWidget: Widget {
    let kind: String = "LioSmallWidget"
    
    var body: some WidgetConfiguration {
        StaticConfiguration(kind: kind, provider: AffirmationProvider()) { entry in
            if #available(iOS 17.0, *) {
                SmallWidgetView(entry: entry)
                    .containerBackground(.clear, for: .widget)
            } else {
                SmallWidgetView(entry: entry)
            }
        }
        .configurationDisplayName("Lio Mini")
        .description("Afirmación del momento ✨")
        .supportedFamilies([.systemSmall])
    }
}

struct LioMediumWidget: Widget {
    let kind: String = "LioMediumWidget"
    
    var body: some WidgetConfiguration {
        StaticConfiguration(kind: kind, provider: AffirmationProvider()) { entry in
            if #available(iOS 17.0, *) {
                MediumWidgetView(entry: entry)
                    .containerBackground(.clear, for: .widget)
            } else {
                MediumWidgetView(entry: entry)
            }
        }
        .configurationDisplayName("Lio")
        .description("Tu afirmación diaria para iluminar tu día 💜")
        .supportedFamilies([.systemMedium])
    }
}

#Preview(as: .systemSmall) {
    LioSmallWidget()
} timeline: {
    AffirmationEntry(date: .now, affirmation: "Hoy elijo ser mi mejor versión ✨", userName: "Francis")
}

#Preview(as: .systemMedium) {
    LioMediumWidget()
} timeline: {
    AffirmationEntry(date: .now, affirmation: "Soy capaz de cosas increíbles y cada día me acerco más a mis sueños 🌟", userName: "Francis")
}
