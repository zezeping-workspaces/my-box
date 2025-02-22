mod keyboard_hooks;
use std::sync::{mpsc, Arc, Mutex};

pub fn watch<F>(callback: F)
where
    F: Fn(keyboard_hooks::event::Event) + Send + 'static, // 定义闭包的类型约束
{
    let (tx, rx) = mpsc::channel();
    let tx = Arc::new(Mutex::new(tx));

    let producer = std::thread::spawn(move || {
        let tx = Arc::clone(&tx);
        keyboard_hooks::watch_keyboard(move |event| {
            tx.lock().unwrap().send(event).unwrap();
        });
    });

    let consumer: std::thread::JoinHandle<()> = std::thread::spawn(move || {
        for received in rx {
            callback(received);
        }
    });

    consumer.join().unwrap();
    producer.join().unwrap();
}

pub fn handle_user_input(input_text: String, _replace_content: String) -> Result<(), &'static str> {
    use rdev::{simulate, EventType, Key, SimulateError};
    let send = |event_type: &EventType| {
        let delay = std::time::Duration::from_millis(25);
        match simulate(event_type) {
            Ok(()) => (),
            Err(SimulateError) => {
                println!("We could not send {:?}", event_type);
            }
        }
        // Let ths OS catchup (at least MacOS)
        std::thread::sleep(delay);
    };

    for _i in 0..input_text.len() {
        send(&EventType::KeyPress(Key::Backspace));
        send(&EventType::KeyRelease(Key::Backspace));
    }

    if cfg!(target_os = "macos") {
        send(&EventType::KeyPress(Key::MetaLeft));
        send(&EventType::KeyPress(Key::KeyV));
        send(&EventType::KeyRelease(Key::KeyV));
        send(&EventType::KeyRelease(Key::MetaLeft));
    } else {
        send(&EventType::KeyPress(Key::ControlLeft));
        send(&EventType::KeyPress(Key::KeyV));
        send(&EventType::KeyRelease(Key::KeyV));
        send(&EventType::KeyRelease(Key::ControlLeft));
    }
    Ok(())
}
