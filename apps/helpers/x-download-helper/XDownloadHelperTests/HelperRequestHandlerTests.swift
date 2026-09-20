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
        XCTAssertEqual(response.protocolVersion, 1)
        XCTAssertEqual(response.result?.disposition, .created)
        XCTAssertTrue(expanded)
    }

    func testVersionTwoRequestStoresValidatedMediaSourcesAndRespondsWithVersionTwo() {
        let store = DownloadTaskStore()
        let source = VideoMediaSource(
            mediaID: "video-1",
            type: .mp4,
            url: URL(string: "https://video.twimg.com/ext_tw_video/1/pu/vid/1280x720/video.mp4")!
        )
        let handler = HelperRequestHandler(store: store, showPopover: {})
        let request = NativeMessageRequest(
            protocolVersion: 2,
            requestId: "request-v2",
            type: "task.enqueue",
            payload: NativeMessagePayload(
                postId: "123",
                postUrl: "https://x.com/user/status/123",
                mediaSources: [source]
            )
        )

        let response = handler.handle(request)

        XCTAssertTrue(response.ok)
        XCTAssertEqual(response.protocolVersion, 2)
        XCTAssertEqual(store.tasks.first?.mediaSources, [source])
    }

    func testVersionTwoRequestRejectsInvalidMediaSource() {
        let store = DownloadTaskStore()
        let handler = HelperRequestHandler(store: store, showPopover: {})
        let request = NativeMessageRequest(
            protocolVersion: 2,
            requestId: "request-invalid-source",
            type: "task.enqueue",
            payload: NativeMessagePayload(
                postId: "123",
                postUrl: "https://x.com/user/status/123",
                mediaSources: [
                    VideoMediaSource(
                        mediaID: "video-1",
                        type: .mp4,
                        url: URL(string: "https://pbs.twimg.com/photo.mp4")!
                    )
                ]
            )
        )

        let response = handler.handle(request)

        XCTAssertEqual(response.protocolVersion, 2)
        XCTAssertEqual(response.error?.code, .invalidRequest)
        XCTAssertTrue(store.tasks.isEmpty)
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
