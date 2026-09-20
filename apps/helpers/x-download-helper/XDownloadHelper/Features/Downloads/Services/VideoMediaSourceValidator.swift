import Foundation

enum VideoMediaSourceValidationError: Error, Equatable {
    case emptyMediaID
    case duplicateMediaID(String)
    case invalidURL(String)
    case invalidHost(String)
    case invalidType(String)
}

enum VideoMediaSourceValidator {
    static func validate(_ sources: [VideoMediaSource]) throws -> [VideoMediaSource] {
        var mediaIDs = Set<String>()
        for source in sources {
            guard !source.mediaID.isEmpty else {
                throw VideoMediaSourceValidationError.emptyMediaID
            }
            guard mediaIDs.insert(source.mediaID).inserted else {
                throw VideoMediaSourceValidationError.duplicateMediaID(source.mediaID)
            }
            guard source.url.scheme?.lowercased() == "https" else {
                throw VideoMediaSourceValidationError.invalidURL(source.url.absoluteString)
            }
            guard source.url.host?.lowercased() == "video.twimg.com" else {
                throw VideoMediaSourceValidationError.invalidHost(source.url.absoluteString)
            }
            guard !source.url.path.lowercased().hasSuffix(".m4s") else {
                throw VideoMediaSourceValidationError.invalidType(source.url.absoluteString)
            }
            guard matchesType(source.type, path: source.url.path) else {
                throw VideoMediaSourceValidationError.invalidType(source.url.absoluteString)
            }
        }
        return sources
    }

    private static func matchesType(_ type: VideoMediaSourceType, path: String) -> Bool {
        let path = path.lowercased()
        switch type {
        case .hls:
            return path.hasSuffix(".m3u8")
        case .dash:
            return path.hasSuffix(".mpd")
        case .mp4:
            return path.hasSuffix(".mp4")
        }
    }
}
