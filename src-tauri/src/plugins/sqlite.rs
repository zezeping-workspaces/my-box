use tauri_plugin_sql::{Builder, Migration, MigrationKind};

fn get_migrations() -> Vec<Migration> {
    let migrations = vec![
        // kvs table migration
        Migration {
            version: 1,
            description: "create_kvs_table",
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
        // snippets table migration
        Migration {
            version: 2,
            description: "create_snippets_table",
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
        // dic_stocks table migration
        Migration {
            version: 3,
            description: "create_dic_stocks_table",
            sql: r#"CREATE TABLE IF NOT EXISTS dic_stocks (
                        id integer primary key AUTOINCREMENT,
                        market varchar(255) NOT NULL,
                        code varchar(255) NOT NULL,
                        name varchar(255) NOT NULL,
                        price decimal(10,5) NOT NULL,
                        price_at DATETIME NOT NULL,
                        detail text,
                        extra text,
                        extra2 text,
                        remark text,
                        created_at DATETIME NOT NULL DEFAULT (datetime('now','localtime')),
                        updated_at DATETIME NOT NULL DEFAULT (datetime('now','localtime')),
                        unique(market, code)
                    );
                "#,
            kind: MigrationKind::Up,
        },
        // stocks table migration
        Migration {
            version: 4,
            description: "create_stocks_table",
            sql: r#"CREATE TABLE IF NOT EXISTS stocks (
                        id integer primary key AUTOINCREMENT,
                        market varchar(255) NOT NULL,
                        code varchar(255) NOT NULL,
                        name varchar(255) NOT NULL,
                        price decimal(10,5),
                        price_at DATETIME NOT NULL,
                        notice_lower_price decimal(10,2),
                        notice_higher_price decimal(10,2),
                        notice_enabled boolean DEFAULT FALSE,
                        today_begin_price decimal(10,5),
                        yestoday_end_price decimal(10,5),
                        dic_stock_id integer,
                        extra text,
                        remark text,
                        created_at DATETIME NOT NULL DEFAULT (datetime('now','localtime')),
                        updated_at DATETIME NOT NULL DEFAULT (datetime('now','localtime')),
                        unique(market, code)
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
