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
                    Text(task.fileName)
                        .foregroundStyle(task.state == .downloading ? .secondary : .primary)
                        .lineLimit(1)
                        .truncationMode(.middle)

                    Spacer()

                    if task.state == .ready {
                        HStack {
                            Button("下载") {
                                _ = store.startDownload(id: task.id)
                            }

                            Button("取消") {
                                store.cancel(id: task.id)
                            }
                        }
                    }
                }

                if task.state == .downloading {
                    HStack {
                        ProgressView(value: task.progress)
                        Text("\(Int(task.progress * 100))%")
                            .monospacedDigit()
                            .frame(width: 44, alignment: .trailing)
                    }
                }
            }
        }
    }
}
