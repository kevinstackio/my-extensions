import Foundation

struct MediaItem: Equatable, Identifiable {
    let id: String
    let name: String
    let uti: String?
    let fileSize: Int64
    let duration: TimeInterval
    let creationDate: Date?
    let modificationDate: Date?
    let fingerprint: String?

    var sortDate: Date? {
        creationDate ?? modificationDate
    }
}
