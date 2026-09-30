import Combine
import Foundation
import ImageCaptureCore

struct DeviceSessionSummary: Equatable {
    let name: String
    let productKind: String?
    let serialNumber: String?
}

enum DeviceSessionError: Error {
    case mediaUnavailable
    case downloadRequestUnavailable
}

final class DeviceSession: NSObject, ObservableObject, ICDeviceBrowserDelegate, ICCameraDeviceDelegate {
    @Published private(set) var state: DeviceAuthorizationState = .disconnected
    @Published private(set) var summary: DeviceSessionSummary?
    @Published private(set) var mediaItems: [MediaItem] = []

    private let browser = ICDeviceBrowser()
    private let downloadCoordinator = DownloadCoordinator()
    private weak var camera: ICCameraDevice?
    private var filesByID: [String: ICCameraFile] = [:]
    private var isStarted = false

    func start() {
        guard !isStarted else { return }
        isStarted = true
        browser.delegate = self
        browser.browsedDeviceTypeMask = .camera
        browser.start()
    }

    func retry() {
        stop()
        start()
    }

    func stop() {
        isStarted = false
        browser.stop()
        camera?.delegate = nil
        camera?.requestCloseSession()
        camera = nil
        filesByID.removeAll()
        mediaItems.removeAll()
        summary = nil
        state = .disconnected
    }

    func download(
        items: [MediaItem],
        destination: URL = DestinationAccess.defaultDirectory()
    ) -> [DownloadResult] {
        let files = filesByID
        return downloadCoordinator.enqueue(items: items, destination: destination) { item, temporaryURL in
            guard let file = files[item.id] else { throw DeviceSessionError.mediaUnavailable }

            let directory = temporaryURL.deletingLastPathComponent()
            let options: [ICDownloadOption: Any] = [
                .downloadsDirectoryURL: directory,
                .saveAsFilename: temporaryURL.lastPathComponent,
                .overwrite: false,
                .sidecarFiles: true,
                .deleteAfterSuccessfulDownload: false
            ]
            let semaphore = DispatchSemaphore(value: 0)
            let lock = NSLock()
            var transferError: Error?
            guard file.requestDownload(options: options) { _, error in
                lock.lock()
                transferError = error
                lock.unlock()
                semaphore.signal()
            } != nil else {
                throw DeviceSessionError.downloadRequestUnavailable
            }
            semaphore.wait()
            lock.lock()
            let error = transferError
            lock.unlock()
            if let error { throw error }
        }
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
        refreshMediaItems()
    }

    func cameraDeviceDidRemoveAccessRestriction(_ device: ICDevice) {
        state = DeviceAuthorizationReducer.reduce(.trusted, from: state)
    }

    func cameraDeviceDidEnableAccessRestriction(_ device: ICDevice) {
        state = DeviceAuthorizationReducer.reduce(.accessRestricted, from: state)
    }

    func cameraDevice(_ camera: ICCameraDevice, didAdd items: [ICCameraItem]) {
        refreshMediaItems()
    }

    func cameraDevice(_ camera: ICCameraDevice, didRemove items: [ICCameraItem]) {
        refreshMediaItems()
    }

    func cameraDevice(_ camera: ICCameraDevice, didRenameItems items: [ICCameraItem]) {
        refreshMediaItems()
    }

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

    private func refreshMediaItems() {
        guard let files = camera?.mediaFiles?.compactMap({ $0 as? ICCameraFile }) else {
            filesByID.removeAll()
            mediaItems.removeAll()
            return
        }

        var nextFiles: [String: ICCameraFile] = [:]
        mediaItems = files.map { file in
            let id = mediaID(for: file)
            nextFiles[id] = file
            return MediaItem(
                id: id,
                name: file.name ?? file.originalFilename ?? "未命名媒体",
                uti: file.uti,
                fileSize: Int64(file.fileSize),
                duration: file.duration,
                creationDate: file.exifCreationDate ?? file.fileCreationDate,
                modificationDate: file.fileModificationDate,
                fingerprint: file.fingerprint
            )
        }
        filesByID = nextFiles
    }

    private func mediaID(for file: ICCameraFile) -> String {
        if let fingerprint = file.fingerprint { return fingerprint }
        let name = file.name ?? file.originalFilename ?? "media"
        let date = file.exifCreationDate?.timeIntervalSince1970 ?? file.fileCreationDate?.timeIntervalSince1970 ?? 0
        return "\(name)-\(file.fileSize)-\(date)"
    }

    private func handleRemoval() {
        camera?.delegate = nil
        camera = nil
        filesByID.removeAll()
        mediaItems.removeAll()
        summary = nil
        state = DeviceAuthorizationReducer.reduce(.deviceRemoved, from: state)
    }
}
