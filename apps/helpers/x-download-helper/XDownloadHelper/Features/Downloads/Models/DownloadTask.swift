import Foundation

enum DownloadTaskState: Equatable, Sendable {
    case queued
    case parsing
    case downloading(index: Int, total: Int)
    case merging(index: Int, total: Int)
    case completed
    case failed(String)
}

extension DownloadTaskState {
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
    var state: DownloadTaskState

    init(
        id: UUID = UUID(),
        postId: String,
        postURL: URL,
        normalizedAddress: String? = nil,
        receivedAt: Date = Date(),
        state: DownloadTaskState = .queued
    ) {
        self.id = id
        self.postId = postId
        self.postURL = postURL
        self.normalizedAddress = normalizedAddress ?? postURL.absoluteString
        self.receivedAt = receivedAt
        self.state = state
    }
}
