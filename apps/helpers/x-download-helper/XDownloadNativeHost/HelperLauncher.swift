import Foundation

enum HelperLauncher {
    static func launchHelper(relativeToHostExecutable executableURL: URL) throws {
        let appURL = executableURL
            .deletingLastPathComponent()
            .deletingLastPathComponent()
            .deletingLastPathComponent()
        let process = Process()
        process.executableURL = URL(fileURLWithPath: "/usr/bin/open")
        process.arguments = [appURL.path]
        try process.run()
    }
}
