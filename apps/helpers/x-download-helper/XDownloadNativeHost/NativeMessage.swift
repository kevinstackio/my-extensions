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

struct NativeMessagePayload: Codable { let postId: String; let postUrl: String }
struct NativeMessageRequest: Codable { let protocolVersion: Int; let requestId: String; let type: String; let payload: NativeMessagePayload }
enum EnqueueDisposition: String, Codable { case created; case existing }
struct NativeMessageResult: Codable { let taskId: UUID; let disposition: EnqueueDisposition }
struct NativeMessageError: Codable { let code: NativeMessageErrorCode; let message: String }
struct NativeMessageResponse: Codable {
    let protocolVersion: Int
    let requestId: String
    let ok: Bool
    let result: NativeMessageResult?
    let error: NativeMessageError?
    static func failure(requestId: String, code: NativeMessageErrorCode, message: String) -> Self {
        Self(protocolVersion: nativeMessageProtocolVersion, requestId: requestId, ok: false, result: nil, error: NativeMessageError(code: code, message: message))
    }
}
