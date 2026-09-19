import Foundation

enum DownloadTaskState: Equatable {
    case ready
    case downloading
}

struct DownloadTask: Identifiable, Equatable {
    let id: UUID
    let fileName: String
    let displayPath: String
    var progress: Double
    var state: DownloadTaskState

    init(
        id: UUID = UUID(),
        fileName: String,
        displayPath: String? = nil,
        progress: Double = 0,
        state: DownloadTaskState = .ready
    ) {
        self.id = id
        self.fileName = fileName
        self.displayPath = displayPath ?? "~/Desktop/\(fileName)"
        self.progress = progress
        self.state = state
    }

    static let samples = [
        DownloadTask(fileName: "X_VIDEO_20260919_142345_01.mp4"),
        DownloadTask(fileName: "X_VIDEO_20260919_142345_02.mp4"),
        DownloadTask(fileName: "X_VIDEO_20260919_142345_03.mp4")
    ]
}
