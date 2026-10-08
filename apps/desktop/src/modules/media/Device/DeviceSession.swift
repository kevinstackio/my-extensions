import AppKit
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

private final class WeakDeviceSessionBox: @unchecked Sendable {
    weak var value: DeviceSession?

    init(_ value: DeviceSession) {
        self.value = value
    }
}

final class DeviceSession: NSObject, ObservableObject, ICDeviceBrowserDelegate, ICCameraDeviceDelegate {
    @Published private(set) var state: DeviceAuthorizationState = .disconnected
    @Published private(set) var summary: DeviceSessionSummary?
    @Published private(set) var mediaItems: [MediaItem] = []
    @Published private(set) var thumbnailImages: [String: NSImage] = [:]
    @Published private(set) var failedThumbnailIDs: Set<String> = []

    private let browser = ICDeviceBrowser()
    private let downloadCoordinator = DownloadCoordinator()
    private let decodedImageCache = DecodedImageCache()
    private let thumbnailScheduler = ThumbnailScheduler(maxConcurrent: 4)
    private var thumbnailStore: ThumbnailDiskStore?
    private weak var camera: ICCameraDevice?
    private var filesByID: [String: ICCameraFile] = [:]
    private var isStarted = false
    private var thumbnailGeneration = 0

    override init() {
        thumbnailStore = try? ThumbnailDiskStore()
        super.init()
    }

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
        resetThumbnails(clearDecodedCache: true)
        summary = nil
        state = .disconnected
    }

    func requestThumbnail(for id: String) {
        guard thumbnailImages[id] == nil, let file = filesByID[id] else { return }

        if let data = decodedImageCache.data(for: id), let image = NSImage(data: data) {
            thumbnailImages[id] = image
            failedThumbnailIDs.remove(id)
            return
        }

        if let thumbnailStore {
            do {
                if let data = try thumbnailStore.data(for: id), let image = NSImage(data: data) {
                    decodedImageCache.insert(data, for: id)
                    thumbnailImages[id] = image
                    failedThumbnailIDs.remove(id)
                    return
                }
            } catch {
                // 缓存读取失败时继续请求设备，避免磁盘缓存阻塞首屏缩略图。
            }
        }

        failedThumbnailIDs.remove(id)
        guard let request = thumbnailScheduler.enqueue(id: id, priority: .visible) else { return }
        startThumbnailRequest(request, file: file, generation: thumbnailGeneration)
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
            if let error {
                let hasAAESidecar = file.sidecarFiles?
                    .compactMap { $0 as? ICCameraFile }
                    .contains {
                        MediaItem.isAAESidecar(
                            name: $0.name ?? $0.originalFilename ?? "",
                            uti: $0.uti
                        )
                    } ?? false
                if hasAAESidecar, FileManager.default.fileExists(atPath: temporaryURL.path) {
                    // 主文件已落盘时保留它，把附属文件错误作为独立结果返回。
                    return DownloadTransferResult(sidecarErrorDescription: error.localizedDescription)
                }
                throw error
            }
            return .success
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
            resetThumbnails(clearDecodedCache: false)
            return
        }

        var nextFiles: [String: ICCameraFile] = [:]
        mediaItems = files.filter { file in
            !MediaItem.isAAESidecar(
                name: file.name ?? file.originalFilename ?? "",
                uti: file.uti
            )
        }.map { file in
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
        let nextIDs = Set(nextFiles.keys)
        thumbnailImages = thumbnailImages.filter { nextIDs.contains($0.key) }
        failedThumbnailIDs = failedThumbnailIDs.intersection(nextIDs)
        thumbnailGeneration &+= 1
        thumbnailScheduler.reset()
    }

    private func startThumbnailRequest(
        _ request: ThumbnailRequest,
        file: ICCameraFile,
        generation: Int
    ) {
        // ImageCaptureCore 的缩略图回调不保证在主线程，统一回到主线程更新 SwiftUI 状态。
        let sessionBox = WeakDeviceSessionBox(self)
        file.requestThumbnailData(options: nil) { data, _ in
            Task { @MainActor in
                sessionBox.value?.finishThumbnail(
                    id: request.id,
                    data: data,
                    generation: generation
                )
            }
        }
    }

    private func finishThumbnail(id: String, data: Data?, generation: Int) {
        guard generation == thumbnailGeneration else { return }
        let nextRequest = thumbnailScheduler.complete(id: id)

        if let data, let image = NSImage(data: data) {
            decodedImageCache.insert(data, for: id)
            try? thumbnailStore?.save(data, for: id)
            thumbnailImages[id] = image
            failedThumbnailIDs.remove(id)
        } else {
            failedThumbnailIDs.insert(id)
        }

        guard let nextRequest, let file = filesByID[nextRequest.id] else { return }
        startThumbnailRequest(nextRequest, file: file, generation: generation)
    }

    private func resetThumbnails(clearDecodedCache: Bool) {
        thumbnailGeneration &+= 1
        thumbnailScheduler.reset()
        thumbnailImages.removeAll()
        failedThumbnailIDs.removeAll()
        if clearDecodedCache {
            decodedImageCache.removeAll()
        }
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
        resetThumbnails(clearDecodedCache: true)
        summary = nil
        state = DeviceAuthorizationReducer.reduce(.deviceRemoved, from: state)
    }
}
