import XCTest

@testable import XDownloadHelper

@MainActor
final class DownloadTaskStoreTests: XCTestCase {
    func testInitialTasksUseTheThreeExpectedDesktopFiles() {
        let store = DownloadTaskStore()

        XCTAssertEqual(
            store.tasks.map(\.fileName),
            [
                "X_VIDEO_20260919_142345_01.mp4",
                "X_VIDEO_20260919_142345_02.mp4",
                "X_VIDEO_20260919_142345_03.mp4"
            ]
        )
        XCTAssertTrue(store.tasks.allSatisfy { $0.displayPath.hasPrefix("~/Desktop/") })
        XCTAssertTrue(store.tasks.allSatisfy { $0.state == .ready && $0.progress == 0 })
    }

    func testCancelRemovesExistingTaskAndIgnoresUnknownID() {
        let store = DownloadTaskStore()
        let taskID = try! XCTUnwrap(store.tasks.first?.id)

        store.cancel(id: taskID)
        XCTAssertEqual(store.tasks.count, 2)

        store.cancel(id: UUID())
        XCTAssertEqual(store.tasks.count, 2)
    }

    func testStartDownloadCompletesAllStepsAndRemovesTask() async throws {
        let store = DownloadTaskStore(delay: immediateDelay)
        let taskID = try XCTUnwrap(store.tasks.first?.id)

        let download = try XCTUnwrap(store.startDownload(id: taskID))
        XCTAssertEqual(store.tasks.first(where: { $0.id == taskID })?.state, .downloading)

        await download.value

        XCTAssertNil(store.tasks.first(where: { $0.id == taskID }))
    }

    func testCompletedDownloadReportsTheFinishedTask() async throws {
        var completedTasks: [DownloadTask] = []
        let store = DownloadTaskStore(
            delay: immediateDelay,
            onDownloadCompleted: { completedTasks.append($0) }
        )
        let expectedTask = try XCTUnwrap(store.tasks.first)

        let download = try XCTUnwrap(store.startDownload(id: expectedTask.id))
        await download.value

        XCTAssertEqual(completedTasks.map(\.fileName), [expectedTask.fileName])
    }

    func testStartDownloadIgnoresRepeatedStart() throws {
        let store = DownloadTaskStore(delay: immediateDelay)
        let taskID = try XCTUnwrap(store.tasks.first?.id)

        let first = store.startDownload(id: taskID)
        let second = store.startDownload(id: taskID)

        XCTAssertNotNil(first)
        XCTAssertNil(second)
        first?.cancel()
    }

    func testMultipleDownloadsRunWithoutOverwritingEachOther() async throws {
        let store = DownloadTaskStore(delay: immediateDelay)
        let taskIDs = Array(store.tasks.prefix(2).map(\.id))

        let downloads = taskIDs.compactMap { store.startDownload(id: $0) }
        XCTAssertEqual(downloads.count, 2)
        XCTAssertTrue(taskIDs.allSatisfy { id in store.tasks.first(where: { $0.id == id })?.state == .downloading })

        for download in downloads {
            await download.value
        }

        XCTAssertTrue(taskIDs.allSatisfy { id in store.tasks.first(where: { $0.id == id }) == nil })
    }

    private var immediateDelay: Delay {
        { _ in
            await Task.yield()
        }
    }
}
