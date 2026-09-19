import Foundation
import Darwin

enum HelperConnectionError: Error { case unavailable }

enum HelperConnection {
    static func send(_ request: Data, socketURL: URL, timeout: TimeInterval) throws -> Data {
        // Socket 由 Helper 在当前用户的 Application Support 中创建；Bridge 不接受任意路径。
        var address = sockaddr_un()
        address.sun_family = sa_family_t(AF_UNIX)
        let path = socketURL.path
        guard path.utf8.count < MemoryLayout.size(ofValue: address.sun_path) else { throw HelperConnectionError.unavailable }
        withUnsafeMutableBytes(of: &address.sun_path) { bytes in
            let utf8 = Array(path.utf8)
            for (index, byte) in utf8.enumerated() {
                bytes[index] = byte
            }
        }
        let fd = socket(AF_UNIX, SOCK_STREAM, 0)
        guard fd >= 0 else { throw HelperConnectionError.unavailable }
        defer { close(fd) }
        let addressLength = socklen_t(MemoryLayout<sockaddr_un>.size)
        guard connect(fd, withUnsafePointer(to: &address) { $0.withMemoryRebound(to: sockaddr.self, capacity: 1) { $0 } }, addressLength) == 0 else { throw HelperConnectionError.unavailable }
        var frame = Data()
        let length = UInt32(request.count)
        frame.append(contentsOf: [UInt8(length & 0xff), UInt8((length >> 8) & 0xff), UInt8((length >> 16) & 0xff), UInt8((length >> 24) & 0xff)])
        frame.append(request)
        _ = frame.withUnsafeBytes { Darwin.send(fd, $0.baseAddress, frame.count, 0) }
        var header = [UInt8](repeating: 0, count: 4)
        guard recv(fd, &header, 4, 0) == 4 else { throw HelperConnectionError.unavailable }
        let responseLength = Int(header[0]) | (Int(header[1]) << 8) | (Int(header[2]) << 16) | (Int(header[3]) << 24)
        guard responseLength > 0, responseLength <= 1024 * 1024 else { throw HelperConnectionError.unavailable }
        var response = Data(count: responseLength)
        let readCount = response.withUnsafeMutableBytes { recv(fd, $0.baseAddress, responseLength, 0) }
        guard readCount == responseLength else { throw HelperConnectionError.unavailable }
        _ = timeout
        return response
    }
}
