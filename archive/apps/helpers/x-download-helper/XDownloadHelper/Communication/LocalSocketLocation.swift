import Foundation

enum LocalSocketLocation {
    static let directoryName = "XDownloadHelper"
    static let socketFileName = "helper.sock"

    static var directoryURL: URL {
        FileManager.default.urls(for: .applicationSupportDirectory, in: .userDomainMask)[0]
            .appendingPathComponent(directoryName, isDirectory: true)
    }

    static var socketURL: URL {
        directoryURL.appendingPathComponent(socketFileName)
    }
}
