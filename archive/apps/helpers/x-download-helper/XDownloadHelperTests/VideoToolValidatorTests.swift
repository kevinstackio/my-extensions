import Foundation
import Darwin
import XCTest

@testable import XDownloadHelper

final class VideoToolValidatorTests: XCTestCase {
    func testValidatedToolsReturnsBundleToolPathsAndExpectedArguments() throws {
        let fixture = try makeBundleFixture()
        var calls: [(URL, [String])] = []
        let validator = VideoToolValidator { executable, arguments in
            calls.append((executable, arguments))
            if executable.lastPathComponent == "yt-dlp" {
                return (0, "2026.08.19\n", "")
            }
            return (0, "ffmpeg version 9.0.2\n", "")
        }

        let paths = try validator.validatedTools(in: fixture.bundleURL)

        XCTAssertEqual(paths.ytDLP, fixture.toolsURL.appendingPathComponent("yt-dlp"))
        XCTAssertEqual(paths.ffmpeg, fixture.toolsURL.appendingPathComponent("ffmpeg"))
        XCTAssertEqual(calls.map(\.1), [
            ["--ignore-config", "--no-update", "--version"],
            ["-version"],
        ])
    }

    func testMissingToolReturnsMissingError() throws {
        let fixture = try makeBundleFixture()
        try FileManager.default.removeItem(at: fixture.toolsURL.appendingPathComponent("yt-dlp"))

        let validator = VideoToolValidator { _, _ in (0, "", "") }

        XCTAssertThrowsError(try validator.validatedTools(in: fixture.bundleURL)) { error in
            XCTAssertEqual(error as? VideoToolError, .missing("yt-dlp"))
        }
    }

    func testNonExecutableToolReturnsNotExecutableError() throws {
        let fixture = try makeBundleFixture()
        chmod(fixture.toolsURL.appendingPathComponent("ffmpeg").path, 0o644)

        let validator = VideoToolValidator { _, _ in (0, "", "") }

        XCTAssertThrowsError(try validator.validatedTools(in: fixture.bundleURL)) { error in
            XCTAssertEqual(error as? VideoToolError, .notExecutable("ffmpeg"))
        }
    }

    func testToolSymlinkOutsideBundleReturnsOutsideBundleError() throws {
        let fixture = try makeBundleFixture()
        let outside = fixture.rootURL.appendingPathComponent("outside-tool")
        FileManager.default.createFile(atPath: outside.path, contents: Data(), attributes: [.posixPermissions: 0o755])
        try FileManager.default.removeItem(at: fixture.toolsURL.appendingPathComponent("yt-dlp"))
        try FileManager.default.createSymbolicLink(
            at: fixture.toolsURL.appendingPathComponent("yt-dlp"),
            withDestinationURL: outside
        )

        let validator = VideoToolValidator { _, _ in (0, "", "") }

        XCTAssertThrowsError(try validator.validatedTools(in: fixture.bundleURL)) { error in
            XCTAssertEqual(error as? VideoToolError, .outsideBundle("yt-dlp"))
        }
    }

    func testNonZeroToolExitReturnsLaunchFailedError() throws {
        let fixture = try makeBundleFixture()
        let validator = VideoToolValidator { _, _ in (1, "", "network unavailable") }

        XCTAssertThrowsError(try validator.validatedTools(in: fixture.bundleURL)) { error in
            XCTAssertEqual(error as? VideoToolError, .launchFailed("yt-dlp"))
        }
    }

    func testEmptyToolOutputReturnsLaunchFailedError() throws {
        let fixture = try makeBundleFixture()
        let validator = VideoToolValidator { _, _ in (0, "", "") }

        XCTAssertThrowsError(try validator.validatedTools(in: fixture.bundleURL)) { error in
            XCTAssertEqual(error as? VideoToolError, .launchFailed("yt-dlp"))
        }
    }

    func testYtDlpVersionMismatchReturnsVersionMismatchError() throws {
        let fixture = try makeBundleFixture()
        let validator = VideoToolValidator { executable, _ in
            if executable.lastPathComponent == "yt-dlp" {
                return (0, "2026.08.20\n", "")
            }
            return (0, "ffmpeg version 9.0.2\n", "")
        }

        XCTAssertThrowsError(try validator.validatedTools(in: fixture.bundleURL)) { error in
            XCTAssertEqual(error as? VideoToolError, .versionMismatch(tool: "yt-dlp", expected: "2026.08.19", actual: "2026.08.20"))
        }
    }

    func testFfmpegVersionMismatchReturnsVersionMismatchError() throws {
        let fixture = try makeBundleFixture()
        let validator = VideoToolValidator { executable, _ in
            if executable.lastPathComponent == "yt-dlp" {
                return (0, "2026.08.19\n", "")
            }
            return (0, "ffmpeg version 9.0.1\n", "")
        }

        XCTAssertThrowsError(try validator.validatedTools(in: fixture.bundleURL)) { error in
            XCTAssertEqual(error as? VideoToolError, .versionMismatch(tool: "ffmpeg", expected: "9.0.2", actual: "ffmpeg version 9.0.1"))
        }
    }

    private struct BundleFixture {
        let rootURL: URL
        let bundleURL: URL
        let toolsURL: URL
    }

    private func makeBundleFixture() throws -> BundleFixture {
        let rootURL = FileManager.default.temporaryDirectory.appendingPathComponent(UUID().uuidString)
        let bundleURL = rootURL.appendingPathComponent("X Download Helper.app")
        let toolsURL = bundleURL.appendingPathComponent("Contents/Resources/Tools")
        try FileManager.default.createDirectory(at: toolsURL, withIntermediateDirectories: true)
        for name in ["yt-dlp", "ffmpeg"] {
            let url = toolsURL.appendingPathComponent(name)
            FileManager.default.createFile(atPath: url.path, contents: Data(), attributes: [.posixPermissions: 0o755])
        }
        return BundleFixture(rootURL: rootURL, bundleURL: bundleURL, toolsURL: toolsURL)
    }
}
