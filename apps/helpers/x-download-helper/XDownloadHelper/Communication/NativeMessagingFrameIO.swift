import Foundation

enum NativeMessagingFrameError: Error, Equatable {
    case endOfStream
    case truncated
    case oversized
}

enum NativeMessagingFrameReader {
    static func readMessage(from handle: FileHandle, maximumBytes: Int) throws -> Data {
        let header = try readExactly(4, from: handle)
        let length = Int(header[0])
            | (Int(header[1]) << 8)
            | (Int(header[2]) << 16)
            | (Int(header[3]) << 24)
        guard length <= maximumBytes else { throw NativeMessagingFrameError.oversized }
        guard length > 0 else { throw NativeMessagingFrameError.truncated }
        return try readExactly(length, from: handle)
    }

    private static func readExactly(_ count: Int, from handle: FileHandle) throws -> Data {
        var result = Data()
        while result.count < count {
            let chunk = try handle.read(upToCount: count - result.count) ?? Data()
            guard !chunk.isEmpty else {
                throw result.isEmpty ? NativeMessagingFrameError.endOfStream : NativeMessagingFrameError.truncated
            }
            result.append(chunk)
        }
        return result
    }
}

enum NativeMessagingFrameWriter {
    static func writeMessage(_ payload: Data, to handle: FileHandle) throws {
        let length = UInt32(payload.count)
        var frame = Data([
            UInt8(length & 0xff),
            UInt8((length >> 8) & 0xff),
            UInt8((length >> 16) & 0xff),
            UInt8((length >> 24) & 0xff)
        ])
        frame.append(payload)
        try handle.write(contentsOf: frame)
    }
}
