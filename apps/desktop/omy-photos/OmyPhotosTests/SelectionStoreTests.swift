import XCTest
@testable import OmyPhotos

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
}
