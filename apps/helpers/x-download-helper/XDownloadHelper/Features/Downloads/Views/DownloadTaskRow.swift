import AppKit
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

                    Text(task.state.displayTitle)
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

                if case .preparing = task.state {
                    ProgressView()
                        .controlSize(.small)
                }

                if let stepProgress = task.state.stepProgress {
                    VStack(alignment: .leading, spacing: 3) {
                        Text("当前步骤")
                            .font(.caption2)
                            .foregroundStyle(.secondary)
                        ProgressView(value: stepProgress)
                            .progressViewStyle(.linear)
                    }
                }

                if let overallProgress = task.state.overallProgress {
                    VStack(alignment: .leading, spacing: 3) {
                        Text("总进度")
                            .font(.caption2)
                            .foregroundStyle(.secondary)
                        ProgressView(value: overallProgress)
                            .progressViewStyle(.linear)
                    }
                }

                if let failureMessage = task.state.failureMessage {
                    HStack(alignment: .top, spacing: 8) {
                        Text(verbatim: failureMessage)
                            .font(.caption)
                            .foregroundStyle(.red)
                            .textSelection(.enabled)
                            .fixedSize(horizontal: false, vertical: true)

                        Spacer(minLength: 0)

                        Button {
                            copyFailureMessage(failureMessage)
                        } label: {
                            Label("复制", systemImage: "doc.on.doc")
                        }
                        .buttonStyle(.borderless)
                        .controlSize(.small)
                    }
                }
            }
        }
    }

    private func copyFailureMessage(_ message: String) {
        NSPasteboard.general.clearContents()
        NSPasteboard.general.setString(message, forType: .string)
    }
}
