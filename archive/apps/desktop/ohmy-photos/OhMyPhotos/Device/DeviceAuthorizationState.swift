import Foundation

enum DeviceAuthorizationState: Equatable {
    case disconnected
    case awaitingTrust
    case syncing
    case available
    case locked
    case failed
}

enum DeviceAuthorizationEvent: Equatable {
    case deviceDiscovered
    case trusted
    case contentReady
    case accessRestricted
    case deviceRemoved
    case sessionFailed
}

enum DeviceAuthorizationReducer {
    static func reduce(
        _ event: DeviceAuthorizationEvent,
        from state: DeviceAuthorizationState
    ) -> DeviceAuthorizationState {
        switch event {
        case .deviceDiscovered:
            return .awaitingTrust
        case .trusted:
            return .syncing
        case .contentReady:
            return .available
        case .accessRestricted:
            return .locked
        case .deviceRemoved:
            return .disconnected
        case .sessionFailed:
            return .failed
        }
    }
}
