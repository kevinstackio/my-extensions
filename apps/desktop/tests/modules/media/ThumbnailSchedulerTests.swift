import XCTest
@testable import exts

final class ThumbnailSchedulerTests: XCTestCase {
    func testVisibleRequestsUseFourSlotsBeforePrefetch() {
        let scheduler = ThumbnailScheduler(maxConcurrent: 4)

        scheduler.request(
            visibleIDs: ["v1", "v2", "v3", "v4", "v5"],
            prefetchIDs: ["p1", "p2"]
        )

        XCTAssertEqual(scheduler.activeRequests.map(\.id), ["v1", "v2", "v3", "v4"])
        XCTAssertEqual(scheduler.queuedRequests.map(\.id), ["v5", "p1", "p2"])
        XCTAssertTrue(scheduler.activeRequests.allSatisfy { $0.priority == .visible })
    }

    func testFastScrollCancelsLowPriorityPrefetchWithoutDroppingVisibleWork() {
        let scheduler = ThumbnailScheduler(maxConcurrent: 2)
        scheduler.request(visibleIDs: ["v1"], prefetchIDs: ["p1", "p2", "p3"])

        let cancelled = scheduler.cancelPrefetch()

        XCTAssertEqual(cancelled, ["p1", "p2", "p3"])
        XCTAssertEqual(scheduler.activeRequests.map(\.id), ["v1"])
        XCTAssertTrue(scheduler.queuedRequests.isEmpty)
    }

    func testCompletedRequestPromotesNextQueuedThumbnail() {
        let scheduler = ThumbnailScheduler(maxConcurrent: 1)

        XCTAssertEqual(scheduler.enqueue(id: "v1", priority: .visible)?.id, "v1")
        XCTAssertNil(scheduler.enqueue(id: "v2", priority: .visible))

        XCTAssertEqual(scheduler.complete(id: "v1")?.id, "v2")
        XCTAssertEqual(scheduler.activeRequests.map(\.id), ["v2"])
        XCTAssertTrue(scheduler.queuedRequests.isEmpty)
    }

    func testDiskCacheAndDecodedCacheExposeBoundedPolicies() throws {
        let disk = try ThumbnailDiskStore(rootURL: temporaryDirectory())
        let payload = Data([1, 2, 3])
        try disk.save(payload, for: "media/1")
        XCTAssertEqual(try disk.data(for: "media/1"), payload)

        let cache = DecodedImageCache(maxBytes: 10)
        cache.insert(Data(repeating: 1, count: 6), for: "first")
        cache.insert(Data(repeating: 2, count: 6), for: "second")
        XCTAssertNil(cache.data(for: "first"))
        XCTAssertEqual(cache.data(for: "second")?.count, 6)
    }

    private func temporaryDirectory() -> URL {
        FileManager.default.temporaryDirectory
            .appendingPathComponent("extsThumbnailTests-\(UUID().uuidString)", isDirectory: true)
    }
}
