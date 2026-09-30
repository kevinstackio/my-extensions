import XCTest
@testable import OhMyPhotos

final class FailureRecoveryTests: XCTestCase {
    func testDeviceRemovalFromAvailableAlwaysReturnsToDisconnected() {
        let state = DeviceAuthorizationReducer.reduce(.deviceRemoved, from: .available)

        XCTAssertEqual(state, .disconnected)
    }

    func testDownloadFailureDoesNotPreventLaterItemFromCompleting() throws {
        let destination = FileManager.default.temporaryDirectory
            .appendingPathComponent("OhMyPhotosRecoveryTests-\(UUID().uuidString)", isDirectory: true)
        let items = [makeItem(id: "failed"), makeItem(id: "recovered")]
        let coordinator = DownloadCoordinator()

        let results = coordinator.enqueue(items: items, destination: destination) { item, url in
            if item.id == "failed" { throw RecoveryError.failed }
            try Data("ok".utf8).write(to: url)
        }

        XCTAssertEqual(results.map(\.succeeded), [false, true])
        XCTAssertFalse(try FileManager.default.contentsOfDirectory(at: destination, includingPropertiesForKeys: nil)
            .contains { $0.pathExtension == "tmp" })
    }

    func testUnavailableDestinationReturnsFailuresWithoutStartingTransfers() throws {
        let destination = FileManager.default.temporaryDirectory
            .appendingPathComponent("OhMyPhotosRecoveryDestination-\(UUID().uuidString)")
        try Data("not a directory".utf8).write(to: destination)
        defer { try? FileManager.default.removeItem(at: destination) }

        let coordinator = DownloadCoordinator()
        let results = coordinator.enqueue(items: [makeItem(id: "blocked")], destination: destination) { _, _ in
            XCTFail("目标目录不可用时不应开始传输")
        }

        XCTAssertEqual(results.count, 1)
        XCTAssertFalse(results[0].succeeded)
    }

    private func makeItem(id: String) -> MediaItem {
        MediaItem(
            id: id,
            name: "\(id).jpg",
            uti: "public.jpeg",
            fileSize: 1,
            duration: 0,
            creationDate: nil,
            modificationDate: nil,
            fingerprint: nil
        )
    }

    private enum RecoveryError: Error { case failed }
}
