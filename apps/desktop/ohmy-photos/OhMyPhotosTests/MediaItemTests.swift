import XCTest
@testable import OhMyPhotos

final class MediaItemTests: XCTestCase {
    func testAAEFileIsRecognizedAsSidecar() {
        XCTAssertTrue(MediaItem.isAAESidecar(name: "IMG_0001.AAE", uti: nil))
        XCTAssertTrue(MediaItem.isAAESidecar(name: "img_0002.aae", uti: nil))
        XCTAssertFalse(MediaItem.isAAESidecar(name: "IMG_0003.HEIC", uti: "public.heic"))
    }
}
