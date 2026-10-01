import SwiftUI

@main
struct OhMyPhotosApp: App {
    @StateObject private var session = DeviceSession()

    var body: some Scene {
        WindowGroup("OhMy Photos") {
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
    }
}
