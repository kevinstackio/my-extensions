import Darwin
import Foundation

@MainActor
final class HelperSocketServer {
    private let handler: HelperRequestHandler
    private let socketURL: URL
    private var socketFD: Int32 = -1
    private var acceptSource: DispatchSourceRead?

    init(socketURL: URL = LocalSocketLocation.socketURL, handler: HelperRequestHandler) {
        self.socketURL = socketURL
        self.handler = handler
    }

    func start() throws {
        try FileManager.default.createDirectory(at: socketURL.deletingLastPathComponent(), withIntermediateDirectories: true)
        if FileManager.default.fileExists(atPath: socketURL.path) {
            if isSocketActive() { throw POSIXError(.EADDRINUSE) }
            try FileManager.default.removeItem(at: socketURL)
        }
        socketFD = socket(AF_UNIX, SOCK_STREAM, 0)
        guard socketFD >= 0 else { throw POSIXError(.EIO) }
        var address = sockaddr_un()
        address.sun_family = sa_family_t(AF_UNIX)
        let bytes = Array(socketURL.path.utf8)
        guard bytes.count < MemoryLayout.size(ofValue: address.sun_path) else { throw POSIXError(.ENAMETOOLONG) }
        withUnsafeMutableBytes(of: &address.sun_path) { buffer in
            for (index, byte) in bytes.enumerated() { buffer[index] = byte }
        }
        let length = socklen_t(MemoryLayout<sockaddr_un>.size)
        guard bind(socketFD, withUnsafePointer(to: &address) { $0.withMemoryRebound(to: sockaddr.self, capacity: 1) { $0 } }, length) == 0,
              listen(socketFD, 8) == 0 else {
            close(socketFD)
            socketFD = -1
            throw POSIXError(.EADDRINUSE)
        }
        chmod(socketURL.path, S_IRUSR | S_IWUSR)
        let source = DispatchSource.makeReadSource(fileDescriptor: socketFD, queue: .main)
        source.setEventHandler { [weak self] in
            // Socket 事件与任务列表状态统一在主执行器上处理。
            self?.acceptConnection()
        }
        source.setCancelHandler { [socketFD] in close(socketFD) }
        source.resume()
        acceptSource = source
    }

    func stop() {
        acceptSource?.cancel()
        acceptSource = nil
        socketFD = -1
        try? FileManager.default.removeItem(at: socketURL)
    }

    private func acceptConnection() {
        let fd = accept(socketFD, nil, nil)
        guard fd >= 0 else { return }
        handleConnection(fd)
    }

    private func isSocketActive() -> Bool {
        let fd = socket(AF_UNIX, SOCK_STREAM, 0)
        guard fd >= 0 else { return false }
        defer { close(fd) }
        var address = sockaddr_un()
        address.sun_family = sa_family_t(AF_UNIX)
        let bytes = Array(socketURL.path.utf8)
        withUnsafeMutableBytes(of: &address.sun_path) { buffer in
            for (index, byte) in bytes.enumerated() { buffer[index] = byte }
        }
        return connect(fd, withUnsafePointer(to: &address) { $0.withMemoryRebound(to: sockaddr.self, capacity: 1) { $0 } }, socklen_t(MemoryLayout<sockaddr_un>.size)) == 0
    }

    private func handleConnection(_ fd: Int32) {
        defer { close(fd) }
        let input = FileHandle(fileDescriptor: fd, closeOnDealloc: false)
        do {
            let data = try NativeMessagingFrameReader.readMessage(from: input, maximumBytes: 1024 * 1024)
            let request = try JSONDecoder().decode(NativeMessageRequest.self, from: data)
            let response = handler.handle(request)
            try NativeMessagingFrameWriter.writeMessage(JSONEncoder().encode(response), to: input)
        } catch {
            let response = NativeMessageResponse.failure(requestId: "unknown", code: .invalidRequest, message: "请求内容无效")
            try? NativeMessagingFrameWriter.writeMessage(JSONEncoder().encode(response), to: input)
        }
    }
}
