import AppKit
import Foundation

@MainActor
final class HelperRequestHandler {
    private let store: DownloadTaskStore
    private let showPopover: () -> Void
    private let openDownloads: () -> Void

    init(
        store: DownloadTaskStore,
        showPopover: @escaping () -> Void,
        openDownloads: @escaping () -> Void = {
            if let directory = FileManager.default.urls(for: .downloadsDirectory, in: .userDomainMask).first {
                NSWorkspace.shared.open(directory)
            }
        }
    ) {
        self.store = store
        self.showPopover = showPopover
        self.openDownloads = openDownloads
    }

    func handle(_ request: NativeMessageRequest) -> NativeMessageResponse {
        // Helper 是 Native Messaging 的最终边界：即使扩展已经校验过，也必须在这里重新拒绝旧协议和空来源。
        guard supportedNativeMessageProtocolVersions.contains(request.protocolVersion) else {
            return .failure(requestId: request.requestId, protocolVersion: request.protocolVersion, code: .unsupportedProtocol, message: "不支持的协议版本")
        }

        switch request.type {
        case "task.enqueue":
            return handleEnqueue(request)
        case "popup.snapshot":
            return .popupSuccess(requestId: request.requestId, protocolVersion: request.protocolVersion, failedTaskCount: store.failedTaskCount)
        case "popup.open-downloads":
            openDownloads()
            return .popupSuccess(requestId: request.requestId, protocolVersion: request.protocolVersion, failedTaskCount: store.failedTaskCount)
        case "popup.clear-failed":
            store.clearFailed()
            return .popupSuccess(requestId: request.requestId, protocolVersion: request.protocolVersion, failedTaskCount: store.failedTaskCount)
        default:
            return .failure(requestId: request.requestId, protocolVersion: request.protocolVersion, code: .unsupportedMessage, message: "不支持的消息类型")
        }
    }

    private func handleEnqueue(_ request: NativeMessageRequest) -> NativeMessageResponse {
        guard let postId = request.payload.postId,
              let postUrl = request.payload.postUrl else {
            return .failure(requestId: request.requestId, protocolVersion: request.protocolVersion, code: .invalidRequest, message: "帖子请求无效")
        }
        guard isValidPost(postId, urlString: postUrl) else {
            return .failure(requestId: request.requestId, protocolVersion: request.protocolVersion, code: .invalidRequest, message: "帖子请求无效")
        }
        guard let rawMediaSources = request.payload.mediaSources, !rawMediaSources.isEmpty else {
            return .failure(requestId: request.requestId, protocolVersion: request.protocolVersion, code: .invalidRequest, message: "视频来源不能为空")
        }

        let mediaSources: [VideoMediaSource]
        do {
            // 只把页面给出的完整 HLS、DASH 或 MP4 来源交给下载器，Helper 不再承担帖子解析职责。
            mediaSources = try VideoMediaSourceValidator.validate(rawMediaSources)
        } catch {
            return .failure(requestId: request.requestId, protocolVersion: request.protocolVersion, code: .invalidRequest, message: "视频来源无效")
        }

        let result = store.enqueue(postId: postId, postURL: URL(string: postUrl)!, mediaSources: mediaSources)
        showPopover()
        switch result {
        case let .created(taskID):
            return .success(requestId: request.requestId, protocolVersion: request.protocolVersion, taskId: taskID, disposition: .created)
        case let .existing(taskID):
            return .success(requestId: request.requestId, protocolVersion: request.protocolVersion, taskId: taskID, disposition: .existing)
        }
    }

    private func isValidPost(_ postId: String, urlString: String) -> Bool {
        guard let url = URL(string: urlString), url.scheme == "https", url.host == "x.com" else { return false }
        let components = url.path.split(separator: "/")
        guard components.count == 3, components[1] == "status", components[2] == postId else { return false }
        return !components[0].isEmpty && postId.allSatisfy(\.isNumber)
    }
}
