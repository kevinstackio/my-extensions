import AppKit
import SwiftUI

struct MediaGridItemView: View {
    let item: MediaItem
    let image: NSImage?
    let isSelected: Bool
    let toggle: () -> Void

    var body: some View {
        Button(action: toggle) {
            VStack(alignment: .leading, spacing: 6) {
                Group {
                    if let image {
                        Image(nsImage: image)
                            .resizable()
                            .scaledToFill()
                    } else {
                        Rectangle()
                            .fill(.quaternary)
                            .overlay { ProgressView() }
                    }
                }
                .frame(minWidth: 150, minHeight: 110, maxHeight: 160)
                .clipped()
                Text(item.name)
                    .lineLimit(1)
                    .font(.caption)
                    .frame(maxWidth: .infinity, alignment: .leading)
            }
            .padding(4)
            .overlay {
                RoundedRectangle(cornerRadius: 4)
                    .stroke(isSelected ? Color.accentColor : .clear, lineWidth: 2)
            }
        }
        .buttonStyle(.plain)
    }
}
