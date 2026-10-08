import XCTest
@testable import exts

final class LargeLibraryStressTests: XCTestCase {
    func testSelectionStateHandlesFourHundredThousandIDs() {
        let ids = (0..<400_000).map { "media-\($0)" }
        let store = SelectionStore()

        store.toggle(monthIDs: ids)

        XCTAssertEqual(store.state(for: ids), .all)
        XCTAssertEqual(store.selectedIDs.count, 400_000)
    }
}
