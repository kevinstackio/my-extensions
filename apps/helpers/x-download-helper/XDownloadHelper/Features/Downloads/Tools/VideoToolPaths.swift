import Foundation

struct VideoToolPaths: Equatable {
    let ytDLP: URL
    let ffmpeg: URL
}

protocol VideoToolValidating {
    func validatedTools(in bundleURL: URL) throws -> VideoToolPaths
}
