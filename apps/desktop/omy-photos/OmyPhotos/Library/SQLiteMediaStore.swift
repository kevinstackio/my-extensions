import Foundation
import SQLite3

enum SQLiteMediaStoreError: Error {
    case openFailed(String)
    case statementFailed(String)
}

final class SQLiteMediaStore {
    private let sqliteTransient = unsafeBitCast(-1, to: sqlite3_destructor_type.self)
    private var database: OpaquePointer?

    init(url: URL) throws {
        let flags = SQLITE_OPEN_CREATE | SQLITE_OPEN_READWRITE | SQLITE_OPEN_FULLMUTEX
        guard sqlite3_open_v2(url.path, &database, flags, nil) == SQLITE_OK else {
            let message = database.flatMap { String(cString: sqlite3_errmsg($0)) } ?? "未知错误"
            sqlite3_close(database)
            database = nil
            throw SQLiteMediaStoreError.openFailed(message)
        }
        try execute(
            """
            CREATE TABLE IF NOT EXISTS media (
                id TEXT PRIMARY KEY NOT NULL,
                name TEXT NOT NULL,
                uti TEXT,
                file_size INTEGER NOT NULL,
                duration REAL NOT NULL,
                creation_date REAL,
                modification_date REAL,
                sort_date REAL,
                fingerprint TEXT,
                generation INTEGER NOT NULL
            );
            CREATE INDEX IF NOT EXISTS media_sort_index
                ON media(sort_date DESC, id ASC);
            """
        )
    }

    deinit {
        sqlite3_close(database)
    }

    func upsert(_ items: [MediaItem], generation: Int) throws {
        let sql = """
        INSERT INTO media
            (id, name, uti, file_size, duration, creation_date, modification_date, sort_date, fingerprint, generation)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT(id) DO UPDATE SET
            name = excluded.name,
            uti = excluded.uti,
            file_size = excluded.file_size,
            duration = excluded.duration,
            creation_date = excluded.creation_date,
            modification_date = excluded.modification_date,
            sort_date = excluded.sort_date,
            fingerprint = excluded.fingerprint,
            generation = excluded.generation;
        """

        try execute("BEGIN TRANSACTION")
        do {
            for item in items {
                try withStatement(sql) { statement in
                    bind(item.id, at: 1, in: statement)
                    bind(item.name, at: 2, in: statement)
                    bind(item.uti, at: 3, in: statement)
                    sqlite3_bind_int64(statement, 4, item.fileSize)
                    sqlite3_bind_double(statement, 5, item.duration)
                    bind(item.creationDate?.timeIntervalSince1970, at: 6, in: statement)
                    bind(item.modificationDate?.timeIntervalSince1970, at: 7, in: statement)
                    bind(item.sortDate?.timeIntervalSince1970, at: 8, in: statement)
                    bind(item.fingerprint, at: 9, in: statement)
                    sqlite3_bind_int64(statement, 10, Int64(generation))
                    try step(statement)
                }
            }
            try execute("COMMIT")
        } catch {
            try? execute("ROLLBACK")
            throw error
        }
    }

    func page(after id: String?, limit: Int = 200) throws -> [MediaItem] {
        guard limit > 0 else { return [] }
        let base = """
        SELECT id, name, uti, file_size, duration, creation_date, modification_date, fingerprint
        FROM media
        """

        let sql: String
        let cursorDate: TimeInterval?
        if let id {
            cursorDate = try sortDate(for: id)
            let cursorExists: Bool
            if cursorDate != nil {
                cursorExists = true
            } else {
                cursorExists = try contains(id: id)
            }
            guard cursorExists else { return [] }
            if cursorDate != nil {
                sql = base + "WHERE sort_date IS NULL OR sort_date < ? OR (sort_date = ? AND id > ?) "
                    + "ORDER BY CASE WHEN sort_date IS NULL THEN 1 ELSE 0 END, sort_date DESC, id ASC LIMIT ?"
            } else {
                sql = base + "WHERE sort_date IS NULL AND id > ? ORDER BY id ASC LIMIT ?"
            }
        } else {
            cursorDate = nil
            sql = base + "ORDER BY CASE WHEN sort_date IS NULL THEN 1 ELSE 0 END, sort_date DESC, id ASC LIMIT ?"
        }

        return try withStatement(sql) { statement in
            var index: Int32 = 1
            if let cursorDate {
                sqlite3_bind_double(statement, index, cursorDate)
                index += 1
                sqlite3_bind_double(statement, index, cursorDate)
                index += 1
                bind(id, at: index, in: statement)
                index += 1
            } else if id != nil {
                bind(id, at: index, in: statement)
                index += 1
            }
            sqlite3_bind_int(statement, index, Int32(limit))

            var result: [MediaItem] = []
            while sqlite3_step(statement) == SQLITE_ROW {
                result.append(readItem(from: statement))
            }
            return result
        }
    }

