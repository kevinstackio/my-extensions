import UserNotifications

@MainActor
final class DownloadCompletionNotifier: NSObject, UNUserNotificationCenterDelegate {
    private let notificationCenter = UNUserNotificationCenter.current()

    override init() {
        super.init()
        notificationCenter.delegate = self
    }

    func requestAuthorization() {
        Task {
            _ = try? await notificationCenter.requestAuthorization(options: [.alert, .sound])
        }
    }

    func notifyDownloadCompleted(_ task: DownloadTask) {
        let content = UNMutableNotificationContent()
        content.title = "下载完成"
        content.body = task.fileName
        content.sound = .default

        let request = UNNotificationRequest(
            identifier: task.id.uuidString,
            content: content,
            trigger: nil
        )

        Task {
            try? await notificationCenter.add(request)
        }
    }

    nonisolated func userNotificationCenter(
        _ center: UNUserNotificationCenter,
        willPresent notification: UNNotification
    ) async -> UNNotificationPresentationOptions {
        [.banner, .sound]
    }
}
