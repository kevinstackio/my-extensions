import XCTest

@testable import XDownloadHelper

@MainActor
final class VideoDownloadCoordinatorTests: XCTestCase {
    func testAutomaticallyProcessesMultipleTasksSeriallyAndRemovesAfterSuccess() async throws {
        let root = try temporaryDirectory()
        let desktop = root.appendingPathComponent("Desktop", isDirectory: true)
        let executor = CoordinatorProcessExecutor()
        let tools = VideoToolPaths(
            ytDLP: URL(fileURLWithPath: "/bundle/Contents/Resources/Tools/yt-dlp"),
            ffmpeg: URL(fileURLWithPath: "/bundle/Contents/Resources/Tools/ffmpeg")
        )
        let runner = VideoProcessRunner(tools: tools, executor: executor)
        let fileStore = VideoDownloadFileStore(
            temporaryRoot: root,
            desktopDirectory: desktop,
            timeZone: TimeZone(secondsFromGMT: 0)!
        )
        var nextDate = Date(timeIntervalSince1970: 1_767_225_600)
        let store = DownloadTaskStore(now: {
            defer { nextDate.addTimeInterval(1) }
            return nextDate
        })
        let coordinator = VideoDownloadCoordinator(
            runner: runner,
            fileStore: fileStore,
            updateState: { taskID, state in store.updateState(for: taskID, state: state) },
            removeTask: { taskID in store.remove(id: taskID) }
        )
        store.onTaskEnqueued = { task in coordinator.enqueue(task) }

        _ = store.enqueue(postId: "123", postURL: URL(string: "https://x.com/user/status/123")!)
        _ = store.enqueue(postId: "456", postURL: URL(string: "https://x.com/user/status/456")!)
        await coordinator.waitForIdle()

        XCTAssertTrue(store.tasks.isEmpty)
        XCTAssertEqual(executor.downloadedURLs, [
            "https://x.com/user/status/123/1",
            "https://x.com/user/status/456/1"
        ])
        XCTAssertEqual(try FileManager.default.contentsOfDirectory(atPath: desktop.path).sorted(), [
            "X_VIDEO_20260101_000000.mp4",
            "X_VIDEO_20260101_000001.mp4"
        ])
    }

    func testFailedTaskRemainsAndNextTaskContinues() async throws {
        let root = try temporaryDirectory()
        let desktop = root.appendingPathComponent("Desktop", isDirectory: true)
        let executor = CoordinatorProcessExecutor(failDownloadFor: "https://x.com/user/status/123/1")
        let tools = VideoToolPaths(
            ytDLP: URL(fileURLWithPath: "/bundle/Contents/Resources/Tools/yt-dlp"),
            ffmpeg: URL(fileURLWithPath: "/bundle/Contents/Resources/Tools/ffmpeg")
        )
        let fileStore = VideoDownloadFileStore(
            temporaryRoot: root,
            desktopDirectory: desktop,
            timeZone: TimeZone(secondsFromGMT: 0)!
        )
        var nextDate = Date(timeIntervalSince1970: 1_767_225_600)
        let store = DownloadTaskStore(now: {
            defer { nextDate.addTimeInterval(1) }
            return nextDate
        })
        let coordinator = VideoDownloadCoordinator(
            runner: VideoProcessRunner(tools: tools, executor: executor),
            fileStore: fileStore,
            updateState: { taskID, state in store.updateState(for: taskID, state: state) },
            removeTask: { taskID in store.remove(id: taskID) }
        )
        store.onTaskEnqueued = { task in coordinator.enqueue(task) }

        _ = store.enqueue(postId: "123", postURL: URL(string: "https://x.com/user/status/123")!)
        _ = store.enqueue(postId: "456", postURL: URL(string: "https://x.com/user/status/456")!)
        await coordinator.waitForIdle()

        XCTAssertEqual(store.tasks.count, 1)
        XCTAssertEqual(store.tasks.first?.postId, "123")
        guard case .failed = store.tasks.first?.state else { return XCTFail("失败任务应保留失败状态") }
        XCTAssertEqual(executor.downloadedURLs, [
            "https://x.com/user/status/123/1",
            "https://x.com/user/status/456/1"
        ])
    }

    private func temporaryDirectory() throws -> URL {
        let directory = FileManager.default.temporaryDirectory
            .appendingPathComponent("x-download-coordinator-\(UUID().uuidString)", isDirectory: true)
        try FileManager.default.createDirectory(at: directory, withIntermediateDirectories: true)
        addTeardownBlock {
            try? FileManager.default.removeItem(at: directory)
        }
        return directory
    }
}

private final class CoordinatorProcessExecutor: VideoProcessExecuting, @unchecked Sendable {
    private(set) var downloadedURLs: [String] = []
    let failDownloadFor: String?
    private var counter = 0

    init(failDownloadFor: String? = nil) {
        self.failDownloadFor = failDownloadFor
    }

    func run(executable: URL, arguments: [String]) throws -> VideoProcessResult {
        if arguments.contains("--dump-single-json") {
            let postURL = arguments.last!
            return VideoProcessResult(
                status: 0,
                stdout: "{\"entries\":[{\"webpage_url\":\"\(postURL)/1\"}]}",
                stderr: ""
            )
        }

        let url = arguments.last!
        downloadedURLs.append(url)
        if url == failDownloadFor {
            return VideoProcessResult(status: 1, stdout: "", stderr: "network failed")
        }
        counter += 1
        let template = arguments[arguments.firstIndex(of: "--output")! + 1]
        let output = URL(fileURLWithPath: template.replacingOccurrences(of: ".%(ext)s", with: ".mp4"))
        try FileManager.default.createDirectory(at: output.deletingLastPathComponent(), withIntermediateDirectories: true)
        try Data("video-\(counter)".utf8).write(to: output)
        return VideoProcessResult(status: 0, stdout: "", stderr: "")
    }
}
