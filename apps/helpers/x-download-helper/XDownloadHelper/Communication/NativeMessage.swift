import Foundation

let nativeMessageProtocolVersion = 2
let supportedNativeMessageProtocolVersions: Set<Int> = [2]
let nativeMessageHostName = "dev.kevinstack.xdownloadhelper.nativehost"

enum NativeMessageErrorCode: String, Codable {
    case invalidRequest = "INVALID_REQUEST"
    case unsupportedProtocol = "UNSUPPORTED_PROTOCOL"
    case unsupportedMessage = "UNSUPPORTED_MESSAGE"
    case helperStartTimeout = "HELPER_START_TIMEOUT"
    case helperUnavailable = "HELPER_UNAVAILABLE"
    case internalError = "INTERNAL_ERROR"
}

struct NativeMessagePayload: Codable, Equatable {
    let postId: String?
    let postUrl: String?
    // 保留可选仅为兼容 JSON 解码层的缺字段错误，Handler 会把 nil 和空数组统一拒绝。
    let mediaSources: [VideoMediaSource]?

    init(postId: String? = nil, postUrl: String? = nil, mediaSources: [VideoMediaSource]? = nil) {
        self.postId = postId
        self.postUrl = postUrl
        self.mediaSources = mediaSources
    }
}

struct NativeMessageRequest: Codable, Equatable {
    let protocolVersion: Int
    let requestId: String
    let type: String
    let payload: NativeMessagePayload
}

enum EnqueueDisposition: String, Codable {
    case created
    case existing
}

struct NativeMessageResult: Codable, Equatable {
    let taskId: UUID?
    let disposition: EnqueueDisposition?
    let failedTaskCount: Int?
}

struct NativeMessageError: Codable, Equatable {
    let code: NativeMessageErrorCode
    let message: String
}

struct NativeMessageResponse: Codable, Equatable {
    let protocolVersion: Int
    let requestId: String
    let ok: Bool
    let result: NativeMessageResult?
    let error: NativeMessageError?

    static func success(requestId: String, protocolVersion: Int, taskId: UUID, disposition: EnqueueDisposition) -> Self {
        Self(
            protocolVersion: protocolVersion,
            requestId: requestId,
            ok: true,
            result: NativeMessageResult(taskId: taskId, disposition: disposition, failedTaskCount: nil),
            error: nil
        )
    }

    static func popupSuccess(requestId: String, protocolVersion: Int, failedTaskCount: Int) -> Self {
        Self(
            protocolVersion: protocolVersion,
            requestId: requestId,
            ok: true,
            result: NativeMessageResult(taskId: nil, disposition: nil, failedTaskCount: failedTaskCount),
            error: nil
        )
    }

    static func failure(requestId: String, protocolVersion: Int, code: NativeMessageErrorCode, message: String) -> Self {
        Self(protocolVersion: protocolVersion, requestId: requestId, ok: false, result: nil, error: NativeMessageError(code: code, message: message))
    }
}
