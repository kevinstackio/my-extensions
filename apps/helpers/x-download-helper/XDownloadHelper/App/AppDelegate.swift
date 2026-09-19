import AppKit

@MainActor
final class AppDelegate: NSObject, NSApplicationDelegate {
    private let notifier = DownloadCompletionNotifier()
    private var menuBarController: MenuBarController?

    func applicationDidFinishLaunching(_ notification: Notification) {
        notifier.requestAuthorization()

        let store = DownloadTaskStore(
            onDownloadCompleted: { [notifier] task in
                notifier.notifyDownloadCompleted(task)
            }
        )
        let controller = MenuBarController(store: store)
        menuBarController = controller
        controller.start()
    }
}
