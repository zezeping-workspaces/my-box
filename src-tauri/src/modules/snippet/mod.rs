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
