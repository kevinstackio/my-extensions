import Foundation

struct VideoToolPaths: Equatable, Sendable {
    let ytDLP: URL
    let ffmpeg: URL
}

protocol VideoToolValidating {
    func validatedTools(in bundleURL: URL) throws -> VideoToolPaths
}
