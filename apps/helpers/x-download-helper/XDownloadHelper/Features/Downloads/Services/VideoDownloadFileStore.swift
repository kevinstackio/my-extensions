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
    private let desktopDirectory: URL
    private let timeZone: TimeZone

    init(
        fileManager: FileManager = .default,
        temporaryRoot: URL = FileManager.default.temporaryDirectory,
        desktopDirectory: URL = FileManager.default.urls(for: .desktopDirectory, in: .userDomainMask)[0],
        timeZone: TimeZone = .current
    ) {
        self.fileManager = fileManager
        self.temporaryRoot = temporaryRoot
        self.desktopDirectory = desktopDirectory
        self.timeZone = timeZone
    }

    func makeWorkspace(taskID: UUID, receivedAt: Date) throws -> VideoDownloadWorkspace {
        let directory = temporaryRoot.appendingPathComponent("x-download-\(taskID.uuidString)", isDirectory: true)
        try fileManager.createDirectory(at: directory, withIntermediateDirectories: true)
        return VideoDownloadWorkspace(directory: directory, receivedAt: receivedAt)
    }

    func moveToDesktop(files: [URL], receivedAt: Date) throws -> [URL] {
        guard !files.isEmpty else { throw VideoFileStoreError.missingOutput("没有可移动的视频文件") }
        try fileManager.createDirectory(at: desktopDirectory, withIntermediateDirectories: true)
        let baseName = timestampBaseName(for: receivedAt)
        var movedFiles: [URL] = []
        var movedPairs: [(source: URL, destination: URL)] = []

        for (index, source) in files.enumerated() {
            guard fileManager.fileExists(atPath: source.path) else {
                throw VideoFileStoreError.missingOutput(source.lastPathComponent)
            }
            let suffix = files.count == 1 ? "" : String(format: "_%02d", index + 1)
            let destination = desktopDirectory.appendingPathComponent("\(baseName)\(suffix).mp4")
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
}
