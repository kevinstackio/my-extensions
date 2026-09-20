import Foundation

struct VideoProcessResult: Sendable, Equatable {
    let status: Int32
    let stdout: String
    let stderr: String
}

protocol VideoProcessExecuting: Sendable {
    func run(executable: URL, arguments: [String]) throws -> VideoProcessResult
}

struct ProcessVideoProcessExecutor: VideoProcessExecuting, @unchecked Sendable {
    func run(executable: URL, arguments: [String]) throws -> VideoProcessResult {
        // 始终通过可执行文件和参数数组启动固定工具，避免经过 Shell 解释用户输入。
        let process = Process()
        let stdoutPipe = Pipe()
        let stderrPipe = Pipe()
        process.executableURL = executable
        process.arguments = arguments
        process.standardOutput = stdoutPipe
        process.standardError = stderrPipe

        do {
            try process.run()
        } catch {
            throw VideoProcessError.launchFailed(executable.lastPathComponent)
        }
        process.waitUntilExit()

        return VideoProcessResult(
            status: process.terminationStatus,
            stdout: String(data: stdoutPipe.fileHandleForReading.readDataToEndOfFile(), encoding: .utf8) ?? "",
            stderr: String(data: stderrPipe.fileHandleForReading.readDataToEndOfFile(), encoding: .utf8) ?? ""
        )
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
    private let parser: VideoPostParser

    init(tools: VideoToolPaths, executor: any VideoProcessExecuting = ProcessVideoProcessExecutor()) {
        self.tools = tools
        self.executor = executor
        self.parser = VideoPostParser()
    }

    func parse(postURL: URL) throws -> VideoPost {
        let arguments = [
            "--ignore-config", "--no-update", "--no-warnings",
            "--dump-single-json", "--skip-download",
            postURL.absoluteString
        ]
        let result = try executor.run(
            executable: tools.ytDLP,
            arguments: arguments
        )
        guard result.status == 0 else {
            throw VideoProcessError.failed(status: result.status, message: result.stderr)
        }
        return try parser.parse(output: result.stdout)
    }

    func download(
        entry: VideoPostEntry,
        outputDirectory: URL,
        fileStem: String
    ) throws -> URL {
        let outputURL = outputDirectory.appendingPathComponent("\(fileStem).mp4")
        let outputTemplate = outputDirectory.appendingPathComponent("\(fileStem).%(ext)s").path
        let ffmpegDirectory = tools.ffmpeg.deletingLastPathComponent().path
        let arguments = [
            "--ignore-config", "--no-update", "--no-warnings", "--newline", "--no-playlist",
            "--format", "bestvideo*+bestaudio/best",
            "--merge-output-format", "mp4",
            "--ffmpeg-location", ffmpegDirectory,
            "--output", outputTemplate,
            entry.url.absoluteString
        ]
        let result = try executor.run(
            executable: tools.ytDLP,
            arguments: arguments
        )
        guard result.status == 0 else {
            throw VideoProcessError.failed(status: result.status, message: result.stderr)
        }
        return outputURL
    }
}
