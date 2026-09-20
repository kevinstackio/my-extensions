import Foundation

@MainActor
final class HelperRequestHandler {
    private let store: DownloadTaskStore
    private let showPopover: () -> Void

    init(store: DownloadTaskStore, showPopover: @escaping () -> Void) {
        self.store = store
        self.showPopover = showPopover
    }

    func handle(_ request: NativeMessageRequest) -> NativeMessageResponse {
        guard supportedNativeMessageProtocolVersions.contains(request.protocolVersion) else {
            return .failure(requestId: request.requestId, protocolVersion: request.protocolVersion, code: .unsupportedProtocol, message: "不支持的协议版本")
        }
        guard request.type == "task.enqueue" else {
            return .failure(requestId: request.requestId, protocolVersion: request.protocolVersion, code: .unsupportedMessage, message: "不支持的消息类型")
        }
        guard isValidPost(request.payload.postId, urlString: request.payload.postUrl) else {
            return .failure(requestId: request.requestId, protocolVersion: request.protocolVersion, code: .invalidRequest, message: "帖子请求无效")
        }
        let mediaSources: [VideoMediaSource]
        do {
            mediaSources = try VideoMediaSourceValidator.validate(request.payload.mediaSources ?? [])
        } catch {
            return .failure(requestId: request.requestId, protocolVersion: request.protocolVersion, code: .invalidRequest, message: "视频来源无效")
        }

        let result = store.enqueue(postId: request.payload.postId, postURL: URL(string: request.payload.postUrl)!, mediaSources: mediaSources)
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
