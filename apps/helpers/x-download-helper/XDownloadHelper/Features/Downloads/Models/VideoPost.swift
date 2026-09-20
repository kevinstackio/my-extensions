import Foundation

struct VideoPost: Equatable, Sendable {
    let entries: [VideoPostEntry]
}

struct VideoPostEntry: Equatable, Sendable {
    let url: URL
}

enum VideoPostParseError: Error, Equatable {
    case invalidJSON
    case empty
    case missingURL
}
