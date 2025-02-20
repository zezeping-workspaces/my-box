use tauri_plugin_sql::{Builder, Migration, MigrationKind};

fn get_migrations() -> Vec<Migration> {
    let migrations = vec![
        // Define your migrations here
        Migration {
            version: 1,
            description: "create_kvs_tables",
            sql: r#"CREATE TABLE kvs (
                        id INTEGER PRIMARY KEY AUTOINCREMENT, 
                        key STRING NOT NULL, 
                        value TEXT, 
                        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                    );
                "#,
            kind: MigrationKind::Up,
        },
        Migration {
            version: 2,
            description: "create_snippet_tables",
            sql: r#"CREATE TABLE IF NOT EXISTS snippets (
                        id INTEGER PRIMARY KEY AUTOINCREMENT, 
                        tag varchar(255) NOT NULL,
                        code varchar(255) NOT NULL,
                        content text,
                        remark varchar(255),
                        created_at DATETIME NOT NULL DEFAULT (datetime('now','localtime')),
                        updated_at DATETIME NOT NULL DEFAULT (datetime('now','localtime')),
                        unique(tag, code)
                    );
                "#,
            kind: MigrationKind::Up,
        },
    ];
    migrations
}

pub fn init() -> tauri::plugin::TauriPlugin<tauri::Wry, Option<tauri_plugin_sql::PluginConfig>> {
    Builder::default()
        .add_migrations("sqlite:data.db", get_migrations())
        .build()
}
