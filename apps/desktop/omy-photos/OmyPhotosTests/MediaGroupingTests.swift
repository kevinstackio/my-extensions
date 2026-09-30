import XCTest
@testable import OmyPhotos

final class MediaGroupingTests: XCTestCase {
    func testSortDatePrefersCreationThenModificationThenUnknown() {
        let modification = Date(timeIntervalSince1970: 1_000)
        let creation = Date(timeIntervalSince1970: 2_000)

        let item = MediaItem(
            id: "photo-1",
            name: "IMG_1.HEIC",
            uti: "public.heic",
            fileSize: 10,
            duration: 0,
            creationDate: creation,
            modificationDate: modification,
            fingerprint: nil
        )

        XCTAssertEqual(item.sortDate, creation)
        XCTAssertEqual(MediaGrouping.monthKey(for: item), "1970-01")

        let fallback = MediaItem(
            id: item.id,
            name: item.name,
            uti: item.uti,
            fileSize: item.fileSize,
            duration: item.duration,
            creationDate: nil,
            modificationDate: modification,
            fingerprint: item.fingerprint
        )
        XCTAssertEqual(fallback.sortDate, modification)
        XCTAssertEqual(MediaGrouping.monthKey(for: fallback), "1970-01")

        let unknown = MediaItem(
            id: fallback.id,
            name: fallback.name,
            uti: fallback.uti,
            fileSize: fallback.fileSize,
            duration: fallback.duration,
            creationDate: nil,
            modificationDate: nil,
            fingerprint: fallback.fingerprint
        )
        XCTAssertEqual(unknown.sortDate, nil)
        XCTAssertEqual(MediaGrouping.monthKey(for: unknown), "unknown")
    }

    func testStableSortUsesDateDescendingThenIdentifier() {
        let date = Date(timeIntervalSince1970: 10_000)
        let later = MediaItem(
            id: "b",
            name: "b",
            uti: nil,
            fileSize: 0,
            duration: 0,
            creationDate: date,
            modificationDate: nil,
            fingerprint: nil
        )
        let earlier = MediaItem(
            id: "a",
            name: "a",
            uti: nil,
            fileSize: 0,
            duration: 0,
            creationDate: date,
            modificationDate: nil,
            fingerprint: nil
        )

        XCTAssertEqual(MediaGrouping.stableSort([later, earlier]).map(\.id), ["a", "b"])
    }
}
