import Foundation

enum DownloadTaskState: Equatable {
    case received
}

struct DownloadTask: Identifiable, Equatable {
    let id: UUID
    let postId: String
    let postURL: URL
    var state: DownloadTaskState

    init(
        id: UUID = UUID(),
        postId: String,
        postURL: URL,
        state: DownloadTaskState = .received
    ) {
        self.id = id
        self.postId = postId
        self.postURL = postURL
        self.state = state
    }
}
