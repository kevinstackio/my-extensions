import AppKit
import SwiftUI

struct MonthSectionView: View {
    let title: String
    let items: [MediaItem]
    let images: [String: NSImage]

    private let columns = [GridItem(.adaptive(minimum: 150), spacing: 12)]

    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            Text(title)
                .font(.headline)
            LazyVGrid(columns: columns, alignment: .leading, spacing: 12) {
                ForEach(items) { item in
                    MediaGridItemView(item: item, image: images[item.id])
                }
            }
        }
    }
}
