import XCTest
@testable import OhMyPhotos

final class DeviceSessionTests: XCTestCase {
    func testDeviceLifecycleShowsTrustBeforeSyncAndAvailability() {
        var state = DeviceAuthorizationState.disconnected

        state = DeviceAuthorizationReducer.reduce(.deviceDiscovered, from: state)
        XCTAssertEqual(state, .awaitingTrust)

        state = DeviceAuthorizationReducer.reduce(.trusted, from: state)
        XCTAssertEqual(state, .syncing)

        state = DeviceAuthorizationReducer.reduce(.contentReady, from: state)
        XCTAssertEqual(state, .available)
    }

    func testLockAndRemovalNeverRemainAvailable() {
        let locked = DeviceAuthorizationReducer.reduce(.accessRestricted, from: .available)
        XCTAssertEqual(locked, .locked)

        let removed = DeviceAuthorizationReducer.reduce(.deviceRemoved, from: locked)
        XCTAssertEqual(removed, .disconnected)
    }

    func testFailureCanRecoverThroughDiscovery() {
        let failed = DeviceAuthorizationReducer.reduce(.sessionFailed, from: .syncing)
        XCTAssertEqual(failed, .failed)

        let recovered = DeviceAuthorizationReducer.reduce(.deviceDiscovered, from: failed)
        XCTAssertEqual(recovered, .awaitingTrust)
    }
}
