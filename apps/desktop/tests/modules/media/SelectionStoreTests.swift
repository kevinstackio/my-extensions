import XCTest
@testable import exts

final class SelectionStoreTests: XCTestCase {
    func testItemAndMonthSelectionExposeNonePartialAndAll() {
        let store = SelectionStore()
        let monthIDs = ["a", "b", "c"]

        XCTAssertEqual(store.state(for: monthIDs), .none)
        store.toggle(id: "a")
        XCTAssertEqual(store.state(for: monthIDs), .partial)

        store.toggle(monthIDs: monthIDs)
        XCTAssertEqual(store.state(for: monthIDs), .all)

        store.toggle(monthIDs: monthIDs)
        XCTAssertEqual(store.state(for: monthIDs), .none)
    }

    func testRemovingSuccessfulIDsKeepsFailedSelection() {
        let store = SelectionStore()
        store.toggle(monthIDs: ["success", "failed"])

        store.remove(ids: ["success"])

        XCTAssertEqual(store.selectedIDs, ["failed"])
    }

    func testSelectedIDsCanBeScopedToMonth() {
        let store = SelectionStore()
        store.toggle(monthIDs: ["january", "february"])

        XCTAssertEqual(store.selectedIDs(in: ["january", "march"]), ["january"])
    }
}
