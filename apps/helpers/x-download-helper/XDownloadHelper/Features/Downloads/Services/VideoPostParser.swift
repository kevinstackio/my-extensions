import Foundation

struct VideoPostParser: Sendable {
    func parse(output: String) throws -> VideoPost {
        guard let data = output.data(using: .utf8) else {
            throw VideoPostParseError.invalidJSON
        }

        let object: Any
        do {
            object = try JSONSerialization.jsonObject(with: data)
        } catch {
            throw VideoPostParseError.invalidJSON
        }

        let dictionaries: [[String: Any]]
        if let root = object as? [String: Any], let entries = root["entries"] as? [[String: Any]] {
            dictionaries = entries
        } else if let root = object as? [String: Any] {
            dictionaries = [root]
        } else {
            throw VideoPostParseError.invalidJSON
        }

        guard !dictionaries.isEmpty else {
            throw VideoPostParseError.empty
        }

        let entries = try dictionaries.map { dictionary -> VideoPostEntry in
            // 只接受 yt-dlp 返回的可重新提取地址，不信任其输出路径或文件名。
            let urlString = (dictionary["webpage_url"] as? String)
                ?? (dictionary["original_url"] as? String)
                ?? (dictionary["url"] as? String)
            guard let urlString, let url = URL(string: urlString), url.scheme != nil, url.host != nil else {
                throw VideoPostParseError.missingURL
            }
            return VideoPostEntry(url: url)
        }
        return VideoPost(entries: entries)
    }
}
