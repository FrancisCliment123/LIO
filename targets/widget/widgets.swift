import WidgetKit
import SwiftUI
import Intents

struct Provider: TimelineProvider {
    func placeholder(in context: Context) -> SimpleEntry {
        SimpleEntry(date: Date(), affirmation: "Tu luz importa ✨")
    }

    func getSnapshot(in context: Context, completion: @escaping (SimpleEntry) -> ()) {
        let entry = SimpleEntry(date: Date(), affirmation: loadAffirmation())
        completion(entry)
    }

    func getTimeline(in context: Context, completion: @escaping (Timeline<Entry>) -> ()) {
        var entries: [SimpleEntry] = []

        // Refresh current data
        let currentDate = Date()
        let affirmation = loadAffirmation()
        let entry = SimpleEntry(date: currentDate, affirmation: affirmation)
        entries.append(entry)

        // Request a timeline refresh every 15 minutes
        let nextUpdateDate = Calendar.current.date(byAdding: .minute, value: 15, to: currentDate)!
        let timeline = Timeline(entries: entries, policy: .after(nextUpdateDate))
        completion(timeline)
    }
    
    // Helper to load from shared UserDefaults (App Group)
    func loadAffirmation() -> String {
        let userDefaults = UserDefaults(suiteName: "group.com.cisfransorganization.lio")
        return userDefaults?.string(forKey: "current_affirmation") ?? "Hoy es un gran día para brillar 🌟"
    }
}

struct SimpleEntry: TimelineEntry {
    let date: Date
    let affirmation: String
}

struct LioWidgetEntryView : View {
    var entry: Provider.Entry

    var body: some View {
        ZStack {
            // Gradient Background
            LinearGradient(
                gradient: Gradient(colors: [Color(red: 0.298, green: 0.114, blue: 0.584), Color(red: 0.486, green: 0.227, blue: 0.929)]),
                startPoint: .topLeading,
                endPoint: .bottomTrailing
            )
            
            VStack {
                // Icon
                Image(systemName: "sparkles")
                    .resizable()
                    .aspectRatio(contentMode: .fit)
                    .frame(width: 24, height: 24)
                    .foregroundColor(.white.opacity(0.8))
                    .padding(.bottom, 8)

                // Affirmation Text
                Text(entry.affirmation)
                    .font(.custom("System", size: 16))
                    .fontWeight(.medium)
                    .multilineTextAlignment(.center)
                    .foregroundColor(.white)
                    .padding(.horizontal, 4)
                    .minimumScaleFactor(0.5)
            }
            .padding()
        }
    }
}
