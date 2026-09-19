import XCTest

@testable import XDownloadHelper

@MainActor
final class HelperRequestHandlerTests: XCTestCase {
    func testValidRequestCreatesTaskAndExpandsPopover() async throws {
        let store = DownloadTaskStore()
        var expanded = false
        let handler = HelperRequestHandler(store: store) { expanded = true }
        let request = NativeMessageRequest(
            protocolVersion: 1,
            requestId: "request-1",
            type: "task.enqueue",
            payload: NativeMessagePayload(postId: "123", postUrl: "https://x.com/user/status/123")
        )

        let response = handler.handle(request)
        XCTAssertTrue(response.ok)
        XCTAssertEqual(response.result?.disposition, .created)
        XCTAssertTrue(expanded)
    }

    func testInvalidPostURLReturnsInvalidRequest() {
        let store = DownloadTaskStore()
        let handler = HelperRequestHandler(store: store, showPopover: {})
        let request = NativeMessageRequest(
            protocolVersion: 1,
            requestId: "request-1",
            type: "task.enqueue",
            payload: NativeMessagePayload(postId: "123", postUrl: "https://example.com/user/status/123")
        )

        let response = handler.handle(request)
        XCTAssertEqual(response.error?.code, .invalidRequest)
        XCTAssertTrue(store.tasks.isEmpty)
    }

    func testMismatchedPostIDReturnsInvalidRequest() {
        let store = DownloadTaskStore()
        let handler = HelperRequestHandler(store: store, showPopover: {})
        let request = NativeMessageRequest(
            protocolVersion: 1,
            requestId: "request-1",
            type: "task.enqueue",
            payload: NativeMessagePayload(postId: "456", postUrl: "https://x.com/user/status/123")
        )

        XCTAssertEqual(handler.handle(request).error?.code, .invalidRequest)
    }
}
