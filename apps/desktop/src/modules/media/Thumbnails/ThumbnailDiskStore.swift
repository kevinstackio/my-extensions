import Foundation

final class ThumbnailDiskStore {
    private let rootURL: URL

    init(rootURL: URL? = nil) throws {
        self.rootURL = rootURL ?? AppStoragePaths.current.thumbnailDirectory
        try FileManager.default.createDirectory(
            at: self.rootURL,
            withIntermediateDirectories: true
        )
    }

    func data(for id: String) throws -> Data? {
        let url = fileURL(for: id)
        guard FileManager.default.fileExists(atPath: url.path) else { return nil }
        return try Data(contentsOf: url)
    }

    func save(_ data: Data, for id: String) throws {
        let destination = fileURL(for: id)
        let temporary = rootURL.appendingPathComponent(".\(destination.lastPathComponent).\(UUID().uuidString).tmp")
        defer { try? FileManager.default.removeItem(at: temporary) }

        try data.write(to: temporary, options: .atomic)
        if FileManager.default.fileExists(atPath: destination.path) {
            try FileManager.default.removeItem(at: destination)
        }
        try FileManager.default.moveItem(at: temporary, to: destination)
    }

    func remove(for id: String) throws {
        let url = fileURL(for: id)
        guard FileManager.default.fileExists(atPath: url.path) else { return }
        try FileManager.default.removeItem(at: url)
    }

    private func fileURL(for id: String) -> URL {
        let encoded = Data(id.utf8)
            .base64EncodedString()
            .replacingOccurrences(of: "/", with: "_")
            .replacingOccurrences(of: "+", with: "-")
        return rootURL.appendingPathComponent(encoded).appendingPathExtension("thumb")
    }
}
