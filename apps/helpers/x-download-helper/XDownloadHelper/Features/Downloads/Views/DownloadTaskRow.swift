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

                    Text(statusTitle(for: task.state))
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

    private func statusTitle(for state: DownloadTaskState) -> String {
        switch state {
        case .queued:
            return "等待中"
        case .parsing:
            return "解析中"
        case let .downloading(index, total):
            return total > 1 ? "下载中 \(index)/\(total)" : "下载中"
        case let .merging(index, total):
            return total > 1 ? "合并中 \(index)/\(total)" : "合并中"
        case .completed:
            return "已完成"
        case .failed:
            return "失败"
        }
    }

    private func copyFailureMessage(_ message: String) {
        NSPasteboard.general.clearContents()
        NSPasteboard.general.setString(message, forType: .string)
    }
}
