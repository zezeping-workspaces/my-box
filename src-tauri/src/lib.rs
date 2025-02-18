pub mod modules;
pub mod plugins;

use std::sync::{Arc, Mutex};
use tauri::{AppHandle, Emitter, Manager};
// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(plugins::sqlite::init())
        .setup(|app| {
            #[cfg(target_os = "macos")]
            app.set_activation_policy(tauri::ActivationPolicy::Accessory);

            #[cfg(debug_assertions)] // only include this code on debug builds
            {
                if let Some(window) = app.get_webview_window("main") {
                    window.open_devtools();
                    // window.close_devtools();
                }
            }

            // 获取 AppHandle 的 Arc<Mutex<>>
            let app_handle = Arc::new(Mutex::new(app.handle().clone()));

            // 在异步任务中处理输入事件
            tauri::async_runtime::spawn({
                let app_handle = Arc::clone(&app_handle); // 克隆 Arc 以供异步任务使用
                async move {
                    // 在异步任务中执行 snippet::watch
                    modules::snippet::watch(move |event| {
                        // 获取锁来访问 app_handle
                        let app_handle = app_handle.lock().unwrap();
                        let event_json = event.to_json();
                        if let Err(e) = app_handle.emit("BOX::SNIPPET::INPUT_EVENT", event_json) {
                            eprintln!("Error emitting event: {}", e);
                        }
                    });
                }
            });

            Ok(())
        })
        .invoke_handler(tauri::generate_handler![greet])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
