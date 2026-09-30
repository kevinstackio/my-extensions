import Foundation
import ImageCaptureCore

struct MediaProbeSummary: Equatable, Identifiable {
    let id: String
    let name: String
    let uti: String?
    let fileSize: Int64
    let duration: TimeInterval
    let creationDate: Date?
    let modificationDate: Date?
    let fingerprint: String?
}

final class MediaProbe: NSObject, ICDeviceBrowserDelegate, ICCameraDeviceDelegate {
    private let browser = ICDeviceBrowser()

    private(set) var state: DeviceProbeState = .idle
    private(set) var summaries: [MediaProbeSummary] = []
    private weak var camera: ICCameraDevice?

    static func diagnosticDownloadOptions(directory: URL, filename: String) -> [ICDownloadOption: Any] {
        [
            .downloadsDirectoryURL: directory,
            .saveAsFilename: filename,
            .overwrite: false,
            .sidecarFiles: true,
            .deleteAfterSuccessfulDownload: false
        ]
    }

    @discardableResult
    func requestDiagnosticDownload(
        _ file: ICCameraFile,
        completion: @escaping (String?, Error?) -> Void
    ) -> Progress? {
        let directory = FileManager.default.temporaryDirectory
            .appendingPathComponent("OmyPhotosProbe-\(UUID().uuidString)", isDirectory: true)

        do {
            try FileManager.default.createDirectory(
                at: directory,
                withIntermediateDirectories: true
            )
        } catch {
            completion(nil, error)
            return nil
        }

        let filename = file.name ?? file.originalFilename ?? "probe-media"
        let options = Self.diagnosticDownloadOptions(directory: directory, filename: filename)
        return file.requestDownload(options: options, completion: completion)
    }

    func requestDiagnosticThumbnail(
        _ file: ICCameraFile,
        completion: @escaping (Data?, Error?) -> Void
    ) {
        file.requestThumbnailData(
            options: nil,
            completion: completion
        )
    }

    func requestDiagnosticMetadata(
        _ file: ICCameraFile,
        completion: @escaping ([AnyHashable: Any]?, Error?) -> Void
    ) {
        file.requestMetadataDictionary(options: nil, completion: completion)
    }

    func start() {
        browser.delegate = self
        browser.browsedDeviceTypeMask = .camera
        browser.start()
    }

    func stop() {
        browser.stop()
        camera?.requestCloseSession()
        camera = nil
        state = .disconnected
    }

    func deviceBrowser(_ browser: ICDeviceBrowser, didAdd device: ICDevice, moreComing: Bool) {
        guard let camera = device as? ICCameraDevice else { return }
        self.camera = camera
        state = ProbeEventReducer.reduce(.deviceFound, from: state)
        camera.delegate = self
        camera.requestOpenSession()
    }

    func deviceBrowser(_ browser: ICDeviceBrowser, didRemove device: ICDevice, moreGoing: Bool) {
        guard device === camera else { return }
        camera = nil
        state = ProbeEventReducer.reduce(.deviceDisconnected, from: state)
    }

    func device(_ device: ICDevice, didOpenSessionWithError error: Error?) {
        state = error == nil ? state : .failed
    }

    func device(_ device: ICDevice, didCloseSessionWithError error: Error?) {
        if error != nil { state = .failed }
    }

    func didRemove(_ device: ICDevice) {
        state = ProbeEventReducer.reduce(.deviceDisconnected, from: state)
    }

    func deviceDidBecomeReady(withCompleteContentCatalog device: ICCameraDevice) {
        state = ProbeEventReducer.reduce(.deviceReady, from: state)
        refreshMediaSummaries()
    }

    func cameraDeviceDidRemoveAccessRestriction(_ device: ICDevice) {
        state = ProbeEventReducer.reduce(.deviceReady, from: state)
    }

    func cameraDeviceDidEnableAccessRestriction(_ device: ICDevice) {
        state = ProbeEventReducer.reduce(.deviceLocked, from: state)
    }

    func cameraDevice(_ camera: ICCameraDevice, didAdd items: [ICCameraItem]) {
        refreshMediaSummaries()
    }

    func cameraDevice(_ camera: ICCameraDevice, didRemove items: [ICCameraItem]) {
        refreshMediaSummaries()
    }

    func cameraDevice(_ camera: ICCameraDevice, didRenameItems items: [ICCameraItem]) {
        refreshMediaSummaries()
    }

    func cameraDeviceDidChangeCapability(_ camera: ICCameraDevice) {}

    func cameraDevice(_ camera: ICCameraDevice, didReceivePTPEvent eventData: Data) {}

    func cameraDevice(_ camera: ICCameraDevice, didReceiveThumbnail thumbnail: CGImage?, for item: ICCameraItem, error: Error?) {}

    func cameraDevice(_ camera: ICCameraDevice, didReceiveMetadata metadata: [AnyHashable: Any]?, for item: ICCameraItem, error: Error?) {}

    private func refreshMediaSummaries() {
        guard let files = camera?.mediaFiles?.compactMap({ $0 as? ICCameraFile }) else {
            summaries = []
            return
        }

        summaries = files.map { file in
            let id = file.fingerprint ?? file.name ?? UUID().uuidString
            return MediaProbeSummary(
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
    }
}
