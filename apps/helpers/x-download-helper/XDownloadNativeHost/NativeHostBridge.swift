import Foundation

enum NativeHostBridge {
    static let allowedDevelopmentOrigin = "chrome-extension://mdkcfihmaejbecgoinnnlkjmbpmnfekl/"

    static func isAllowedOrigin(_ origin: String) -> Bool { origin == allowedDevelopmentOrigin }

    static func process(input: Data, origin: String) throws -> Data {
        guard isAllowedOrigin(origin) else { throw NSError(domain: "NativeHost", code: 1) }
        let request = try JSONDecoder().decode(NativeMessageRequest.self, from: input)
        guard request.protocolVersion == nativeMessageProtocolVersion else {
            return try JSONEncoder().encode(NativeMessageResponse.failure(requestId: request.requestId, code: .unsupportedProtocol, message: "不支持的协议版本"))
        }
        guard request.type == "task.enqueue" else {
            return try JSONEncoder().encode(NativeMessageResponse.failure(requestId: request.requestId, code: .unsupportedMessage, message: "不支持的消息类型"))
        }
        let data = try JSONEncoder().encode(request)
        do {
            return try HelperConnection.send(data, socketURL: LocalSocketLocation.socketURL, timeout: 2)
        } catch {
            do {
                try HelperLauncher.launchHelper(relativeToHostExecutable: URL(fileURLWithPath: CommandLine.arguments[0]))
                for _ in 0..<10 {
                    Thread.sleep(forTimeInterval: 0.1)
                    if let response = try? HelperConnection.send(data, socketURL: LocalSocketLocation.socketURL, timeout: 2) {
                        return response
                    }
                }
                return try JSONEncoder().encode(NativeMessageResponse.failure(requestId: request.requestId, code: .helperStartTimeout, message: "Helper 启动超时"))
            } catch {
                return try JSONEncoder().encode(NativeMessageResponse.failure(requestId: request.requestId, code: .helperUnavailable, message: "无法连接 Helper"))
            }
        }
    }
}
