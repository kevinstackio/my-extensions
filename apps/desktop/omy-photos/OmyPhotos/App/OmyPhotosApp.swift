import SwiftUI

@main
struct OmyPhotosApp: App {
    @StateObject private var session = DeviceSession()

    var body: some Scene {
        WindowGroup("Omy Photos") {
            Group {
                if session.state == .available {
                    LibraryView(
                        items: session.mediaItems,
                        onDownload: { session.download(items: $0) }
                    )
                } else {
                    ConnectionView(session: session)
                }
            }
                .onAppear { session.start() }
                .onDisappear { session.stop() }
        }
    }
}
