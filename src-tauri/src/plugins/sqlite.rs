use tauri_plugin_sql::{Builder, Migration, MigrationKind};

fn get_migrations() -> Vec<Migration> {
    let migrations = vec![
        // Define your migrations here
        Migration {
            version: 1,
            description: "create_hash_map_tables",
            sql: r#"CREATE TABLE hash_map (
                        id INTEGER PRIMARY KEY, 
                        key STRING NOT NULL, 
                        value TEXT, 
                        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
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
