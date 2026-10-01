import AppKit
import SwiftUI

struct LibraryView: View {
    let items: [MediaItem]
    let images: [String: NSImage]
    let failedThumbnailIDs: Set<String>
    let onRequestThumbnail: (String) -> Void
    let onDownload: ([MediaItem]) -> [DownloadResult]
    @StateObject private var selection: SelectionStore

    init(
        items: [MediaItem],
        images: [String: NSImage] = [:],
        failedThumbnailIDs: Set<String> = [],
        onRequestThumbnail: @escaping (String) -> Void = { _ in },
        onDownload: @escaping ([MediaItem]) -> [DownloadResult] = { _ in [] }
    ) {
        self.items = items
        self.images = images
        self.failedThumbnailIDs = failedThumbnailIDs
        self.onRequestThumbnail = onRequestThumbnail
        self.onDownload = onDownload
        _selection = StateObject(wrappedValue: SelectionStore())
    }

    var body: some View {
        let groups = Dictionary(grouping: items) { MediaGrouping.monthKey(for: $0) }
        ScrollView {
            LazyVStack(alignment: .leading, spacing: 24) {
                ForEach(groups.keys.sorted(by: monthSort), id: \.self) { month in
                    let monthItems = groups[month] ?? []
                    MonthSectionView(
                        title: month,
                        items: monthItems,
                        images: images,
                        failedThumbnailIDs: failedThumbnailIDs,
                        requestThumbnail: onRequestThumbnail,
                        selectedIDs: selection.selectedIDs,
                        selectionState: selection.state(for: monthItems.map(\.id)),
                        toggleItem: { selection.toggle(id: $0) },
                        toggleMonth: { selection.toggle(monthIDs: monthItems.map(\.id)) },
                        downloadSelected: {
                            let selectedIDs = selection.selectedIDs(in: monthItems.map(\.id))
                            let selected = monthItems.filter { selectedIDs.contains($0.id) }
                            let results = onDownload(selected)
                            let successfulIDs = Set(
                                results.filter { $0.succeeded }.map(\.itemID)
                            )
                            selection.remove(ids: successfulIDs)
                        }
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
