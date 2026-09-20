import Foundation

enum VideoMediaSourceType: String, Codable, Equatable, Sendable {
    case hls
    case dash
    case mp4
}

struct VideoMediaSource: Codable, Equatable, Sendable {
    let mediaID: String
    let type: VideoMediaSourceType
    let url: URL

    enum CodingKeys: String, CodingKey {
        case mediaID = "mediaId"
        case type
        case url
    }
}
