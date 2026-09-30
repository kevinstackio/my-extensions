import SwiftUI

@main
struct OmyPhotosApp: App {
    private let probe = MediaProbe()

    var body: some Scene {
        WindowGroup("Omy Photos") {
            ProbeView(probe: probe)
                .onAppear { probe.start() }
                .onDisappear { probe.stop() }
        }
    }
}

private struct ProbeView: View {
    let probe: MediaProbe

    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            Text("Omy Photos 技术验证")
                .font(.title2)
            Text("设备状态：\(String(describing: probe.state))")
            Text("已发现媒体：\(probe.summaries.count)")
            Text("此窗口只用于 ImageCaptureCore 探针，不代表最终产品界面。")
                .foregroundStyle(.secondary)
        }
        .padding(24)
        .frame(minWidth: 420, minHeight: 180)
    }
}
