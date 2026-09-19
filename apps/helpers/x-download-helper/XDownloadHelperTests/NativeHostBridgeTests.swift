import XCTest

@testable import XDownloadHelper

final class NativeHostBridgeTests: XCTestCase {
    func testOnlyConfiguredDevelopmentOriginIsAccepted() {
        XCTAssertTrue(NativeHostBridge.isAllowedOrigin("chrome-extension://mdkcfihmaejbecgoinnnlkjmbpmnfekl/"))
        XCTAssertFalse(NativeHostBridge.isAllowedOrigin("chrome-extension://other-extension/"))
    }
}
