import XCTest

@testable import XDownloadHelper

@MainActor
final class DownloadTaskStoreTests: XCTestCase {
    func testStoreStartsEmpty() {
        XCTAssertTrue(DownloadTaskStore().tasks.isEmpty)
    }

    func testEnqueueCreatesQueuedTask() throws {
        let store = DownloadTaskStore()
        let result = store.enqueue(postId: "123", postURL: try XCTUnwrap(URL(string: "https://x.com/user/status/123")))

        guard case let .created(taskID) = result else { return XCTFail("首次入队应创建任务") }
        XCTAssertEqual(store.tasks.map(\.id), [taskID])
        XCTAssertEqual(store.tasks.first?.postId, "123")
        XCTAssertEqual(store.tasks.first?.state, .queued)
    }

    func testEnqueueSamePostReturnsExistingTaskID() throws {
        let store = DownloadTaskStore()
        let url = try XCTUnwrap(URL(string: "https://x.com/user/status/123"))
        let first = store.enqueue(postId: "123", postURL: url)
        let second = store.enqueue(postId: "123", postURL: url)

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

        let first = store.enqueue(postId: "123", postURL: firstURL)
        let second = store.enqueue(postId: "123", postURL: secondURL)

        guard case let .created(firstID) = first, case let .existing(secondID) = second else {
            return XCTFail("规范化地址应命中已有任务")
        }
        XCTAssertEqual(firstID, secondID)
        XCTAssertEqual(store.tasks.count, 1)
    }

    func testFailedTaskRemainsAndCompletedTaskCanBeRemoved() throws {
        let store = DownloadTaskStore()
        let result = store.enqueue(postId: "123", postURL: try XCTUnwrap(URL(string: "https://x.com/user/status/123")))
        guard case let .created(taskID) = result else { return XCTFail("应创建任务") }

        store.updateState(for: taskID, state: .failed("网络失败"))
        XCTAssertEqual(store.tasks.first?.state, .failed("网络失败"))

        store.updateState(for: taskID, state: .completed)
        store.remove(id: taskID)
        XCTAssertTrue(store.tasks.isEmpty)
    }

    func testFailedStateExposesCompleteMessageForDisplayAndCopy() {
        let message = "ERROR: first line\nsecond line"

        XCTAssertEqual(DownloadTaskState.failed(message).failureMessage, message)
    }

    func testNonFailedStateHasNoFailureMessage() {
        XCTAssertNil(DownloadTaskState.parsing.failureMessage)
    }

    func testDifferentPostsCreateIndependentTasksAndCancelRemovesOne() throws {
        let store = DownloadTaskStore()
        let first = store.enqueue(postId: "123", postURL: try XCTUnwrap(URL(string: "https://x.com/user/status/123")))
        let second = store.enqueue(postId: "456", postURL: try XCTUnwrap(URL(string: "https://x.com/user/status/456")))
        guard case let .created(firstID) = first, case .created = second else { return XCTFail("应创建两个任务") }

        store.cancel(id: firstID)
        XCTAssertEqual(store.tasks.map(\.postId), ["456"])
    }
}
