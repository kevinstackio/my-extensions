import XCTest

@testable import XDownloadHelper

final class VideoProcessRunnerTests: XCTestCase {
    func testDownloadUsesHighestQualityMergeAndTempOutput() throws {
        let executor = RecordingVideoProcessExecutor(result: .init(status: 0, stdout: "", stderr: ""))
        let tools = VideoToolPaths(
            ytDLP: URL(fileURLWithPath: "/bundle/Contents/Resources/Tools/yt-dlp"),
            ffmpeg: URL(fileURLWithPath: "/bundle/Contents/Resources/Tools/ffmpeg")
        )
        let runner = VideoProcessRunner(tools: tools, executor: executor)
        let directory = URL(fileURLWithPath: "/tmp/x-download-task")
        let source = VideoMediaSource(
            mediaID: "video-1",
            type: .mp4,
            url: URL(string: "https://video.twimg.com/video.mp4")!
        )

        let output = try runner.download(source: source, outputDirectory: directory, fileStem: "video-01")

        XCTAssertEqual(output, directory.appendingPathComponent("video-01.mp4"))
        XCTAssertEqual(executor.calls.count, 1)
        XCTAssertEqual(executor.calls[0].executable, tools.ytDLP)
        XCTAssertEqual(executor.calls[0].arguments, [
            "--ignore-config", "--no-update", "--no-warnings", "--newline", "--no-playlist",
            "--progress-template", "download:%(progress._percent_str)s %(info.ext)s",
            "--format", "bestvideo*+bestaudio/best",
            "--merge-output-format", "mp4",
            "--ffmpeg-location", "/bundle/Contents/Resources/Tools",
            "--output", "/tmp/x-download-task/video-01.%(ext)s",
            "https://video.twimg.com/video.mp4"
        ])
    }

    func testDownloadForwardsVideoAudioAndMergeProgressEvents() throws {
        let executor = RecordingVideoProcessExecutor(
            result: .init(status: 0, stdout: "", stderr: ""),
            progressEvents: [
                VideoProcessProgress(kind: .video, fraction: 0.25),
                VideoProcessProgress(kind: .audio, fraction: 0.5),
                VideoProcessProgress(kind: .merging, fraction: 0),
            ]
        )
        let tools = VideoToolPaths(
            ytDLP: URL(fileURLWithPath: "/bundle/Contents/Resources/Tools/yt-dlp"),
            ffmpeg: URL(fileURLWithPath: "/bundle/Contents/Resources/Tools/ffmpeg")
        )
        let runner = VideoProcessRunner(tools: tools, executor: executor)
        var events: [VideoProcessProgress] = []

        _ = try runner.download(
            source: VideoMediaSource(mediaID: "video-1", type: .dash, url: URL(string: "https://video.twimg.com/video.mpd")!),
            outputDirectory: URL(fileURLWithPath: "/tmp/x-download-task"),
            fileStem: "video-01",
            progress: { events.append($0) }
        )

        XCTAssertEqual(events, executor.progressEvents)
    }

}

private final class RecordingVideoProcessExecutor: VideoProcessExecuting, @unchecked Sendable {
    struct Call {
        let executable: URL
        let arguments: [String]
    }

    private(set) var calls: [Call] = []
    let result: VideoProcessResult
    let progressEvents: [VideoProcessProgress]

    init(result: VideoProcessResult, progressEvents: [VideoProcessProgress] = []) {
        self.result = result
        self.progressEvents = progressEvents
    }

    func run(executable: URL, arguments: [String]) throws -> VideoProcessResult {
        calls.append(Call(executable: executable, arguments: arguments))
        if let outputIndex = arguments.firstIndex(of: "--output") {
            let template = arguments[outputIndex + 1]
            let output = URL(fileURLWithPath: template.replacingOccurrences(of: ".%(ext)s", with: ".mp4"))
            try FileManager.default.createDirectory(at: output.deletingLastPathComponent(), withIntermediateDirectories: true)
            try Data("video".utf8).write(to: output)
        }
        return result
    }

    func run(
        executable: URL,
        arguments: [String],
        progress: @escaping @Sendable (VideoProcessProgress) -> Void
    ) throws -> VideoProcessResult {
        let result = try run(executable: executable, arguments: arguments)
        progressEvents.forEach(progress)
        return result
    }
}
