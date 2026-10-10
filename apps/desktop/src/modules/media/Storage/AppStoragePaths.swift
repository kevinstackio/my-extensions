import Foundation

struct AppStoragePaths {
    let thumbnailDirectory: URL
    let downloadDirectory: URL

    static var current: AppStoragePaths {
        AppStoragePaths(
            bundleIdentifier: Bundle.main.bundleIdentifier ?? "dev.linguio.exts",
            homeDirectory: FileManager.default.homeDirectoryForCurrentUser,
            applicationSupportDirectory: FileManager.default.urls(
                for: .applicationSupportDirectory,
                in: .userDomainMask
            )[0]
        )
    }

    init(bundleIdentifier: String, homeDirectory: URL, applicationSupportDirectory: URL) {
        // 正式版继续使用旧路径；开发身份独立存储，不迁移用户文件。
        let directoryName = bundleIdentifier == "dev.linguio.exts.dev" ? "Exts Dev" : "OhMy Photos"
        thumbnailDirectory = applicationSupportDirectory
            .appendingPathComponent(directoryName, isDirectory: true)
            .appendingPathComponent("Thumbnails", isDirectory: true)
        downloadDirectory = homeDirectory
            .appendingPathComponent("Downloads", isDirectory: true)
            .appendingPathComponent(directoryName, isDirectory: true)
    }
}
