import Foundation

typealias VideoToolProcess = (_ executable: URL, _ arguments: [String]) throws -> (status: Int32, stdout: String, stderr: String)

enum VideoToolError: Error, Equatable {
    case missing(String)
    case notExecutable(String)
    case outsideBundle(String)
    case launchFailed(String)
    case versionMismatch(tool: String, expected: String, actual: String)
}

struct VideoToolValidator: VideoToolValidating {
    private static let expectedYtDLPVersion = "2026.08.19"
    private static let expectedFFmpegVersion = "9.0.2"

    private let processRunner: VideoToolProcess
    private let fileManager: FileManager

    init(
        fileManager: FileManager = .default,
        processRunner: @escaping VideoToolProcess = VideoToolValidator.runProcess
    ) {
        self.fileManager = fileManager
        self.processRunner = processRunner
    }

    func validatedTools(in bundleURL: URL) throws -> VideoToolPaths {
        let ytDLP = try validatedExecutable(named: "yt-dlp", in: bundleURL)
        let ffmpeg = try validatedExecutable(named: "ffmpeg", in: bundleURL)

        try validateVersion(
            tool: "yt-dlp",
            executable: ytDLP,
            arguments: ["--ignore-config", "--no-update", "--version"],
            expected: Self.expectedYtDLPVersion,
            exact: true
        )
        try validateVersion(
            tool: "ffmpeg",
            executable: ffmpeg,
            arguments: ["-version"],
            expected: Self.expectedFFmpegVersion,
            exact: false
        )

        return VideoToolPaths(ytDLP: ytDLP, ffmpeg: ffmpeg)
    }

    private func validatedExecutable(named name: String, in bundleURL: URL) throws -> URL {
        let bundleRoot = bundleURL.standardizedFileURL.resolvingSymlinksInPath()
        let candidate = bundleURL
            .appendingPathComponent("Contents/Resources/Tools")
            .appendingPathComponent(name)
            .standardizedFileURL
            .resolvingSymlinksInPath()
        let rootPath = bundleRoot.path.hasSuffix("/") ? bundleRoot.path : bundleRoot.path + "/"

        guard candidate.path.hasPrefix(rootPath) else {
            throw VideoToolError.outsideBundle(name)
        }
        guard fileManager.fileExists(atPath: candidate.path) else {
            throw VideoToolError.missing(name)
        }
        guard fileManager.isExecutableFile(atPath: candidate.path) else {
            throw VideoToolError.notExecutable(name)
        }
        return candidate
    }

    private func validateVersion(
        tool: String,
        executable: URL,
        arguments: [String],
        expected: String,
        exact: Bool
    ) throws {
        let result: (status: Int32, stdout: String, stderr: String)
        do {
            result = try processRunner(executable, arguments)
        } catch {
            throw VideoToolError.launchFailed(tool)
        }

        guard result.status == 0 else {
            throw VideoToolError.launchFailed(tool)
        }
        guard let actual = firstOutputLine(result.stdout) else {
            throw VideoToolError.launchFailed(tool)
        }

        let matches = exact ? actual == expected : actual.contains("version \(expected)")
        guard matches else {
            throw VideoToolError.versionMismatch(tool: tool, expected: expected, actual: actual)
        }
    }

    private func firstOutputLine(_ output: String) -> String? {
        output
            .split(whereSeparator: \.isNewline)
            .map { $0.trimmingCharacters(in: .whitespacesAndNewlines) }
            .first { !$0.isEmpty }
    }

    private static func runProcess(
        executable: URL,
        arguments: [String]
    ) throws -> (status: Int32, stdout: String, stderr: String) {
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
            throw VideoToolError.launchFailed(executable.lastPathComponent)
        }
        process.waitUntilExit()

        let stdout = String(data: stdoutPipe.fileHandleForReading.readDataToEndOfFile(), encoding: .utf8) ?? ""
        let stderr = String(data: stderrPipe.fileHandleForReading.readDataToEndOfFile(), encoding: .utf8) ?? ""
        return (process.terminationStatus, stdout, stderr)
    }
}
