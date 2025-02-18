pub mod event;
use device_query::{DeviceState, Keycode};

pub fn watch_keyboard(callback: impl Fn(event::Event) + Send + 'static) {
    if let Some(device_state) = DeviceState::checked_new() {
        let mut prev_state: Option<event::State> = None;

        let on_key_down = move |key: &Keycode, state: &event::State| {
            let event = event::Event::new(state.clone(), key.clone());
            println!("pressed event: {:?}", event);
            callback(event);
        };
        let on_key_up = move |_key: &Keycode, _hook: &event::State| {};

        loop {
            let state = event::State::from(&device_state);
            // println!("device state: {:?} ", state.keys());
            for key in state.keys() {
                match prev_state {
                    Some(ref prev_state) => {
                        if !prev_state.keys.contains(key) {
                            on_key_down(key, &state);
                        }
                    }
                    None => on_key_down(key, &state),
                }
            }
            match prev_state {
                Some(ref prev_state) => {
                    for pre_key in prev_state.keys() {
                        if !state.keys.contains(pre_key) {
                            on_key_up(pre_key, &state);
                        }
                    }
                }
                None => (),
            }
            prev_state = Some(state);

            if let Some(ref state) = prev_state {
                let ms = if state.is_empty() { 50 } else { 20 };
                std::thread::sleep(std::time::Duration::from_millis(ms));
            }

            // callback((keys, mouse_buttons));
        }
    }
    std::thread::park();
}
