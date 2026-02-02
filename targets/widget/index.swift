import WidgetKit
import SwiftUI

@main
struct exportWidgets: WidgetBundle {
    var body: some Widget {
        // Export widgets here
        LioAffirmationsWidget()
        widgetControl()
        WidgetLiveActivity()
    }
}
