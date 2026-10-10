import Foundation

enum DestinationAccess {
    static func defaultDirectory() -> URL {
        AppStoragePaths.current.downloadDirectory
    }

    static func prepare(_ directory: URL) throws {
        try FileManager.default.createDirectory(
            at: directory,
            withIntermediateDirectories: true
        )
    }
}
