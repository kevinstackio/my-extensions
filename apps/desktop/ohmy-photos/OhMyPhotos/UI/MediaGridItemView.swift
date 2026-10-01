import AppKit
import SwiftUI

struct MediaGridItemView: View {
    let item: MediaItem
    let image: NSImage?
    let thumbnailFailed: Bool
    let isSelected: Bool
    let toggle: () -> Void
    let requestThumbnail: () -> Void

    var body: some View {
        VStack(alignment: .leading, spacing: 6) {
            Group {
                if let image {
                    Image(nsImage: image)
                        .resizable()
                        .scaledToFill()
                } else {
                    Rectangle()
                        .fill(.quaternary)
                        .overlay {
                            if thumbnailFailed {
                                VStack(spacing: 6) {
                                    Image(systemName: "exclamationmark.triangle")
                                    Button("重试", action: requestThumbnail)
                                        .buttonStyle(.link)
                                }
                            } else {
                                ProgressView()
                            }
                        }
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
        .contentShape(Rectangle())
        .onTapGesture(perform: toggle)
        .onAppear(perform: requestThumbnail)
        .overlay {
            RoundedRectangle(cornerRadius: 4)
                .stroke(isSelected ? Color.accentColor : .clear, lineWidth: 2)
        }
    }
}
