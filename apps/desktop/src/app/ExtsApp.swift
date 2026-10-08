import SwiftUI

@main
struct ExtsApp: App {
    @StateObject private var session = DeviceSession()

    var body: some Scene {
        WindowGroup("exts") {
            Group {
                if session.state == .available {
                    LibraryView(
                        items: session.mediaItems,
                        images: session.thumbnailImages,
                        failedThumbnailIDs: session.failedThumbnailIDs,
                        onRequestThumbnail: { session.requestThumbnail(for: $0) },
                        onDownload: { session.download(items: $0) }
                    )
                } else {
                    ConnectionView(session: session)
                }
            }
                .onAppear { session.start() }
                .onDisappear { session.stop() }
        }
        .defaultSize(width: 1100, height: 720)
    }
}
