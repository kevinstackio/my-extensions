import Foundation

final class MediaIndexer {
    private let store: SQLiteMediaStore

    init(store: SQLiteMediaStore) {
        self.store = store
    }

    func sync(generation: Int, items: [MediaItem], completed: Bool) throws {
        try store.upsert(items, generation: generation)
        guard completed else { return }
        try store.deleteAll(exceptGeneration: generation)
    }
}
