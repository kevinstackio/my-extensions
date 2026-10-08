import AppKit

@MainActor
final class AppDelegate: NSObject, NSApplicationDelegate {
    private var menuBarController: MenuBarController?
    private var socketServer: HelperSocketServer?
    private var downloadCoordinator: VideoDownloadCoordinator?

    func applicationDidFinishLaunching(_ notification: Notification) {
        let store = DownloadTaskStore()
        let controller = MenuBarController(store: store)
        menuBarController = controller
        controller.start()

        if let tools = try? VideoToolValidator().validatedTools(in: Bundle.main.bundleURL) {
            let fileStore = VideoDownloadFileStore()
            // 启动时清理上次异常退出留下的下载中间文件，避免临时资源长期堆积。
            try? fileStore.cleanupOrphanedWorkspaces()
            let coordinator = VideoDownloadCoordinator(
                runner: VideoProcessRunner(tools: tools),
                fileStore: fileStore,
                updateState: { [weak store] taskID, state in
                    store?.updateState(for: taskID, state: state)
                },
                removeTask: { [weak store] taskID in
                    store?.remove(id: taskID)
                }
            )
            store.onTaskEnqueued = { task in
                coordinator.enqueue(task)
            }
            downloadCoordinator = coordinator
        } else {
            // 工具缺失或版本不符时保留 Helper 运行，但不启动不可用的下载协调器。
            NSLog("X Download Helper 视频工具校验失败")
        }

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
