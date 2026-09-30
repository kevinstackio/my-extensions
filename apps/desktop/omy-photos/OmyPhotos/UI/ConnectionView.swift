import SwiftUI

struct ConnectionView: View {
    @ObservedObject var session: DeviceSession

    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            Text("Omy Photos")
                .font(.title2)

            Text(statusText)

            if let summary = session.summary {
                Text(summary.name)
                    .font(.headline)
                if let productKind = summary.productKind {
                    Text(productKind)
                        .foregroundStyle(.secondary)
                }
            }

            Text("连接后只读取 iPhone 媒体，不会删除或修改设备内容。")
                .foregroundStyle(.secondary)
        }
        .padding(24)
        .frame(minWidth: 440, minHeight: 220)
    }

    private var statusText: String {
        switch session.state {
        case .disconnected:
            return "未连接 iPhone"
        case .awaitingTrust:
            return "请在 iPhone 上解锁并信任此 Mac"
        case .syncing:
            return "正在读取 iPhone 媒体目录"
        case .available:
            return "设备已连接，可以继续浏览"
        case .locked:
            return "iPhone 已锁定，请解锁后继续"
        case .failed:
            return "设备会话失败，请重新连接 iPhone"
        }
    }
}
