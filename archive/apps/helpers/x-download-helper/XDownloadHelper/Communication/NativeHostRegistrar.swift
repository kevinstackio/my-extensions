import Foundation

struct NativeHostRegistrar {
    let fileManager: FileManager
    let homeDirectory: URL
    let appBundleURL: URL

    init(
        fileManager: FileManager = .default,
        homeDirectory: URL = FileManager.default.homeDirectoryForCurrentUser,
        appBundleURL: URL = Bundle.main.bundleURL
    ) {
        self.fileManager = fileManager
        self.homeDirectory = homeDirectory
        self.appBundleURL = appBundleURL
    }

    func register() throws {
        let bridgeURL = appBundleURL.appendingPathComponent("Contents/Helpers/x-download-native-host")
        guard fileManager.isExecutableFile(atPath: bridgeURL.path) else {
            throw RegistrarError.bridgeMissing(bridgeURL)
        }

        let manifest = [
            "name": nativeMessageHostName,
            "description": "X Download macOS Helper Native Messaging Bridge",
            "path": bridgeURL.path,
            "type": "stdio",
            "allowed_origins": [NativeHostBridge.allowedDevelopmentOrigin],
        ] as [String: Any]
        let data = try JSONSerialization.data(withJSONObject: manifest, options: [.prettyPrinted, .sortedKeys])

        for browserDirectory in ["Google/Chrome", "Microsoft Edge"] {
            let directory = homeDirectory
                .appendingPathComponent("Library/Application Support")
                .appendingPathComponent(browserDirectory)
                .appendingPathComponent("NativeMessagingHosts", isDirectory: true)
            try fileManager.createDirectory(at: directory, withIntermediateDirectories: true)
            let destination = directory.appendingPathComponent("\(nativeMessageHostName).json")
            let temporary = destination.appendingPathExtension("tmp")
            try data.write(to: temporary, options: .atomic)
            if fileManager.fileExists(atPath: destination.path) {
                _ = try fileManager.replaceItemAt(destination, withItemAt: temporary)
            } else {
                try fileManager.moveItem(at: temporary, to: destination)
            }
        }
    }

    func unregister() throws {
        for browserDirectory in ["Google/Chrome", "Microsoft Edge"] {
            let manifest = homeDirectory
                .appendingPathComponent("Library/Application Support")
                .appendingPathComponent(browserDirectory)
                .appendingPathComponent("NativeMessagingHosts")
                .appendingPathComponent("\(nativeMessageHostName).json")
            if fileManager.fileExists(atPath: manifest.path) {
                try fileManager.removeItem(at: manifest)
            }
        }
    }
}

enum RegistrarError: Error {
    case bridgeMissing(URL)
}
