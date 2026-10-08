import XCTest
@testable import exts

final class DownloadCoordinatorTests: XCTestCase {
    func testDownloadsNeverOverwriteAndRemoveTemporaryFilesOnFailure() throws {
        let destination = FileManager.default.temporaryDirectory
            .appendingPathComponent("extsDownloadTests-\(UUID().uuidString)", isDirectory: true)
        let items = [makeItem(id: "a"), makeItem(id: "b"), makeItem(id: "fail"), makeItem(id: "c")]
        let coordinator = DownloadCoordinator()

        let results = coordinator.enqueue(items: items, destination: destination) { item, temporaryURL in
            if item.id == "fail" { throw TestError.failed }
            try Data(item.id.utf8).write(to: temporaryURL)
            return .success
        }

        XCTAssertEqual(results.filter(\.succeeded).count, 3)
        XCTAssertTrue(FileManager.default.fileExists(atPath: destination.appendingPathComponent("IMG.jpg").path))
        XCTAssertTrue(FileManager.default.fileExists(atPath: destination.appendingPathComponent("IMG (2).jpg").path))
        XCTAssertFalse(try FileManager.default.contentsOfDirectory(at: destination, includingPropertiesForKeys: nil)
            .contains { $0.pathExtension == "tmp" })
        XCTAssertEqual(coordinator.maxConcurrent, 2)
    }

    func testKeepsMainFileSuccessWhenTransferReportsSidecarFailure() throws {
        let destination = FileManager.default.temporaryDirectory
            .appendingPathComponent("extsSidecarTests-\(UUID().uuidString)", isDirectory: true)
        let coordinator = DownloadCoordinator()

        let results = coordinator.enqueue(
            items: [makeItem(id: "sidecar")],
            destination: destination
        ) { _, temporaryURL in
            try Data("main".utf8).write(to: temporaryURL)
            return DownloadTransferResult(sidecarErrorDescription: "AAE 下载失败")
        }

        XCTAssertEqual(results.count, 1)
        XCTAssertTrue(results[0].succeeded)
        XCTAssertEqual(results[0].sidecarErrorDescription, "AAE 下载失败")
        XCTAssertTrue(FileManager.default.fileExists(atPath: results[0].url!.path))
    }

    private func makeItem(id: String) -> MediaItem {
        MediaItem(
            id: id,
            name: "IMG.jpg",
            uti: "public.jpeg",
            fileSize: 1,
            duration: 0,
            creationDate: nil,
            modificationDate: nil,
            fingerprint: nil
        )
    }

    private enum TestError: Error { case failed }
}
