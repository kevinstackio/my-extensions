import XCTest
import ImageCaptureCore
@testable import exts

final class ProbeEventReducerTests: XCTestCase {
    func testAuthorizationFlowDoesNotSkipTrustState() {
        var state = DeviceProbeState.idle

        state = ProbeEventReducer.reduce(.deviceFound, from: state)
        XCTAssertEqual(state, .discovered)

        state = ProbeEventReducer.reduce(.authorizationRequired, from: state)
        XCTAssertEqual(state, .awaitingTrust)

        state = ProbeEventReducer.reduce(.deviceReady, from: state)
        XCTAssertEqual(state, .ready)
    }

    func testDisconnectNeverRemainsReadyAndReconnectStartsDiscovery() {
        let disconnected = ProbeEventReducer.reduce(
            .deviceDisconnected,
            from: .ready
        )
        XCTAssertEqual(disconnected, .disconnected)

        let reconnected = ProbeEventReducer.reduce(
            .deviceFound,
            from: disconnected
        )
        XCTAssertEqual(reconnected, .discovered)
    }

    func testLockedDeviceAndUnknownEventsAreSafe() {
        let locked = ProbeEventReducer.reduce(.deviceLocked, from: .ready)
        XCTAssertEqual(locked, .locked)

        let unchanged = ProbeEventReducer.reduce(.unknown, from: locked)
        XCTAssertEqual(unchanged, .locked)
    }

    func testDiagnosticDownloadOptionsUseTemporaryDirectoryAndNeverOverwrite() {
        let directory = URL(fileURLWithPath: "/tmp/exts-probe")

        let options = MediaProbe.diagnosticDownloadOptions(
            directory: directory,
            filename: "IMG_0001.HEIC"
        )

        XCTAssertEqual(options[.downloadsDirectoryURL] as? URL, directory)
        XCTAssertEqual(options[.saveAsFilename] as? String, "IMG_0001.HEIC")
        XCTAssertEqual(options[.overwrite] as? Bool, false)
        XCTAssertEqual(options[.sidecarFiles] as? Bool, true)
    }
}
