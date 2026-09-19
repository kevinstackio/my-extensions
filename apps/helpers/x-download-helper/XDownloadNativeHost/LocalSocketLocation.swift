import Foundation

enum LocalSocketLocation {
    static var socketURL: URL {
        FileManager.default.urls(for: .applicationSupportDirectory, in: .userDomainMask)[0]
            .appendingPathComponent("XDownloadHelper", isDirectory: true)
            .appendingPathComponent("helper.sock")
    }
}
