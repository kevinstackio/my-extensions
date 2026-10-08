import Combine
import Foundation

enum SelectionState: Equatable {
    case none
    case partial
    case all
}

final class SelectionStore: ObservableObject {
    @Published private(set) var selectedIDs: Set<String> = []

    func toggle(id: String) {
        if selectedIDs.contains(id) {
            selectedIDs.remove(id)
        } else {
            selectedIDs.insert(id)
        }
    }

    func toggle(monthIDs: [String]) {
        let ids = Set(monthIDs)
        if ids.isSubset(of: selectedIDs) {
            selectedIDs.subtract(ids)
        } else {
            selectedIDs.formUnion(ids)
        }
    }

    func remove(ids: Set<String>) {
        selectedIDs.subtract(ids)
    }

    func selectedIDs(in ids: [String]) -> Set<String> {
        selectedIDs.intersection(Set(ids))
    }

    func state(for ids: [String]) -> SelectionState {
        let uniqueIDs = Set(ids)
        guard !uniqueIDs.isEmpty else { return .none }
        if uniqueIDs.isSubset(of: selectedIDs) { return .all }
        if uniqueIDs.isDisjoint(with: selectedIDs) { return .none }
        return .partial
    }
}