    func allIDs() throws -> [String] {
        try withStatement("SELECT id FROM media ORDER BY id ASC") { statement in
            var ids: [String] = []
            while sqlite3_step(statement) == SQLITE_ROW {
                ids.append(String(cString: sqlite3_column_text(statement, 0)))
            }
            return ids
        }
    }

    func deleteAll(exceptGeneration generation: Int) throws {
        try withStatement("DELETE FROM media WHERE generation <> ?") { statement in
            sqlite3_bind_int64(statement, 1, Int64(generation))
            try step(statement)
        }
    }

    private func sortDate(for id: String) throws -> TimeInterval? {
        try withStatement("SELECT sort_date FROM media WHERE id = ?") { statement in
            bind(id, at: 1, in: statement)
            guard sqlite3_step(statement) == SQLITE_ROW else { return nil }
            guard sqlite3_column_type(statement, 0) != SQLITE_NULL else { return nil }
            return sqlite3_column_double(statement, 0)
        }
    }

    private func contains(id: String) throws -> Bool {
        try withStatement("SELECT 1 FROM media WHERE id = ? LIMIT 1") { statement in
            bind(id, at: 1, in: statement)
            return sqlite3_step(statement) == SQLITE_ROW
        }
    }

    private func readItem(from statement: OpaquePointer) -> MediaItem {
        func string(at index: Int32) -> String? {
            guard sqlite3_column_type(statement, index) != SQLITE_NULL else { return nil }
            return String(cString: sqlite3_column_text(statement, index))
        }

        func date(at index: Int32) -> Date? {
            guard sqlite3_column_type(statement, index) != SQLITE_NULL else { return nil }
            return Date(timeIntervalSince1970: sqlite3_column_double(statement, index))
        }

        return MediaItem(
            id: string(at: 0) ?? "",
            name: string(at: 1) ?? "",
            uti: string(at: 2),
            fileSize: sqlite3_column_int64(statement, 3),
            duration: sqlite3_column_double(statement, 4),
            creationDate: date(at: 5),
            modificationDate: date(at: 6),
            fingerprint: string(at: 7)
        )
    }

    private func execute(_ sql: String) throws {
        var errorMessage: UnsafeMutablePointer<CChar>?
        let result = sqlite3_exec(database, sql, nil, nil, &errorMessage)
        guard result == SQLITE_OK else {
            let message = errorMessage.map { String(cString: $0) } ?? "未知错误"
            sqlite3_free(errorMessage)
            throw SQLiteMediaStoreError.statementFailed(message)
        }
    }

    private func withStatement<T>(_ sql: String, body: (OpaquePointer) throws -> T) throws -> T {
        var statement: OpaquePointer?
        guard sqlite3_prepare_v2(database, sql, -1, &statement, nil) == SQLITE_OK,
              let statement else {
            throw SQLiteMediaStoreError.statementFailed(errorMessage)
        }
        defer { sqlite3_finalize(statement) }
        return try body(statement)
    }

    private func step(_ statement: OpaquePointer) throws {
        guard sqlite3_step(statement) == SQLITE_DONE else {
            throw SQLiteMediaStoreError.statementFailed(errorMessage)
        }
    }

    private func bind(_ value: String?, at index: Int32, in statement: OpaquePointer) {
        guard let value else {
            sqlite3_bind_null(statement, index)
            return
        }
        _ = value.withCString {
            sqlite3_bind_text(statement, index, $0, -1, sqliteTransient)
        }
    }

    private func bind(_ value: TimeInterval?, at index: Int32, in statement: OpaquePointer) {
        guard let value else {
            sqlite3_bind_null(statement, index)
            return
        }
        sqlite3_bind_double(statement, index, value)
    }

    private var errorMessage: String {
        database.map { String(cString: sqlite3_errmsg($0)) } ?? "未知错误"
    }
}
