import WidgetKit
import SwiftUI

// Export the single widget defined in widgets.swift
@main
struct widget: Widget {
    let kind: String = "widget"

    var body: some WidgetConfiguration {
        StaticConfiguration(kind: kind, provider: Provider()) { entry in
            LioWidgetEntryView(entry: entry)
        }
        .configurationDisplayName("Afirmación Diaria")
        .description("Recibe un mensaje positivo cada día en tu pantalla de inicio.")
        .supportedFamilies([.systemSmall, .systemMedium])
    }
}
