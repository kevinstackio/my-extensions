import Foundation

let maximumMessageBytes = 1024 * 1024
let origin = CommandLine.arguments.dropFirst().first ?? ""

do {
    let input = try NativeMessagingFrameReader.readMessage(from: .standardInput, maximumBytes: maximumMessageBytes)
    let output = try NativeHostBridge.process(input: input, origin: origin)
    try NativeMessagingFrameWriter.writeMessage(output, to: .standardOutput)
} catch {
    FileHandle.standardError.write(Data("Native Host failed: \(error)\n".utf8))
    exit(1)
}
