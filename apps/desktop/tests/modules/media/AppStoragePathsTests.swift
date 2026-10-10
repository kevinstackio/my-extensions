import Foundation
import XCTest
@testable import exts

final class AppStoragePathsTests: XCTestCase {
    func testDevelopmentAndProductionUseSeparatePathsWithoutChangingLegacyProduction() {
        let home = URL(fileURLWithPath: "/fixture/home", isDirectory: true)
        let support = home.appendingPathComponent("Library/Application Support", isDirectory: true)
        let production = AppStoragePaths(bundleIdentifier: "dev.linguio.exts", homeDirectory: home, applicationSupportDirectory: support)
        let development = AppStoragePaths(bundleIdentifier: "dev.linguio.exts.dev", homeDirectory: home, applicationSupportDirectory: support)
        XCTAssertEqual(production.thumbnailDirectory.path, support.appendingPathComponent("OhMy Photos/Thumbnails").path)
        XCTAssertEqual(production.downloadDirectory.path, home.appendingPathComponent("Downloads/OhMy Photos").path)
        XCTAssertNotEqual(development.thumbnailDirectory, production.thumbnailDirectory)
        XCTAssertNotEqual(development.downloadDirectory, production.downloadDirectory)
        XCTAssertEqual(development.thumbnailDirectory.path, support.appendingPathComponent("Exts Dev/Thumbnails").path)
        XCTAssertEqual(development.downloadDirectory.path, home.appendingPathComponent("Downloads/Exts Dev").path)
    }
}
