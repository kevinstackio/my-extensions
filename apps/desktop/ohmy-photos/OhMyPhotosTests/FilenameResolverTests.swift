import XCTest
@testable import OhMyPhotos

final class FilenameResolverTests: XCTestCase {
    func testDuplicateNamesGetSequenceBeforeExtension() {
        let resolver = FilenameResolver()

        XCTAssertEqual(
            resolver.resolve("IMG_0001.HEIC", existingNames: ["IMG_0001.HEIC"]),
            "IMG_0001 (2).HEIC"
        )
        XCTAssertEqual(
            resolver.resolve("clip", existingNames: ["clip", "clip (2)"]),
            "clip (3)"
        )
    }
}
