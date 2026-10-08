import Foundation

enum DownloadTaskState: Equatable, Sendable {
    case queued
    case preparing
    case downloadingVideo(index: Int, total: Int, progress: Double, overall: Double)
    case downloadingAudio(index: Int, total: Int, progress: Double, overall: Double)
    case merging(index: Int, total: Int, progress: Double, overall: Double)
    case saving(progress: Double, overall: Double)
    case completed
    case failed(String)
}

extension DownloadTaskState {
    var stepProgress: Double? {
        switch self {
        case let .downloadingVideo(_, _, progress, _),
             let .downloadingAudio(_, _, progress, _),
             let .merging(_, _, progress, _),
             let .saving(progress, _):
            return progress
        case .queued, .preparing, .completed, .failed:
            return nil
        }
    }

    var overallProgress: Double? {
        // 总进度按视频、音频、合并阶段估算，目标是连续反馈任务状态，不伪装成精确字节百分比。
        switch self {
        case let .downloadingVideo(_, _, _, overall),
             let .downloadingAudio(_, _, _, overall),
             let .merging(_, _, _, overall),
             let .saving(_, overall):
            return overall
        case .completed:
            return 1
        case .queued, .preparing, .failed:
            return nil
        }
    }

    var displayTitle: String {
        switch self {
        case .queued:
            return "等待中"
        case .preparing:
            return "准备中"
        case let .downloadingVideo(index, total, _, _):
            return total > 1 ? "下载视频 \(index)/\(total)" : "下载视频"
        case let .downloadingAudio(index, total, _, _):
            return total > 1 ? "下载音频 \(index)/\(total)" : "下载音频"
        case let .merging(index, total, _, _):
            return total > 1 ? "合并音视频 \(index)/\(total)" : "合并音视频"
        case .saving:
            return "保存到下载目录"
        case .completed:
            return "已完成"
        case .failed:
            return "失败"
        }
    }

    var failureMessage: String? {
        guard case let .failed(message) = self else { return nil }
        return message
    }
}

struct DownloadTask: Identifiable, Equatable, Sendable {
    let id: UUID
    let postId: String
    let postURL: URL
    let normalizedAddress: String
    let receivedAt: Date
    var mediaSources: [VideoMediaSource]
    var state: DownloadTaskState

    init(
        id: UUID = UUID(),
        postId: String,
        postURL: URL,
        normalizedAddress: String? = nil,
        receivedAt: Date = Date(),
        mediaSources: [VideoMediaSource],
        state: DownloadTaskState = .queued
    ) {
        self.id = id
        self.postId = postId
        self.postURL = postURL
        self.normalizedAddress = normalizedAddress ?? postURL.absoluteString
        self.receivedAt = receivedAt
        self.mediaSources = mediaSources
        self.state = state
    }
}
