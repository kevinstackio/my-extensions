import XCTest

@testable import XDownloadHelper

final class VideoDownloadFileStoreTests: XCTestCase {
    func testBuildsTimestampedNamesAndMovesAllVideosToDownloadDirectory() throws {
        let root = try temporaryDirectory()
        let downloadDirectory = root.appendingPathComponent("Downloads/X Download", isDirectory: true)
        let store = VideoDownloadFileStore(temporaryRoot: root, downloadDirectory: downloadDirectory, timeZone: TimeZone(secondsFromGMT: 0)!)
        let receivedAt = Date(timeIntervalSince1970: 1_758_326_400)
        let workspace = try store.makeWorkspace(taskID: UUID(), receivedAt: receivedAt)
        let first = workspace.directory.appendingPathComponent("video-01.mp4")
        let second = workspace.directory.appendingPathComponent("video-02.mp4")
        try Data("one".utf8).write(to: first)
        try Data("two".utf8).write(to: second)

        let moved = try store.moveToDownloadDirectory(
            files: [first, second],
            receivedAt: receivedAt
        )

        XCTAssertEqual(moved.map(\.lastPathComponent), [
            "X_VIDEO_20250920_000000_01.mp4",
            "X_VIDEO_20250920_000000_02.mp4"
        ])
        XCTAssertEqual(try String(contentsOf: moved[0], encoding: .utf8), "one")
        XCTAssertEqual(try String(contentsOf: moved[1], encoding: .utf8), "two")
    }

    func testExistingDownloadNameGetsSafeSuffixWithoutOverwriting() throws {
        let root = try temporaryDirectory()
        let downloadDirectory = root.appendingPathComponent("Downloads/X Download", isDirectory: true)
        let store = VideoDownloadFileStore(temporaryRoot: root, downloadDirectory: downloadDirectory, timeZone: TimeZone(secondsFromGMT: 0)!)
        let receivedAt = Date(timeIntervalSince1970: 1_758_326_400)
        let workspace = try store.makeWorkspace(taskID: UUID(), receivedAt: receivedAt)
        let source = workspace.directory.appendingPathComponent("video.mp4")
        try Data("new".utf8).write(to: source)
        let existing = downloadDirectory.appendingPathComponent("X_VIDEO_20250920_000000.mp4")
        try FileManager.default.createDirectory(at: downloadDirectory, withIntermediateDirectories: true)
        try Data("old".utf8).write(to: existing)

        let moved = try store.moveToDownloadDirectory(files: [source], receivedAt: receivedAt)
        XCTAssertEqual(moved.map(\.lastPathComponent), ["X_VIDEO_20250920_000000-1.mp4"])
        XCTAssertEqual(try String(contentsOf: existing, encoding: .utf8), "old")
        XCTAssertEqual(try String(contentsOf: moved[0], encoding: .utf8), "new")
    }

    func testStartupCleanupRemovesOnlyOrphanedTaskDirectories() throws {
        let root = try temporaryDirectory()
        let store = VideoDownloadFileStore(temporaryRoot: root, downloadDirectory: root.appendingPathComponent("Downloads/X Download"))
        let orphan = root.appendingPathComponent("x-download", isDirectory: true)
            .appendingPathComponent("orphan-task", isDirectory: true)
        try FileManager.default.createDirectory(at: orphan, withIntermediateDirectories: true)

        try store.cleanupOrphanedWorkspaces()

        XCTAssertFalse(FileManager.default.fileExists(atPath: orphan.path))
    }

    private func temporaryDirectory() throws -> URL {
        let directory = FileManager.default.temporaryDirectory
            .appendingPathComponent("x-download-file-store-\(UUID().uuidString)", isDirectory: true)
        try FileManager.default.createDirectory(at: directory, withIntermediateDirectories: true)
        addTeardownBlock {
            try? FileManager.default.removeItem(at: directory)
        }
        return directory
    }
}
