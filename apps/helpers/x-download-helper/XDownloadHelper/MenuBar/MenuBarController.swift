import AppKit
import SwiftUI

// 监听器与控制器绑定，控制器释放时统一移除，避免全局事件残留。
private final class MouseMonitorToken: @unchecked Sendable {
    var local: Any?
    var global: Any?

    deinit {
        if let local {
            NSEvent.removeMonitor(local)
        }
        if let global {
            NSEvent.removeMonitor(global)
        }
    }
}

@MainActor
final class MenuBarController: NSObject {
    private let store: DownloadTaskStore
    private let popover = NSPopover()
    private var statusItem: NSStatusItem?
    private let mouseMonitorToken = MouseMonitorToken()

    init(store: DownloadTaskStore) {
        self.store = store
        super.init()
    }

    func start() {
        let item = NSStatusBar.system.statusItem(withLength: NSStatusItem.squareLength)
        statusItem = item

        if let button = item.button {
            let image = NSImage(named: "MenuBarIcon")
            image?.isTemplate = true
            image?.size = NSSize(width: 16, height: 16)
            button.image = image
            button.imageScaling = .scaleProportionallyDown
            button.target = self
            button.action = #selector(togglePopover(_:))
            button.sendAction(on: [.leftMouseUp, .rightMouseUp])
        }

        popover.behavior = .transient
        popover.animates = true
        popover.contentSize = NSSize(width: 360, height: 300)
        popover.contentViewController = NSHostingController(
            rootView: DownloadListView(store: store)
        )

        installMouseMonitors()
    }

    @objc
    private func togglePopover(_ sender: NSStatusBarButton) {
        if popover.isShown {
            popover.performClose(nil)
        } else {
            popover.show(relativeTo: sender.bounds, of: sender, preferredEdge: .minY)
        }
    }

    func showPopover() {
        guard !popover.isShown, let button = statusItem?.button else { return }
        popover.show(relativeTo: button.bounds, of: button, preferredEdge: .minY)
    }

    private func installMouseMonitors() {
        let events: NSEvent.EventTypeMask = [.leftMouseDown, .rightMouseDown]

        mouseMonitorToken.local = NSEvent.addLocalMonitorForEvents(
            matching: events.union(.keyDown)
        ) { [weak self] event in
            if event.type == .keyDown, event.keyCode == 53, self?.popover.isShown == true {
                // macOS Escape 键关闭当前 Popover，并消费本次按键事件。
                self?.popover.performClose(nil)
                return nil
            }

            if event.type != .keyDown {
                self?.closePopoverIfClickedOutside(event)
            }
            return event
        }

        mouseMonitorToken.global = NSEvent.addGlobalMonitorForEvents(matching: events) { [weak self] _ in
            self?.popover.performClose(nil)
        }
    }

    private func closePopoverIfClickedOutside(_ event: NSEvent) {
        guard popover.isShown else { return }

        let point = NSEvent.mouseLocation
        let popoverFrame = popover.contentViewController?.view.window?.frame
        let statusItemWindow = statusItem?.button?.window
        let statusItemFrame = statusItemWindow?.frame

        // transient 不保证桌面空白和其他面板的点击会收起，这里补全外部点击行为。
        guard !(popoverFrame?.contains(point) ?? false),
              event.window !== statusItemWindow,
              !(statusItemFrame?.contains(point) ?? false) else {
            return
        }

        popover.performClose(event)
    }
}
