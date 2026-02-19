import WidgetKit
import SwiftUI

struct AffirmationProvider: TimelineProvider {
    let groupID = "group.com.cisfran.lio"
    
    let fallbackAffirmations = [
        "Hoy elijo ser mi mejor versión",
        "Soy capaz de cosas increíbles",
        "Mi luz interior brilla con fuerza",
        "Cada día es una nueva oportunidad",
        "Confío en mi camino y mi proceso"
    ]
    
    func placeholder(in context: Context) -> AffirmationEntry {
        AffirmationEntry(
            date: Date(),
            affirmation: "Hoy elijo ser mi mejor versión"
        )
    }

    func getSnapshot(in context: Context, completion: @escaping (AffirmationEntry) -> Void) {
        let entry = getEntryFromDefaults()
        completion(entry)
    }
    
    func getTimeline(in context: Context, completion: @escaping (Timeline<AffirmationEntry>) -> Void) {
        let currentEntry = getEntryFromDefaults()
        let nextUpdate = Calendar.current.date(byAdding: .minute, value: 30, to: Date())!
        let timeline = Timeline(entries: [currentEntry], policy: .after(nextUpdate))
        completion(timeline)
    }
    
    private func getEntryFromDefaults() -> AffirmationEntry {
        let defaults = UserDefaults(suiteName: groupID)
        let affirmation = defaults?.string(forKey: "currentAffirmation") ?? fallbackAffirmations.randomElement()!
        
        return AffirmationEntry(
            date: Date(),
            affirmation: affirmation
        )
    }
}

struct AffirmationEntry: TimelineEntry {
    let date: Date
    let affirmation: String
}

// MARK: - Widget View (adapts to all sizes)
struct LioWidgetView: View {
    @Environment(\.widgetFamily) var widgetFamily
    var entry: AffirmationEntry
    
    var body: some View {
        ZStack {
            // Cosmic gradient background
            LinearGradient(
                colors: [
                    Color(red: 0.04, green: 0.05, blue: 0.12),
                    Color(red: 0.08, green: 0.06, blue: 0.18),
                    Color(red: 0.10, green: 0.08, blue: 0.21),
                    Color(red: 0.06, green: 0.10, blue: 0.24)
                ],
                startPoint: .topLeading,
                endPoint: .bottomTrailing
            )
            .ignoresSafeArea()
            
            VStack(alignment: .leading, spacing: 0) {
                Spacer()
                
                // Affirmation text
                Text(entry.affirmation)
                    .font(.system(size: fontSize, weight: .semibold, design: .rounded))
                    .foregroundColor(.white)
                    .lineLimit(maxLines)
                    .minimumScaleFactor(0.7)
                    .frame(maxWidth: .infinity, alignment: .leading)
                
                Spacer()
                
                // Small Lio star logo at bottom-left
                HStack {
                    Image(systemName: "sparkle")
                        .font(.system(size: logoSize, weight: .semibold))
                        .foregroundColor(Color(red: 0.65, green: 0.55, blue: 0.98))
                        .opacity(0.5)
                    Spacer()
                }
            }
            .padding(contentPadding)
        }
    }
    
    private var fontSize: CGFloat {
        switch widgetFamily {
        case .systemSmall: return 15
        case .systemMedium: return 20
        case .systemLarge: return 28
        default: return 16
        }
    }
    
    private var maxLines: Int {
        switch widgetFamily {
        case .systemSmall: return 5
        case .systemMedium: return 3
        case .systemLarge: return 6
        default: return 4
        }
    }
    
    private var logoSize: CGFloat {
        switch widgetFamily {
        case .systemSmall: return 12
        case .systemMedium: return 14
        case .systemLarge: return 16
        default: return 12
        }
    }
    
    private var contentPadding: CGFloat {
        switch widgetFamily {
        case .systemSmall: return 14
        case .systemMedium: return 16
        case .systemLarge: return 20
        default: return 14
        }
    }
}

// MARK: - Single Widget supporting all 3 sizes
struct LioWidget: Widget {
    let kind: String = "LioWidget"
    
    var body: some WidgetConfiguration {
        StaticConfiguration(kind: kind, provider: AffirmationProvider()) { entry in
            if #available(iOS 17.0, *) {
                LioWidgetView(entry: entry)
                    .containerBackground(.clear, for: .widget)
            } else {
                LioWidgetView(entry: entry)
            }
        }
        .configurationDisplayName("Lio")
        .description("Tu afirmación diaria ✨")
        .supportedFamilies([.systemSmall, .systemMedium, .systemLarge])
    }
}

#Preview(as: .systemSmall) {
    LioWidget()
} timeline: {
    AffirmationEntry(date: .now, affirmation: "Agradezco cada paso, mi fuerza reside en mí.")
}

#Preview(as: .systemMedium) {
    LioWidget()
} timeline: {
    AffirmationEntry(date: .now, affirmation: "Agradezco cada paso, mi fuerza reside en mí.")
}

#Preview(as: .systemLarge) {
    LioWidget()
} timeline: {
    AffirmationEntry(date: .now, affirmation: "Agradezco cada paso, mi fuerza reside en mí.")
}
