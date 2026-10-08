import Foundation

final class FilenameResolver {
    func resolve(_ originalName: String, existingNames: Set<String>) -> String {
        let sanitized = originalName
            .replacingOccurrences(of: "/", with: "_")
            .replacingOccurrences(of: ":", with: "_")
        let name = sanitized.isEmpty ? "media" : sanitized
        guard existingNames.contains(name) else { return name }

        let pathExtension = (name as NSString).pathExtension
        let base = pathExtension.isEmpty
            ? name
            : String(name.dropLast(pathExtension.count + 1))
        var index = 2
        while true {
            let candidateBase = "\(base) (\(index))"
            let candidate = pathExtension.isEmpty
                ? candidateBase
                : "\(candidateBase).\(pathExtension)"
            if !existingNames.contains(candidate) { return candidate }
            index += 1
        }
    }
}
