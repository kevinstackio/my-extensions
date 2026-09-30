import Foundation

struct DownloadResult {
    let itemID: String
    let url: URL?
    let succeeded: Bool
    let errorDescription: String?
}

final class DownloadCoordinator {
    let maxConcurrent = 2

    private let filenameResolver = FilenameResolver()
    private let stateLock = NSLock()
    private var operationQueue: OperationQueue?
    private var cancelled = false

    func cancel() {
        stateLock.lock()
        cancelled = true
        operationQueue?.cancelAllOperations()
        stateLock.unlock()
    }

    func enqueue(
        items: [MediaItem],
        destination: URL = DestinationAccess.defaultDirectory(),
        transfer: @escaping (MediaItem, URL) throws -> Void
    ) -> [DownloadResult] {
        do {
            try DestinationAccess.prepare(destination)
        } catch {
            return items.map {
                DownloadResult(
                    itemID: $0.id,
                    url: nil,
                    succeeded: false,
                    errorDescription: error.localizedDescription
                )
            }
        }

        var existingNames = Set(
            (try? FileManager.default.contentsOfDirectory(
                at: destination,
                includingPropertiesForKeys: nil
            ).map(\.lastPathComponent)) ?? []
        )
        let plans = items.map { item -> (MediaItem, URL) in
            let filename = filenameResolver.resolve(item.name, existingNames: existingNames)
            existingNames.insert(filename)
            return (item, destination.appendingPathComponent(filename))
        }

        let operationQueue = OperationQueue()
        operationQueue.maxConcurrentOperationCount = maxConcurrent
        stateLock.lock()
        cancelled = false
        self.operationQueue = operationQueue
        stateLock.unlock()
        var results = Array<DownloadResult?>(repeating: nil, count: plans.count)
        let lock = NSLock()

        for (index, plan) in plans.enumerated() {
            operationQueue.addOperation { [self] in
                let result: DownloadResult
                if self.isCancelled {
                    result = DownloadResult(
                        itemID: plan.0.id,
                        url: nil,
                        succeeded: false,
                        errorDescription: "下载已取消"
                    )
                } else {
                    result = self.download(plan.0, to: plan.1, transfer: transfer)
                }
                lock.lock()
                results[index] = result
                lock.unlock()
            }
        }
        operationQueue.waitUntilAllOperationsAreFinished()
        stateLock.lock()
        self.operationQueue = nil
        stateLock.unlock()
        return results.compactMap { $0 }
    }

    private var isCancelled: Bool {
        stateLock.lock()
        defer { stateLock.unlock() }
        return cancelled
    }

    private func download(
        _ item: MediaItem,
        to destination: URL,
        transfer: (MediaItem, URL) throws -> Void
    ) -> DownloadResult {
        let temporary = destination.deletingLastPathComponent()
            .appendingPathComponent(".\(destination.lastPathComponent).\(UUID().uuidString).tmp")
        defer { try? FileManager.default.removeItem(at: temporary) }

        do {
            try transfer(item, temporary)
            try FileManager.default.moveItem(at: temporary, to: destination)
            return DownloadResult(itemID: item.id, url: destination, succeeded: true, errorDescription: nil)
        } catch {
            return DownloadResult(
                itemID: item.id,
                url: nil,
                succeeded: false,
                errorDescription: error.localizedDescription
            )
        }
    }
}
