import Foundation
import Observation

typealias Delay = @Sendable (Duration) async throws -> Void

private let liveDelay: Delay = { duration in
    try await Task.sleep(for: duration)
}

@MainActor
@Observable
final class DownloadTaskStore {
    var tasks: [DownloadTask]

    @ObservationIgnored
    private let delay: Delay

    init(
        tasks: [DownloadTask] = DownloadTask.samples,
        delay: @escaping Delay = liveDelay
    ) {
        self.tasks = tasks
        self.delay = delay
    }

    func cancel(id: UUID) {
        tasks.removeAll { $0.id == id }
    }

    @discardableResult
    func startDownload(id: UUID) -> Task<Void, Never>? {
        guard let taskIndex = tasks.firstIndex(where: { $0.id == id }), tasks[taskIndex].state == .ready else {
            return nil
        }

        tasks[taskIndex].state = .downloading

        return Task { [weak self] in
            guard let self else { return }

            for step in 1...50 {
                do {
                    try await delay(.milliseconds(100))
                } catch {
                    return
                }

                guard !Task.isCancelled else { return }
                guard let currentIndex = tasks.firstIndex(where: { $0.id == id }) else { return }
                tasks[currentIndex].progress = Double(step) / 50
            }

            guard tasks.contains(where: { $0.id == id }) else { return }
            tasks.removeAll { $0.id == id }
        }
    }
}
