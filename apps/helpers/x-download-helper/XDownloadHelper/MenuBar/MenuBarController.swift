import AppKit
import SwiftUI

@MainActor
final class MenuBarController: NSObject {
    private let store: DownloadTaskStore
    private let popover = NSPopover()
    private var statusItem: NSStatusItem?

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
        popover.contentSize = NSSize(width: 360, height: 240)
        popover.contentViewController = NSHostingController(
            rootView: DownloadListView(store: store)
        )
    }

    @objc
    private func togglePopover(_ sender: NSStatusBarButton) {
        if popover.isShown {
            popover.performClose(nil)
        } else {
            popover.show(relativeTo: sender.bounds, of: sender, preferredEdge: .minY)
        }
    }
}
