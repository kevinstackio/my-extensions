import AppKit
import SwiftUI

struct MediaGridItemView: View {
    let item: MediaItem
    let image: NSImage?

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
                        .overlay { ProgressView() }
                }
            }
            .frame(minWidth: 150, minHeight: 110, maxHeight: 160)
            .clipped()
            Text(item.name)
                .lineLimit(1)
                .font(.caption)
        }
    }
}
