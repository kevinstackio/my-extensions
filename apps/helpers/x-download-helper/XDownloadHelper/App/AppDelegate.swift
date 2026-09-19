import AppKit

@MainActor
final class AppDelegate: NSObject, NSApplicationDelegate {
    private var menuBarController: MenuBarController?
    private var socketServer: HelperSocketServer?

    func applicationDidFinishLaunching(_ notification: Notification) {
        let store = DownloadTaskStore()
        let controller = MenuBarController(store: store)
        menuBarController = controller
        controller.start()

        let handler = HelperRequestHandler(store: store, showPopover: { [weak controller] in
            controller?.showPopover()
        })
        let server = HelperSocketServer(handler: handler)
        socketServer = server
        try? server.start()
        // App 启动时自动刷新当前用户的 Chrome/Edge Native Host 路径，避免用户手动注册。
        try? NativeHostRegistrar().register()
    }
}
