import Foundation
import Observation

enum EnqueueResult: Equatable {
    case created(UUID)
    case existing(UUID)
}

@MainActor
@Observable
final class DownloadTaskStore {
    var tasks: [DownloadTask]
    var onTaskEnqueued: ((DownloadTask) -> Void)?
    private let now: () -> Date

    init(
        tasks: [DownloadTask] = [],
        onTaskEnqueued: ((DownloadTask) -> Void)? = nil,
        now: @escaping () -> Date = Date.init
    ) {
        self.tasks = tasks
        self.onTaskEnqueued = onTaskEnqueued
        self.now = now
    }

    func cancel(id: UUID) {
        remove(id: id)
    }

    func remove(id: UUID) {
        tasks.removeAll { $0.id == id }
    }

    func updateState(for id: UUID, state: DownloadTaskState) {
        guard let index = tasks.firstIndex(where: { $0.id == id }) else { return }
        tasks[index].state = state
    }

    @discardableResult
    func enqueue(postId: String, postURL: URL) -> EnqueueResult {
        let normalizedAddress = Self.normalize(postURL)
        if let existing = tasks.first(where: { $0.normalizedAddress == normalizedAddress }) {
            return .existing(existing.id)
        }
        let normalizedURL = URL(string: normalizedAddress) ?? postURL
        let task = DownloadTask(
            postId: postId,
            postURL: normalizedURL,
            normalizedAddress: normalizedAddress,
            receivedAt: now()
        )
        tasks.append(task)
        onTaskEnqueued?(task)
        return .created(task.id)
    }

    static func normalize(_ url: URL) -> String {
        // 去重只基于当前内存中的规范化帖子地址，不扫描桌面历史文件。
        guard var components = URLComponents(url: url, resolvingAgainstBaseURL: false) else {
            return url.absoluteString
        }
        components.scheme = components.scheme?.lowercased()
        components.host = components.host?.lowercased()
        components.query = nil
        components.fragment = nil
        if components.path.count > 1 {
            components.path = components.path.trimmingCharacters(in: CharacterSet(charactersIn: "/"))
            components.path = "/" + components.path
        }
        return components.url?.absoluteString ?? url.absoluteString
    }
}
