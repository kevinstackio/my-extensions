import AppKit

@MainActor
final class AppDelegate: NSObject, NSApplicationDelegate {
    private var menuBarController: MenuBarController?

    func applicationDidFinishLaunching(_ notification: Notification) {
        let store = DownloadTaskStore()
        let controller = MenuBarController(store: store)
        menuBarController = controller
        controller.start()
    }
}
