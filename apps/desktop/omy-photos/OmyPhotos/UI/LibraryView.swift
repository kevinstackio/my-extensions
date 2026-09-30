import AppKit
import SwiftUI

struct LibraryView: View {
    let items: [MediaItem]
    let images: [String: NSImage]
    let onDownload: ([MediaItem]) -> [DownloadResult]
    @StateObject private var selection: SelectionStore

    init(
        items: [MediaItem],
        images: [String: NSImage] = [:],
        onDownload: @escaping ([MediaItem]) -> [DownloadResult] = { _ in [] }
    ) {
        self.items = items
        self.images = images
        self.onDownload = onDownload
        _selection = StateObject(wrappedValue: SelectionStore())
    }

    var body: some View {
        let groups = Dictionary(grouping: items) { MediaGrouping.monthKey(for: $0) }
        VStack(alignment: .leading, spacing: 0) {
            HStack {
                Text("媒体库")
                    .font(.title2)
                Spacer()
                Text("已选 \(selection.selectedIDs.count) 项")
                    .foregroundStyle(.secondary)
                Button("下载") {
                    let selected = items.filter { selection.selectedIDs.contains($0.id) }
                    _ = onDownload(selected)
                }
                .disabled(selection.selectedIDs.isEmpty)
            }
            .padding(.horizontal, 24)
            .padding(.vertical, 16)

            ScrollView {
                LazyVStack(alignment: .leading, spacing: 24) {
                    ForEach(groups.keys.sorted(by: monthSort), id: \.self) { month in
                        let monthItems = groups[month] ?? []
                        MonthSectionView(
                            title: month,
                            items: monthItems,
                            images: images,
                            selectedIDs: selection.selectedIDs,
                            selectionState: selection.state(for: monthItems.map(\.id)),
                            toggleItem: { selection.toggle(id: $0) },
                            toggleMonth: { selection.toggle(monthIDs: monthItems.map(\.id)) }
                        )
                    }
                }
                .padding(24)
            }
        }
    }

    private func monthSort(_ left: String, _ right: String) -> Bool {
        if left == "unknown" { return false }
        if right == "unknown" { return true }
        return left > right
    }
}
