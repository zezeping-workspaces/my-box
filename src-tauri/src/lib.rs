pub mod modules;
pub mod plugins;

use std::sync::{Arc, Mutex};
use tauri::{Emitter, Manager};
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
        .menu(|handle| {
            tauri::menu::Menu::with_items(
                handle,
                &[&tauri::menu::Submenu::with_items(
                    handle,
                    "my-box",
                    true,
                    &[&tauri::menu::MenuItem::with_id(
                        handle,
                        "preferences",
                        "preferences",
                        true,
                        Some("CommandOrControl+,"),
                    )
                    .unwrap()],
                )
                .unwrap()],
            )
        })
        .on_window_event(|window, event| {
            let window = window.clone();
            match event {
                tauri::WindowEvent::CloseRequested { api, .. } => {
                    api.prevent_close();
                    window.hide().unwrap();
                }
                _ => {}
            }
        })
        .setup(|app| {
            // #[cfg(target_os = "macos")]
            // app.set_activation_policy(tauri::ActivationPolicy::Accessory);

            // 获取 AppHandle 的 Arc<Mutex<>>
            let app_handle = Arc::new(Mutex::new(app.handle().clone()));

            // open_devtools
            #[cfg(debug_assertions)] // only include this code on debug builds
            {
                if let Some(window) = app.get_webview_window("main") {
                    window.open_devtools();
                    // window.close_devtools();
                }
            }

            // tray
            let _tray = {
                let menu = tauri::menu::MenuBuilder::new(app)
                    .items(&[
                        &tauri::menu::MenuItemBuilder::with_id("preferences", "偏好设置")
                            .build(app)?,
                        &tauri::menu::MenuItemBuilder::with_id("quit", "退出").build(app)?,
                    ])
                    .build()?;
                let tray = tauri::tray::TrayIconBuilder::new()
                    .menu(&menu)
                    .on_menu_event(|handle, event| match event.id().as_ref() {
                        "quit" => {
                            handle.exit(0);
                        }
                        _ => {}
                    })
                    .on_tray_icon_event(|tray, event| {
                        if let tauri::tray::TrayIconEvent::Click {
                            button: tauri::tray::MouseButton::Left,
                            button_state: tauri::tray::MouseButtonState::Down,
                            ..
                        } = event
                        {
                            let app = tray.app_handle();
                            if let Some(webview_window) = app.get_webview_window("main") {
                                let _ = webview_window.show();
                                let _ = webview_window.set_focus();
                            }
                        }
                        // println!("{:?}", event);
                    })
                    .build(app)?;
                // tray.set_title(Some("my-box"))?;
                // tray.set_tooltip(Some("my-box"))?;
                tray.set_show_menu_on_left_click(false)?;
                tray.set_icon(Some(
                    tauri::image::Image::from_path("icons/icon.png").unwrap(),
                ))?;
                // tray.set_visible(true)?;

                app.on_menu_event(|handle, event| match event.id().as_ref() {
                    "preferences" => match handle.get_webview_window("preferences") {
                        Some(preferences_window) => {
                            preferences_window.show().unwrap();
                        }
                        None => {
                            let preferences_window = tauri::webview::WebviewWindowBuilder::new(
                                handle,
                                "preferences",
                                tauri::WebviewUrl::App("/preferences".into()),
                            )
                            .build()
                            .unwrap();
                            let _ = preferences_window.set_title("Preferences");
                            let _ = preferences_window.set_resizable(true);
                            let _ = preferences_window.set_always_on_top(true);
                            let _ = preferences_window.set_size(tauri::LogicalSize::new(800, 600));
                            // let _ = preferences_window.show();
                            // let _ = preferences_window.set_focus();
                        }
                    },
                    _ => {}
                });

                tray
            };

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
