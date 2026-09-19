import AppKit
import SwiftUI

struct DownloadListView: View {
    let store: DownloadTaskStore

    init(store: DownloadTaskStore) {
        self.store = store
    }

    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            if store.tasks.isEmpty {
                Text("暂无下载任务")
                    .foregroundStyle(.secondary)
            } else {
                ForEach(store.tasks) { task in
                    DownloadTaskRow(store: store, taskID: task.id)
                }
            }

            HStack {
                Spacer()

                Button("退出") {
                    NSApplication.shared.terminate(nil)
                }
            }
        }
        .padding(16)
        .frame(width: 360)
    }
}
