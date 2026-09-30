import SwiftUI

@main
struct OmyPhotosApp: App {
    @StateObject private var session = DeviceSession()

    var body: some Scene {
        WindowGroup("Omy Photos") {
            ConnectionView(session: session)
                .onAppear { session.start() }
                .onDisappear { session.stop() }
        }
    }
}
