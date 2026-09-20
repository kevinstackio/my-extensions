import XCTest

@testable import XDownloadHelper

final class VideoPostParserTests: XCTestCase {
    func testParsesSingleVideoEntry() throws {
        let output = #"{"webpage_url":"https://x.com/user/status/123"}"#

        let post = try VideoPostParser().parse(output: output)

        XCTAssertEqual(post.entries.map(\.url.absoluteString), ["https://x.com/user/status/123"])
    }

    func testParsesPlaylistEntriesInOrder() throws {
        let output = #"{"entries":[{"webpage_url":"https://x.com/user/status/123/1"},{"original_url":"https://x.com/user/status/123/2"}]}"#

        let post = try VideoPostParser().parse(output: output)

        XCTAssertEqual(post.entries.map(\.url.absoluteString), [
            "https://x.com/user/status/123/1",
            "https://x.com/user/status/123/2"
        ])
    }

    func testRejectsEmptyEntries() {
        XCTAssertThrowsError(try VideoPostParser().parse(output: #"{"entries":[]}"#)) { error in
            XCTAssertEqual(error as? VideoPostParseError, .empty)
        }
    }

    func testRejectsEntryWithoutReextractableURL() {
        XCTAssertThrowsError(try VideoPostParser().parse(output: #"{"entries":[{"id":"123"}]}"#)) { error in
            XCTAssertEqual(error as? VideoPostParseError, .missingURL)
        }
    }
}
