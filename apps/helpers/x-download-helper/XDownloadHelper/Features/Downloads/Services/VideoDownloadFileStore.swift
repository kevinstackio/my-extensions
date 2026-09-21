import Foundation

struct VideoDownloadWorkspace: Equatable, Sendable {
    let directory: URL
    let receivedAt: Date
}

enum VideoFileStoreError: Error, Equatable {
    case missingOutput(String)
    case moveFailed(String)
}

struct VideoDownloadFileStore: @unchecked Sendable {
    private let fileManager: FileManager
    private let temporaryRoot: URL
    private let downloadDirectory: URL
    private let timeZone: TimeZone

    init(
        fileManager: FileManager = .default,
        temporaryRoot: URL = FileManager.default.temporaryDirectory,
        downloadDirectory: URL = FileManager.default.urls(for: .downloadsDirectory, in: .userDomainMask)[0]
            .appendingPathComponent("X Download", isDirectory: true),
        timeZone: TimeZone = .current
    ) {
        self.fileManager = fileManager
        self.temporaryRoot = temporaryRoot
        self.downloadDirectory = downloadDirectory
        self.timeZone = timeZone
    }

    func makeWorkspace(taskID: UUID, receivedAt: Date) throws -> VideoDownloadWorkspace {
        // 临时目录与 ~/Downloads/X Download/ 完全分离，未完成资源不会被用户误认为成品。
        let directory = temporaryRoot
            .appendingPathComponent("x-download", isDirectory: true)
            .appendingPathComponent(taskID.uuidString, isDirectory: true)
        try fileManager.createDirectory(at: directory, withIntermediateDirectories: true)
        return VideoDownloadWorkspace(directory: directory, receivedAt: receivedAt)
    }

    func moveToDownloadDirectory(files: [URL], receivedAt: Date) throws -> [URL] {
        // 只有成功产出的完整文件才进入最终目录；同名时递增命名，不覆盖用户已有文件。
        guard !files.isEmpty else { throw VideoFileStoreError.missingOutput("没有可移动的视频文件") }
        try fileManager.createDirectory(at: downloadDirectory, withIntermediateDirectories: true)
        let baseName = timestampBaseName(for: receivedAt)
        var movedFiles: [URL] = []
        var movedPairs: [(source: URL, destination: URL)] = []

        for (index, source) in files.enumerated() {
            guard fileManager.fileExists(atPath: source.path) else {
                throw VideoFileStoreError.missingOutput(source.lastPathComponent)
            }
            let suffix = files.count == 1 ? "" : String(format: "_%02d", index + 1)
            let destination = nextAvailableDestination(
                baseName: "\(baseName)\(suffix)",
                in: downloadDirectory
            )
            do {
                try fileManager.moveItem(at: source, to: destination)
            } catch {
                // 多视频移动中途失败时尽量回滚，避免桌面只留下部分成功文件。
                for pair in movedPairs.reversed() {
                    try? fileManager.moveItem(at: pair.destination, to: pair.source)
                }
                throw VideoFileStoreError.moveFailed(destination.lastPathComponent)
            }
            movedFiles.append(destination)
            movedPairs.append((source: source, destination: destination))
        }
        return movedFiles
    }

    func cleanupOrphanedWorkspaces() throws {
        // Helper 启动时清理专属根目录，覆盖崩溃、强制退出和断电留下的任务工作区。
        let workspaceRoot = temporaryRoot.appendingPathComponent("x-download", isDirectory: true)
        guard fileManager.fileExists(atPath: workspaceRoot.path) else { return }
        let entries = try fileManager.contentsOfDirectory(
            at: workspaceRoot,
            includingPropertiesForKeys: [.isDirectoryKey],
            options: [.skipsHiddenFiles]
        )
        for entry in entries {
            try fileManager.removeItem(at: entry)
        }
    }

    func cleanup(_ workspace: VideoDownloadWorkspace) {
        try? fileManager.removeItem(at: workspace.directory)
    }

    private func timestampBaseName(for date: Date) -> String {
        let formatter = DateFormatter()
        formatter.locale = Locale(identifier: "en_US_POSIX")
        formatter.timeZone = timeZone
        formatter.dateFormat = "'X_VIDEO_'yyyyMMdd_HHmmss"
        return formatter.string(from: date)
    }

    private func nextAvailableDestination(baseName: String, in directory: URL) -> URL {
        let initial = directory.appendingPathComponent("\(baseName).mp4")
        guard fileManager.fileExists(atPath: initial.path) else { return initial }

        var index = 1
        while true {
            let candidate = directory.appendingPathComponent("\(baseName)-\(index).mp4")
            if !fileManager.fileExists(atPath: candidate.path) { return candidate }
            index += 1
        }
    }
}
