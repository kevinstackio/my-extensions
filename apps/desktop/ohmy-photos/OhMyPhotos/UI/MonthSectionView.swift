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

    private let columns = [GridItem(.adaptive(minimum: 150), spacing: 12)]

    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            HStack {
                Text(title)
                    .font(.headline)
                Spacer()
                Button(selectionButtonTitle, action: toggleMonth)
                    .buttonStyle(.link)
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
        case .none: return "全选"
        case .partial: return "补全选择"
        case .all: return "取消全选"
        }
    }
}
