import AppKit
import SwiftUI

struct MonthSectionView: View {
    let title: String
    let items: [MediaItem]
    let images: [String: NSImage]
    let failedThumbnailIDs: Set<String>
    let requestThumbnail: (String) -> Void
    let selectedIDs: Set<String>
    let selectionState: SelectionState
    let toggleItem: (String) -> Void
    let toggleMonth: () -> Void
    let downloadSelected: () -> Void

    private let columns = [GridItem(.adaptive(minimum: 150), spacing: 12)]

    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            HStack {
                Text(title)
                    .font(.headline)
                Spacer()
                Text("已选 \(selectedCount)")
                    .foregroundStyle(.secondary)
                Button(selectionButtonTitle, action: toggleMonth)
                    .buttonStyle(.link)
                Button("下载", action: downloadSelected)
                    .disabled(selectedCount == 0)
            }
            LazyVGrid(columns: columns, alignment: .leading, spacing: 12) {
                ForEach(items) { item in
                    MediaGridItemView(
                        item: item,
                        image: images[item.id],
                        thumbnailFailed: failedThumbnailIDs.contains(item.id),
                        isSelected: selectedIDs.contains(item.id),
                        toggle: { toggleItem(item.id) },
                        requestThumbnail: { requestThumbnail(item.id) }
                    )
                }
            }
        }
    }

    private var selectionButtonTitle: String {
        switch selectionState {
        case .none, .partial: return "全选"
        case .all: return "取消全选"
        }
    }

    private var selectedCount: Int {
        items.reduce(into: 0) { count, item in
            if selectedIDs.contains(item.id) { count += 1 }
        }
    }
}
