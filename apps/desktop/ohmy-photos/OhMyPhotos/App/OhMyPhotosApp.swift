import SwiftUI

@main
struct OhMyPhotosApp: App {
    @StateObject private var session = DeviceSession()

    var body: some Scene {
        WindowGroup("Oh My Photos") {
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
