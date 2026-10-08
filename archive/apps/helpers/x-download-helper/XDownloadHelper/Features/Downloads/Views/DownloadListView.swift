import AppKit
import SwiftUI

struct DownloadListView: View {
    private static let listHeight: CGFloat = 240

    let store: DownloadTaskStore

    init(store: DownloadTaskStore) {
        self.store = store
    }

    var body: some View {
        VStack(spacing: 0) {
            ScrollView(.vertical) {
                if store.tasks.isEmpty {
                    Text("暂无下载任务")
                        .foregroundStyle(.secondary)
                        .frame(maxWidth: .infinity, minHeight: Self.listHeight, alignment: .center)
                } else {
                    LazyVStack(alignment: .leading, spacing: 0) {
                        ForEach(Array(store.tasks.enumerated()), id: \.element.id) { index, task in
                            DownloadTaskRow(store: store, taskID: task.id)
                                .padding(.vertical, 8)

                            if index < store.tasks.count - 1 {
                                Divider()
                            }
                        }
                    }
                    .padding(.vertical, 8)
                }
            }
            .padding(.horizontal, 16)
            .frame(height: Self.listHeight)

            Divider()

            HStack {
                Spacer()

                Button("退出") {
                    NSApplication.shared.terminate(nil)
                }
            }
            .padding(.horizontal, 16)
            .padding(.vertical, 12)
        }
        .frame(width: 360)
    }
}
