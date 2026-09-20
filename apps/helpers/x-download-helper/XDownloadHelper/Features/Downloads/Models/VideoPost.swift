import Foundation

struct VideoPost: Equatable, Sendable {
    let entries: [VideoPostEntry]
}

struct VideoPostEntry: Equatable, Sendable {
    let url: URL
    let sourceType: VideoMediaSourceType?

    init(url: URL, sourceType: VideoMediaSourceType? = nil) {
        self.url = url
        self.sourceType = sourceType
    }
}

enum VideoPostParseError: Error, Equatable {
    case invalidJSON
    case empty
    case missingURL
}
