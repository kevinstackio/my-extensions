import Foundation

final class DecodedImageCache {
    private struct Entry {
        let data: Data
        let cost: Int
        var sequence: UInt64
    }

    let maxBytes: Int
    private var entries: [String: Entry] = [:]
    private var totalBytes = 0
    private var sequence: UInt64 = 0

    init(maxBytes: Int = 64 * 1024 * 1024) {
        self.maxBytes = max(1, maxBytes)
    }

    var count: Int { entries.count }
    var currentBytes: Int { totalBytes }

    func removeAll() {
        entries.removeAll()
        totalBytes = 0
    }

    func data(for id: String) -> Data? {
        guard var entry = entries[id] else { return nil }
        sequence += 1
        entry.sequence = sequence
        entries[id] = entry
        return entry.data
    }

    func insert(_ data: Data, for id: String) {
        if let previous = entries.removeValue(forKey: id) {
            totalBytes -= previous.cost
        }
        sequence += 1
        entries[id] = Entry(data: data, cost: data.count, sequence: sequence)
        totalBytes += data.count
        pruneIfNeeded()
    }

    private func pruneIfNeeded() {
        while totalBytes > maxBytes, let oldest = entries.min(by: { $0.value.sequence < $1.value.sequence }) {
            totalBytes -= oldest.value.cost
            entries.removeValue(forKey: oldest.key)
        }
    }
}
