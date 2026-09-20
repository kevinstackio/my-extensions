import Foundation

let nativeMessageProtocolVersion = 2
let supportedNativeMessageProtocolVersions: Set<Int> = [1, 2]
let nativeMessageHostName = "dev.kevinstack.xdownloadhelper.nativehost"

enum NativeMessageErrorCode: String, Codable {
    case invalidRequest = "INVALID_REQUEST"
    case unsupportedProtocol = "UNSUPPORTED_PROTOCOL"
    case unsupportedMessage = "UNSUPPORTED_MESSAGE"
    case helperStartTimeout = "HELPER_START_TIMEOUT"
    case helperUnavailable = "HELPER_UNAVAILABLE"
    case internalError = "INTERNAL_ERROR"
}

enum VideoMediaSourceType: String, Codable { case hls; case dash; case mp4 }
struct VideoMediaSource: Codable {
    let mediaID: String
    let type: VideoMediaSourceType
    let url: URL

    enum CodingKeys: String, CodingKey {
        case mediaID = "mediaId"
        case type
        case url
    }
}
struct NativeMessagePayload: Codable {
    let postId: String
    let postUrl: String
    let mediaSources: [VideoMediaSource]?
}
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
    static func failure(requestId: String, protocolVersion: Int, code: NativeMessageErrorCode, message: String) -> Self {
        Self(protocolVersion: protocolVersion, requestId: requestId, ok: false, result: nil, error: NativeMessageError(code: code, message: message))
    }
}
