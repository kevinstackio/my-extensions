import Foundation

enum ThumbnailPriority: Equatable {
    case visible
    case prefetch
}

struct ThumbnailRequest: Equatable, Identifiable {
    let id: String
    let priority: ThumbnailPriority
}

final class ThumbnailScheduler {
    let maxConcurrent: Int
    private(set) var activeRequests: [ThumbnailRequest] = []
    private(set) var queuedRequests: [ThumbnailRequest] = []

    init(maxConcurrent: Int = 4) {
        self.maxConcurrent = max(1, maxConcurrent)
    }

    func request(visibleIDs: [String], prefetchIDs: [String]) {
        var seen = Set<String>()
        let visible = visibleIDs.compactMap { id -> ThumbnailRequest? in
            guard seen.insert(id).inserted else { return nil }
            return ThumbnailRequest(id: id, priority: .visible)
        }
        let prefetch = prefetchIDs.compactMap { id -> ThumbnailRequest? in
            guard seen.insert(id).inserted else { return nil }
            return ThumbnailRequest(id: id, priority: .prefetch)
        }
        let requests = visible + prefetch
        activeRequests = Array(requests.prefix(maxConcurrent))
        queuedRequests = Array(requests.dropFirst(maxConcurrent))
    }

    @discardableResult
    func enqueue(id: String, priority: ThumbnailPriority) -> ThumbnailRequest? {
        guard !(activeRequests + queuedRequests).contains(where: { $0.id == id }) else {
            return nil
        }

        let request = ThumbnailRequest(id: id, priority: priority)
        if activeRequests.count < maxConcurrent {
            activeRequests.append(request)
            return request
        }

        queuedRequests.append(request)
        return nil
    }

    @discardableResult
    func complete(id: String) -> ThumbnailRequest? {
        guard let index = activeRequests.firstIndex(where: { $0.id == id }) else {
            return nil
        }
        activeRequests.remove(at: index)
        guard !queuedRequests.isEmpty else { return nil }

        let next = queuedRequests.removeFirst()
        activeRequests.append(next)
        return next
    }

    func reset() {
        activeRequests.removeAll()
        queuedRequests.removeAll()
    }

    @discardableResult
    func cancelPrefetch() -> [String] {
        let cancelled = (activeRequests + queuedRequests)
            .filter { $0.priority == .prefetch }
            .map(\.id)
        activeRequests.removeAll { $0.priority == .prefetch }
        queuedRequests.removeAll { $0.priority == .prefetch }
        return cancelled
    }
}
