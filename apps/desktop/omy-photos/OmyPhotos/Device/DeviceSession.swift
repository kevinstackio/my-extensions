import Combine
import Foundation
import ImageCaptureCore

struct DeviceSessionSummary: Equatable {
    let name: String
    let productKind: String?
    let serialNumber: String?
}

final class DeviceSession: NSObject, ObservableObject, ICDeviceBrowserDelegate, ICCameraDeviceDelegate {
    @Published private(set) var state: DeviceAuthorizationState = .disconnected
    @Published private(set) var summary: DeviceSessionSummary?

    private let browser = ICDeviceBrowser()
    private weak var camera: ICCameraDevice?

    func start() {
        browser.delegate = self
        browser.browsedDeviceTypeMask = .camera
        browser.start()
    }

    func stop() {
        browser.stop()
        camera?.delegate = nil
        camera?.requestCloseSession()
        camera = nil
        summary = nil
        state = .disconnected
    }

    func deviceBrowser(_ browser: ICDeviceBrowser, didAdd device: ICDevice, moreComing: Bool) {
        guard let camera = device as? ICCameraDevice else { return }

        self.camera = camera
        summary = DeviceSessionSummary(
            name: camera.name ?? "iPhone",
            productKind: camera.productKind,
            serialNumber: camera.serialNumberString
        )
        state = DeviceAuthorizationReducer.reduce(.deviceDiscovered, from: state)
        camera.delegate = self
        camera.requestOpenSession()
    }

    func deviceBrowser(_ browser: ICDeviceBrowser, didRemove device: ICDevice, moreGoing: Bool) {
        guard device === camera else { return }
        handleRemoval()
    }

    func device(_ device: ICDevice, didOpenSessionWithError error: Error?) {
        state = error == nil
            ? DeviceAuthorizationReducer.reduce(.trusted, from: state)
            : DeviceAuthorizationReducer.reduce(.sessionFailed, from: state)
    }

    func device(_ device: ICDevice, didCloseSessionWithError error: Error?) {
        if error != nil {
            state = DeviceAuthorizationReducer.reduce(.sessionFailed, from: state)
        }
    }

    func didRemove(_ device: ICDevice) {
        if device === camera { handleRemoval() }
    }

    func deviceDidBecomeReady(withCompleteContentCatalog device: ICCameraDevice) {
        state = DeviceAuthorizationReducer.reduce(.contentReady, from: state)
    }

    func cameraDeviceDidRemoveAccessRestriction(_ device: ICDevice) {
        state = DeviceAuthorizationReducer.reduce(.trusted, from: state)
    }

    func cameraDeviceDidEnableAccessRestriction(_ device: ICDevice) {
        state = DeviceAuthorizationReducer.reduce(.accessRestricted, from: state)
    }

    func cameraDevice(_ camera: ICCameraDevice, didAdd items: [ICCameraItem]) {}

    func cameraDevice(_ camera: ICCameraDevice, didRemove items: [ICCameraItem]) {}

    func cameraDevice(_ camera: ICCameraDevice, didRenameItems items: [ICCameraItem]) {}

    func cameraDeviceDidChangeCapability(_ camera: ICCameraDevice) {}

    func cameraDevice(_ camera: ICCameraDevice, didReceivePTPEvent eventData: Data) {}

    func cameraDevice(
        _ camera: ICCameraDevice,
        didReceiveThumbnail thumbnail: CGImage?,
        for item: ICCameraItem,
        error: Error?
    ) {}

    func cameraDevice(
        _ camera: ICCameraDevice,
        didReceiveMetadata metadata: [AnyHashable: Any]?,
        for item: ICCameraItem,
        error: Error?
    ) {}

    private func handleRemoval() {
        camera?.delegate = nil
        camera = nil
        summary = nil
        state = DeviceAuthorizationReducer.reduce(.deviceRemoved, from: state)
    }
}
