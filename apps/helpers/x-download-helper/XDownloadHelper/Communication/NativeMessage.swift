import Foundation

let nativeMessageProtocolVersion = 1
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
    let postId: String
    let postUrl: String
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
    let taskId: UUID
    let disposition: EnqueueDisposition
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

    static func success(requestId: String, taskId: UUID, disposition: EnqueueDisposition) -> Self {
        Self(protocolVersion: nativeMessageProtocolVersion, requestId: requestId, ok: true, result: NativeMessageResult(taskId: taskId, disposition: disposition), error: nil)
    }

    static func failure(requestId: String, code: NativeMessageErrorCode, message: String) -> Self {
        Self(protocolVersion: nativeMessageProtocolVersion, requestId: requestId, ok: false, result: nil, error: NativeMessageError(code: code, message: message))
    }
}
