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

    init(tasks: [DownloadTask] = []) {
        self.tasks = tasks
    }

    func cancel(id: UUID) {
        tasks.removeAll { $0.id == id }
    }

    @discardableResult
    func enqueue(postId: String, postURL: URL) -> EnqueueResult {
        if let existing = tasks.first(where: { $0.postId == postId }) {
            return .existing(existing.id)
        }
        let task = DownloadTask(postId: postId, postURL: postURL)
        tasks.append(task)
        return .created(task.id)
    }
}
