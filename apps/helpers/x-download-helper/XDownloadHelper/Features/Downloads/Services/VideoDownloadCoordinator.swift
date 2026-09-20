import Foundation

@MainActor
final class VideoDownloadCoordinator {
    typealias StateSink = @MainActor @Sendable (UUID, DownloadTaskState) -> Void
    typealias RemoveSink = @MainActor @Sendable (UUID) -> Void

    private let runner: VideoProcessRunner
    private let fileStore: VideoDownloadFileStore
    private let updateState: StateSink
    private let removeTask: RemoveSink
    private var pendingTasks: [DownloadTask] = []
    private var activeTaskID: UUID?
    private var activeAddress: String?
    private var worker: Task<Void, Never>?

    init(
        runner: VideoProcessRunner,
        fileStore: VideoDownloadFileStore,
        updateState: @escaping StateSink,
        removeTask: @escaping RemoveSink
    ) {
        self.runner = runner
        self.fileStore = fileStore
        self.updateState = updateState
        self.removeTask = removeTask
    }

    func enqueue(_ task: DownloadTask) {
        // 活动任务和等待队列共同参与去重，完成或失败收尾后才释放地址。
        guard !pendingTasks.contains(where: { $0.normalizedAddress == task.normalizedAddress }),
              activeAddress != task.normalizedAddress else { return }
        pendingTasks.append(task)
        startNextIfNeeded()
    }

    func waitForIdle() async {
        while activeTaskID != nil || !pendingTasks.isEmpty {
            await Task.yield()
        }
    }

    private func startNextIfNeeded() {
        guard activeTaskID == nil, let task = pendingTasks.first else { return }
        pendingTasks.removeFirst()
        activeTaskID = task.id
        activeAddress = task.normalizedAddress
        worker = Task { [weak self] in
            await self?.run(task)
        }
    }

    private func run(_ task: DownloadTask) async {
        var workspace: VideoDownloadWorkspace?
        do {
            updateState(task.id, .parsing)
            let fileStore = self.fileStore
            let runner = self.runner
            let createdWorkspace = try await runOffMain {
                try fileStore.makeWorkspace(taskID: task.id, receivedAt: task.receivedAt)
            }
            workspace = createdWorkspace
            let post = try await runOffMain {
                try runner.parse(postURL: task.postURL)
            }
            var outputFiles: [URL] = []
            for (index, entry) in post.entries.enumerated() {
                let number = index + 1
                updateState(task.id, .downloading(index: number, total: post.entries.count))
                let fileStem = post.entries.count == 1 ? "video" : String(format: "video_%02d", number)
                let output = try await runOffMain {
                    try runner.download(
                        entry: entry,
                        outputDirectory: createdWorkspace.directory,
                        fileStem: fileStem
                    )
                }
                updateState(task.id, .merging(index: number, total: post.entries.count))
                outputFiles.append(output)
            }
            let files = outputFiles
            _ = try await runOffMain {
                try fileStore.moveToDesktop(files: files, receivedAt: task.receivedAt)
            }
            updateState(task.id, .completed)
            removeTask(task.id)
        } catch {
            updateState(task.id, .failed(failureMessage(for: error)))
        }

        if let workspace {
            let fileStore = self.fileStore
            try? await runOffMain {
                fileStore.cleanup(workspace)
            }
        }
        activeTaskID = nil
        activeAddress = nil
        worker = nil
        startNextIfNeeded()
    }

    private func runOffMain<T: Sendable>(
        _ operation: @escaping @Sendable () throws -> T
    ) async throws -> T {
        // Foundation Process 和文件系统操作是阻塞式的，移出主 Actor 以保持菜单栏界面响应。
        try await Task.detached(priority: nil, operation: operation).value
    }

    private func failureMessage(for error: Error) -> String {
        switch error {
        case let error as VideoProcessError:
            switch error {
            case let .launchFailed(tool):
                return "无法启动 \(tool)"
            case let .failed(_, message):
                return message.isEmpty ? "视频进程失败" : message.trimmingCharacters(in: .whitespacesAndNewlines)
            case let .missingOutput(url):
                return "未生成 \(url.lastPathComponent)"
            }
        case let error as VideoPostParseError:
            switch error {
            case .invalidJSON:
                return "解析结果无效"
            case .empty:
                return "帖子中没有视频"
            case .missingURL:
                return "视频地址缺失"
            }
        case let error as VideoFileStoreError:
            switch error {
            case let .missingOutput(name):
                return "未找到 \(name)"
            case let .moveFailed(name):
                return "无法移动 \(name) 到桌面"
            }
        default:
            return "下载失败"
        }
    }
}
