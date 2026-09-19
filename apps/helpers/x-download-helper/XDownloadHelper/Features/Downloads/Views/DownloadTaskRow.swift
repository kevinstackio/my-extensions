import SwiftUI

struct DownloadTaskRow: View {
    let store: DownloadTaskStore
    let taskID: UUID

    init(store: DownloadTaskStore, taskID: UUID) {
        self.store = store
        self.taskID = taskID
    }

    var body: some View {
        if let task = store.tasks.first(where: { $0.id == taskID }) {
            VStack(alignment: .leading, spacing: 6) {
                HStack(alignment: .center, spacing: 8) {
                    Text(task.postId)
                        .foregroundStyle(.primary)
                        .lineLimit(1)
                        .truncationMode(.middle)

                    Spacer()

                    Text("已接收")
                        .foregroundStyle(.secondary)

                    Button("移除") {
                        store.cancel(id: task.id)
                    }
                }

                Text(task.postURL.absoluteString)
                    .font(.caption)
                    .foregroundStyle(.secondary)
                    .lineLimit(1)
                    .truncationMode(.middle)
            }
        }
    }
}
