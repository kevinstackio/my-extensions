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

    private enum DirectSourceError: Error {
        case failed(index: Int, total: Int, type: VideoMediaSourceType, message: String)
    }

    private enum ProgressPhase {
        case video
        case audio
        case merging
    }

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
            guard !task.mediaSources.isEmpty else {
                throw VideoProcessError.failed(status: -1, message: "视频来源不能为空")
            }

            // 任务先在临时工作区完成，只有全部媒体成功后才移动到用户下载目录。
            updateState(task.id, .preparing)
            let fileStore = self.fileStore
            let createdWorkspace = try await runOffMain {
                try fileStore.makeWorkspace(taskID: task.id, receivedAt: task.receivedAt)
            }
            workspace = createdWorkspace

            var outputFiles: [URL] = []
            for (index, source) in task.mediaSources.enumerated() {
                let number = index + 1
                let fileStem = task.mediaSources.count == 1 ? "video" : String(format: "video_%02d", number)
                var latestOverall = overallProgress(
                    mediaIndex: index,
                    total: task.mediaSources.count,
                    phase: .video,
                    fraction: 0
                )
                updateState(task.id, .downloadingVideo(
                    index: number,
                    total: task.mediaSources.count,
                    progress: 0,
                    overall: latestOverall
                ))

                let (progressStream, progressContinuation) = AsyncStream.makeStream(of: VideoProcessProgress.self)
                let runner = self.runner
                let createdWorkspace = createdWorkspace
                // 多视频任务串行执行，避免同时争抢 yt-dlp/FFmpeg 和临时文件名。
                let processTask = Task.detached(priority: nil) {
                    defer { progressContinuation.finish() }
                    return try runner.download(
                        source: source,
                        outputDirectory: createdWorkspace.directory,
                        fileStem: fileStem,
                        progress: { progressContinuation.yield($0) }
                    )
                }

                for await event in progressStream {
                    let phase: ProgressPhase
                    switch event.kind {
                    case .video:
                        phase = .video
                    case .audio:
                        phase = .audio
                    case .merging:
                        phase = .merging
                    }
                    let stateProgress = min(max(event.fraction, 0), 1)
                    latestOverall = max(
                        latestOverall,
                        overallProgress(
                            mediaIndex: index,
                            total: task.mediaSources.count,
                            phase: phase,
                            fraction: stateProgress
                        )
                    )
                    switch event.kind {
                    case .video:
                        updateState(task.id, .downloadingVideo(
                            index: number,
                            total: task.mediaSources.count,
                            progress: stateProgress,
                            overall: latestOverall
                        ))
                    case .audio:
                        updateState(task.id, .downloadingAudio(
                            index: number,
                            total: task.mediaSources.count,
                            progress: stateProgress,
                            overall: latestOverall
                        ))
                    case .merging:
                        updateState(task.id, .merging(
                            index: number,
                            total: task.mediaSources.count,
                            progress: stateProgress,
                            overall: latestOverall
                        ))
                    }
                }

                let output: URL
                do {
                    output = try await processTask.value
                } catch {
                    throw DirectSourceError.failed(
                        index: number,
                        total: task.mediaSources.count,
                        type: source.type,
                        message: directSourceFailureMessage(for: error)
                    )
                }

                let mergeStart = max(latestOverall, overallProgress(
                    mediaIndex: index,
                    total: task.mediaSources.count,
                    phase: .merging,
                    fraction: 0
                ))
                updateState(task.id, .merging(
                    index: number,
                    total: task.mediaSources.count,
                    progress: 0,
                    overall: mergeStart
                ))
                updateState(task.id, .merging(
                    index: number,
                    total: task.mediaSources.count,
                    progress: 1,
                    overall: overallProgress(
                        mediaIndex: index,
                        total: task.mediaSources.count,
                        phase: .merging,
                        fraction: 1
                    )
                ))
                outputFiles.append(output)
            }

            // 保存是最后一步；最终目录不会出现下载中的 .part 或合并中间文件。
            updateState(task.id, .saving(progress: 0, overall: 1))
            let files = outputFiles
            _ = try await runOffMain {
                try fileStore.moveToDownloadDirectory(files: files, receivedAt: task.receivedAt)
            }
            updateState(task.id, .saving(progress: 1, overall: 1))
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

    private func overallProgress(
        mediaIndex: Int,
        total: Int,
        phase: ProgressPhase,
        fraction: Double
    ) -> Double {
        let phaseStart: Double
        let phaseWeight: Double
        switch phase {
        case .video:
            phaseStart = 0
            phaseWeight = 0.4
        case .audio:
            phaseStart = 0.4
            phaseWeight = 0.4
        case .merging:
            phaseStart = 0.8
            phaseWeight = 0.2
        }
        let itemProgress = phaseStart + min(max(fraction, 0), 1) * phaseWeight
        return min(max((Double(mediaIndex) + itemProgress) / Double(max(total, 1)), 0), 1)
    }

    private func runOffMain<T: Sendable>(
        _ operation: @escaping @Sendable () throws -> T
    ) async throws -> T {
        // Foundation Process 和文件系统操作是阻塞式的，移出主 Actor 以保持菜单栏界面响应。
        try await Task.detached(priority: nil, operation: operation).value
    }

    private func failureMessage(for error: Error) -> String {
        switch error {
        case let DirectSourceError.failed(index, total, type, message):
            return "直链视频 \(index)/\(total)（\(type.rawValue)）下载失败\n\(message)"
        case let error as VideoProcessError:
            switch error {
            case let .launchFailed(tool):
                return "无法启动 \(tool)"
            case let .failed(_, message):
                return message.isEmpty ? "视频进程失败" : message.trimmingCharacters(in: .whitespacesAndNewlines)
            case let .missingOutput(url):
                return "未生成 \(url.lastPathComponent)"
            }
        case let error as VideoFileStoreError:
            switch error {
            case let .missingOutput(name):
                return "未找到 \(name)"
            case let .moveFailed(name):
                return "无法移动 \(name) 到下载目录"
            }
        default:
            return "下载失败"
        }
    }

    private func directSourceFailureMessage(for error: Error) -> String {
        switch error {
        case let error as VideoProcessError:
            switch error {
            case let .launchFailed(tool):
                return "无法启动 \(tool)"
            case let .failed(status, message):
                let detail = message.trimmingCharacters(in: .whitespacesAndNewlines)
                return "exitCode=\(status)\n\(detail.isEmpty ? "视频进程失败" : detail)"
            case let .missingOutput(url):
                return "未生成 \(url.lastPathComponent)"
            }
        default:
            return failureMessage(for: error)
        }
    }
}
