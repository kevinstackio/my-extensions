import Foundation

enum NativeHostBridge {
    // Native Messaging 的 allowed_origins 仍是第一道边界，Bridge 只接受本地开发扩展来源。
    static let allowedDevelopmentOrigin = "chrome-extension://mdkcfihmaejbecgoinnnlkjmbpmnfekl/"

    static func isAllowedOrigin(_ origin: String) -> Bool {
        origin == allowedDevelopmentOrigin
    }
}
