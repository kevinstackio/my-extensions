import AppKit
import SwiftUI

struct LibraryView: View {
    let items: [MediaItem]
    let images: [String: NSImage]

    init(items: [MediaItem], images: [String: NSImage] = [:]) {
        self.items = items
        self.images = images
    }

    var body: some View {
        let groups = Dictionary(grouping: items) { MediaGrouping.monthKey(for: $0) }
        ScrollView {
            LazyVStack(alignment: .leading, spacing: 24) {
                ForEach(groups.keys.sorted(by: monthSort), id: \.self) { month in
                    MonthSectionView(
                        title: month,
                        items: groups[month] ?? [],
                        images: images
                    )
                }
            }
            .padding(24)
        }
    }

    private func monthSort(_ left: String, _ right: String) -> Bool {
        if left == "unknown" { return false }
        if right == "unknown" { return true }
        return left > right
    }
}
