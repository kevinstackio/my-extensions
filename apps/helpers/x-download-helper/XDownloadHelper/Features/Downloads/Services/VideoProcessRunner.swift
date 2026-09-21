import Foundation

enum VideoProcessProgressKind: Sendable, Equatable {
    case video
    case audio
    case merging
}

struct VideoProcessProgress: Sendable, Equatable {
    let kind: VideoProcessProgressKind
    let fraction: Double
}

struct VideoProcessResult: Sendable, Equatable {
    let status: Int32
    let stdout: String
    let stderr: String
}

protocol VideoProcessExecuting: Sendable {
    func run(executable: URL, arguments: [String]) throws -> VideoProcessResult

    func run(
        executable: URL,
        arguments: [String],
        progress: @escaping @Sendable (VideoProcessProgress) -> Void
    ) throws -> VideoProcessResult
}

extension VideoProcessExecuting {
    func run(
        executable: URL,
        arguments: [String],
        progress: @escaping @Sendable (VideoProcessProgress) -> Void
    ) throws -> VideoProcessResult {
        _ = progress
        return try run(executable: executable, arguments: arguments)
    }
}

struct ProcessVideoProcessExecutor: VideoProcessExecuting, @unchecked Sendable {
    func run(executable: URL, arguments: [String]) throws -> VideoProcessResult {
        try run(executable: executable, arguments: arguments, progress: { _ in })
    }

    func run(
        executable: URL,
        arguments: [String],
        progress: @escaping @Sendable (VideoProcessProgress) -> Void
    ) throws -> VideoProcessResult {
        // 把标准输出和错误输出汇合到一个管道，保证下载期间可以持续解析进度，失败时仍保留完整诊断文本。
        let process = Process()
        let outputPipe = Pipe()
        process.executableURL = executable
        process.arguments = arguments
        process.standardOutput = outputPipe
        process.standardError = outputPipe

        do {
            try process.run()
        } catch {
            throw VideoProcessError.launchFailed(executable.lastPathComponent)
        }

        var output = Data()
        var progressBuffer = ""
        while true {
            let chunk = outputPipe.fileHandleForReading.availableData
            if chunk.isEmpty { break }
            output.append(chunk)
            emitProgress(from: chunk, buffer: &progressBuffer, progress: progress)
        }
        emitProgress(from: Data(), buffer: &progressBuffer, flush: true, progress: progress)
        process.waitUntilExit()

        let text = String(data: output, encoding: .utf8) ?? ""
        return VideoProcessResult(status: process.terminationStatus, stdout: text, stderr: text)
    }

    private func emitProgress(
        from data: Data,
        buffer: inout String,
        flush: Bool = false,
        progress: @escaping @Sendable (VideoProcessProgress) -> Void
    ) {
        if !data.isEmpty, let text = String(data: data, encoding: .utf8) {
            buffer.append(text)
        }
        var lines = buffer.components(separatedBy: CharacterSet.newlines)
        if flush {
            buffer = ""
        } else {
            guard lines.count > 1 else { return }
            buffer = lines.removeLast()
        }
        let percentPattern = try? NSRegularExpression(pattern: "([0-9]+(?:\\.[0-9]+)?)%")
        for line in lines {
            if line.lowercased().contains("merging formats") {
                // yt-dlp 的合并阶段通常没有可用的字节百分比，只发送阶段开始信号。
                progress(VideoProcessProgress(kind: .merging, fraction: 0))
                continue
            }
            guard let percentPattern,
                  let match = percentPattern.firstMatch(
                    in: line,
                    range: NSRange(line.startIndex..., in: line)
                  ),
                  let percentRange = Range(match.range(at: 1), in: line),
                  let percent = Double(line[percentRange]) else {
                continue
            }

            let normalized = min(max(percent / 100, 0), 1)
            progress(VideoProcessProgress(kind: isAudioLine(line) ? .audio : .video, fraction: normalized))
        }
    }

    private func isAudioLine(_ line: String) -> Bool {
        let normalized = line.lowercased()
        return normalized.contains("audio")
            || normalized.contains(".m4a")
            || normalized.contains(".aac")
            || normalized.contains(".opus")
    }
}

enum VideoProcessError: Error, Equatable {
    case launchFailed(String)
    case failed(status: Int32, message: String)
    case missingOutput(URL)
}

struct VideoProcessRunner: @unchecked Sendable {
    let tools: VideoToolPaths
    let executor: any VideoProcessExecuting

    init(tools: VideoToolPaths, executor: any VideoProcessExecuting = ProcessVideoProcessExecutor()) {
        self.tools = tools
        self.executor = executor
    }

    func download(
        source: VideoMediaSource,
        outputDirectory: URL,
        fileStem: String,
        progress: @escaping @Sendable (VideoProcessProgress) -> Void = { _ in }
    ) throws -> URL {
        // yt-dlp 的输入必须是扩展提供的媒体 URL；帖子 URL 解析已经移出本链路。
        let outputURL = outputDirectory.appendingPathComponent("\(fileStem).mp4")
        let outputTemplate = outputDirectory.appendingPathComponent("\(fileStem).%(ext)s").path
        let ffmpegDirectory = tools.ffmpeg.deletingLastPathComponent().path
        let arguments = [
            "--ignore-config", "--no-update", "--no-warnings", "--newline", "--no-playlist",
            "--progress-template", "download:%(progress._percent_str)s %(info.ext)s",
            "--format", "bestvideo*+bestaudio/best",
            "--merge-output-format", "mp4",
            "--ffmpeg-location", ffmpegDirectory,
            "--output", outputTemplate,
            source.url.absoluteString
        ]
        let result = try executor.run(executable: tools.ytDLP, arguments: arguments, progress: progress)
        guard result.status == 0 else {
            throw VideoProcessError.failed(status: result.status, message: result.stderr)
        }
        guard FileManager.default.fileExists(atPath: outputURL.path) else {
            throw VideoProcessError.missingOutput(outputURL)
        }
        return outputURL
    }
}
