import Foundation
import XCTest

@testable import XDownloadHelper

final class NativeMessagingFrameIOTests: XCTestCase {
    func testReaderHandlesSegmentedLittleEndianFrame() throws {
        let pipe = Pipe()
        let payload = Data("{\"ok\":true}".utf8)
        var frame = Data([UInt8(payload.count & 0xff), UInt8((payload.count >> 8) & 0xff), 0, 0])
        frame.append(payload)
        pipe.fileHandleForWriting.write(frame.prefix(2))
        pipe.fileHandleForWriting.write(frame.dropFirst(2).prefix(2))
        pipe.fileHandleForWriting.write(frame.dropFirst(4))
        pipe.fileHandleForWriting.closeFile()

        XCTAssertEqual(try NativeMessagingFrameReader.readMessage(from: pipe.fileHandleForReading, maximumBytes: 1024), payload)
    }

    func testReaderRejectsTruncatedPayload() {
        let pipe = Pipe()
        pipe.fileHandleForWriting.write(Data([4, 0, 0, 0, 123]))
        pipe.fileHandleForWriting.closeFile()

        XCTAssertThrowsError(try NativeMessagingFrameReader.readMessage(from: pipe.fileHandleForReading, maximumBytes: 1024))
    }

    func testReaderRejectsOversizedPayload() {
        let pipe = Pipe()
        pipe.fileHandleForWriting.write(Data([0, 4, 0, 0]))
        pipe.fileHandleForWriting.closeFile()

        XCTAssertThrowsError(try NativeMessagingFrameReader.readMessage(from: pipe.fileHandleForReading, maximumBytes: 1024))
    }

    func testWriterUsesLittleEndianLengthAndUTF8ByteCount() throws {
        let pipe = Pipe()
        try NativeMessagingFrameWriter.writeMessage(Data("你好".utf8), to: pipe.fileHandleForWriting)
        pipe.fileHandleForWriting.closeFile()
        XCTAssertEqual(try pipe.fileHandleForReading.readToEnd(), Data([6, 0, 0, 0, 228, 189, 160, 229, 165, 189]))
    }
}
