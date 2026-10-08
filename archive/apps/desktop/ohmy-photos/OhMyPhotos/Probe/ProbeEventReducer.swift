import Foundation

enum DeviceProbeState: Equatable {
    case idle
    case discovered
    case awaitingTrust
    case ready
    case locked
    case disconnected
    case failed
}

enum ProbeEvent: Equatable {
    case deviceFound
    case authorizationRequired
    case deviceReady
    case deviceLocked
    case deviceDisconnected
    case unknown
}

enum ProbeEventReducer {
    static func reduce(_ event: ProbeEvent, from state: DeviceProbeState) -> DeviceProbeState {
        switch event {
        case .deviceFound:
            return .discovered
        case .authorizationRequired:
            return .awaitingTrust
        case .deviceReady:
            return .ready
        case .deviceLocked:
            return .locked
        case .deviceDisconnected:
            return .disconnected
        case .unknown:
            return state
        }
    }
}
