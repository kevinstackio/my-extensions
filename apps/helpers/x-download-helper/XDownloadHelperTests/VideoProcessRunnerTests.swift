import XCTest

@testable import XDownloadHelper

final class VideoProcessRunnerTests: XCTestCase {
    func testParseUsesBundledToolAndFixedArguments() throws {
        let executor = RecordingVideoProcessExecutor(result: .init(status: 0, stdout: #"{"webpage_url":"https://x.com/user/status/123"}"#, stderr: ""))
        let tools = VideoToolPaths(
            ytDLP: URL(fileURLWithPath: "/bundle/Contents/Resources/Tools/yt-dlp"),
            ffmpeg: URL(fileURLWithPath: "/bundle/Contents/Resources/Tools/ffmpeg")
        )
        let runner = VideoProcessRunner(tools: tools, executor: executor)

        _ = try runner.parse(postURL: URL(string: "https://x.com/user/status/123")!)

        XCTAssertEqual(executor.calls.count, 1)
        XCTAssertEqual(executor.calls[0].executable, tools.ytDLP)
        XCTAssertEqual(executor.calls[0].arguments, [
            "--ignore-config", "--no-update", "--no-warnings",
            "--dump-single-json", "--skip-download",
            "https://x.com/user/status/123"
        ])
    }

    func testDownloadUsesHighestQualityMergeAndTempOutput() throws {
        let executor = RecordingVideoProcessExecutor(result: .init(status: 0, stdout: "", stderr: ""))
        let tools = VideoToolPaths(
            ytDLP: URL(fileURLWithPath: "/bundle/Contents/Resources/Tools/yt-dlp"),
            ffmpeg: URL(fileURLWithPath: "/bundle/Contents/Resources/Tools/ffmpeg")
        )
        let runner = VideoProcessRunner(tools: tools, executor: executor)
        let directory = URL(fileURLWithPath: "/tmp/x-download-task")
        let entry = VideoPostEntry(url: URL(string: "https://x.com/user/status/123/1")!)

        let output = try runner.download(entry: entry, outputDirectory: directory, fileStem: "video-01")

        XCTAssertEqual(output, directory.appendingPathComponent("video-01.mp4"))
        XCTAssertEqual(executor.calls.count, 1)
        XCTAssertEqual(executor.calls[0].executable, tools.ytDLP)
        XCTAssertEqual(executor.calls[0].arguments, [
            "--ignore-config", "--no-update", "--no-warnings", "--newline", "--no-playlist",
            "--format", "bestvideo*+bestaudio/best",
            "--merge-output-format", "mp4",
            "--ffmpeg-location", "/bundle/Contents/Resources/Tools",
            "--output", "/tmp/x-download-task/video-01.%(ext)s",
            "https://x.com/user/status/123/1"
        ])
    }

}

private final class RecordingVideoProcessExecutor: VideoProcessExecuting, @unchecked Sendable {
    struct Call {
        let executable: URL
        let arguments: [String]
    }

    private(set) var calls: [Call] = []
    let result: VideoProcessResult

    init(result: VideoProcessResult) {
        self.result = result
    }

    func run(executable: URL, arguments: [String]) throws -> VideoProcessResult {
        calls.append(Call(executable: executable, arguments: arguments))
        return result
    }
}
