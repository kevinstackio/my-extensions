import XCTest

@testable import XDownloadHelper

@MainActor
final class DownloadTaskStoreTests: XCTestCase {
    func testStoreStartsEmpty() {
        XCTAssertTrue(DownloadTaskStore().tasks.isEmpty)
    }

    func testEnqueueCreatesQueuedTask() throws {
        let store = DownloadTaskStore()
        let result = store.enqueue(postId: "123", postURL: try XCTUnwrap(URL(string: "https://x.com/user/status/123")), mediaSources: [source])

        guard case let .created(taskID) = result else { return XCTFail("首次入队应创建任务") }
        XCTAssertEqual(store.tasks.map(\.id), [taskID])
        XCTAssertEqual(store.tasks.first?.postId, "123")
        XCTAssertEqual(store.tasks.first?.state, .queued)
    }

    func testEnqueueSamePostReturnsExistingTaskID() throws {
        let store = DownloadTaskStore()
        let url = try XCTUnwrap(URL(string: "https://x.com/user/status/123"))
        let first = store.enqueue(postId: "123", postURL: url, mediaSources: [source])
        let second = store.enqueue(postId: "123", postURL: url, mediaSources: [source])

        guard case let .created(firstID) = first, case let .existing(secondID) = second else {
            return XCTFail("重复帖子应命中已有任务")
        }
        XCTAssertEqual(firstID, secondID)
        XCTAssertEqual(store.tasks.count, 1)
    }

    func testEnqueueSameNormalizedAddressReturnsExistingTaskID() throws {
        let store = DownloadTaskStore()
        let firstURL = try XCTUnwrap(URL(string: "https://x.com/user/status/123?utm_source=share"))
        let secondURL = try XCTUnwrap(URL(string: "https://X.COM/user/status/123/"))

        let first = store.enqueue(postId: "123", postURL: firstURL, mediaSources: [source])
        let second = store.enqueue(postId: "123", postURL: secondURL, mediaSources: [source])

        guard case let .created(firstID) = first, case let .existing(secondID) = second else {
            return XCTFail("规范化地址应命中已有任务")
        }
        XCTAssertEqual(firstID, secondID)
        XCTAssertEqual(store.tasks.count, 1)
    }

    func testFailedTaskRemainsAndCompletedTaskCanBeRemoved() throws {
        let store = DownloadTaskStore()
        let result = store.enqueue(postId: "123", postURL: try XCTUnwrap(URL(string: "https://x.com/user/status/123")), mediaSources: [source])
        guard case let .created(taskID) = result else { return XCTFail("应创建任务") }

        store.updateState(for: taskID, state: .failed("网络失败"))
        XCTAssertEqual(store.tasks.first?.state, .failed("网络失败"))

        store.updateState(for: taskID, state: .completed)
        store.remove(id: taskID)
        XCTAssertTrue(store.tasks.isEmpty)
    }

    func testFailedTaskCanBeRetriedWithFreshMediaSourcesWithoutCreatingDuplicate() throws {
        let store = DownloadTaskStore()
        var enqueued: [DownloadTask] = []
        store.onTaskEnqueued = { enqueued.append($0) }
        let postURL = try XCTUnwrap(URL(string: "https://x.com/user/status/123"))
        let source = VideoMediaSource(
            mediaID: "video-1",
            type: .mp4,
            url: URL(string: "https://video.twimg.com/video.mp4")!
        )

        let first = store.enqueue(postId: "123", postURL: postURL, mediaSources: [source])
        guard case let .created(taskID) = first else { return XCTFail("应创建任务") }
        store.updateState(for: taskID, state: .failed("解析失败"))

        let retry = store.enqueue(postId: "123", postURL: postURL, mediaSources: [source])

        guard case .existing(taskID) = retry else { return XCTFail("重试应复用已有任务") }
        XCTAssertEqual(store.tasks.first?.state, .queued)
        XCTAssertEqual(store.tasks.first?.mediaSources, [source])
        XCTAssertEqual(enqueued.count, 2)
    }

    func testFailedStateExposesCompleteMessageForDisplayAndCopy() {
        let message = "ERROR: first line\nsecond line"

        XCTAssertEqual(DownloadTaskState.failed(message).failureMessage, message)
    }

    func testDownloadProgressStateExposesStepAndOverallProgress() {
        let state = DownloadTaskState.downloadingVideo(index: 1, total: 2, progress: 0.4, overall: 0.2)

        XCTAssertEqual(state.stepProgress, 0.4)
        XCTAssertEqual(state.overallProgress, 0.2)
        XCTAssertEqual(state.displayTitle, "下载视频 1/2")
        XCTAssertNil(state.failureMessage)
    }

    func testDifferentPostsCreateIndependentTasksAndCancelRemovesOne() throws {
        let store = DownloadTaskStore()
        let first = store.enqueue(postId: "123", postURL: try XCTUnwrap(URL(string: "https://x.com/user/status/123")), mediaSources: [source])
        let second = store.enqueue(postId: "456", postURL: try XCTUnwrap(URL(string: "https://x.com/user/status/456")), mediaSources: [source])
        guard case let .created(firstID) = first, case .created = second else { return XCTFail("应创建两个任务") }

        store.cancel(id: firstID)
        XCTAssertEqual(store.tasks.map(\.postId), ["456"])
    }

    private var source: VideoMediaSource {
        VideoMediaSource(mediaID: "video-1", type: .mp4, url: URL(string: "https://video.twimg.com/video.mp4")!)
    }
}
