import Foundation
import Darwin
import XCTest

@testable import XDownloadHelper

final class NativeHostRegistrarTests: XCTestCase {
    func testRegistrarUsesAppBundleBridgeAndBothBrowserDirectories() throws {
        let root = FileManager.default.temporaryDirectory.appendingPathComponent(UUID().uuidString)
        let app = root.appendingPathComponent("X Download Helper.app")
        let bridge = app.appendingPathComponent("Contents/Helpers/x-download-native-host")
        try FileManager.default.createDirectory(at: bridge.deletingLastPathComponent(), withIntermediateDirectories: true)
        FileManager.default.createFile(atPath: bridge.path, contents: Data())
        chmod(bridge.path, 0o755)

        let registrar = NativeHostRegistrar(fileManager: .default, homeDirectory: root, appBundleURL: app)
        try registrar.register()

        for browser in ["Google/Chrome", "Microsoft Edge"] {
            let manifest = root.appendingPathComponent("Library/Application Support/\(browser)/NativeMessagingHosts/dev.kevinstack.xdownloadhelper.nativehost.json")
            XCTAssertTrue(FileManager.default.fileExists(atPath: manifest.path))
            let object = try XCTUnwrap(JSONSerialization.jsonObject(with: Data(contentsOf: manifest)) as? [String: Any])
            XCTAssertEqual(object["path"] as? String, bridge.path)
        }

        try registrar.unregister()
    }
}
