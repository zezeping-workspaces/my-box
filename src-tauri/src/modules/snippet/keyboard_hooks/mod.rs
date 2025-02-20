pub mod event;
use device_query::{DeviceState, Keycode};

pub fn watch_keyboard(callback: impl Fn(event::Event) + Send + 'static) {
    if let Some(device_state) = DeviceState::checked_new() {
        let mut prev_state: Option<event::State> = None;

        let on_key_down = move |key: Option<&Keycode>, state: &event::State| {
            let event = event::Event::new(state.clone(), key.map(|k| k.clone()));
            println!("pressed event: {:?}", event);
            callback(event);
        };
        let on_key_up = move |_key: Option<&Keycode>, _hook: &event::State| {};

        loop {
            let state = event::State::from(&device_state);
            // println!("device state: {:?} ", state.keys());
            // 处理按键按下
            {
                for key in state.keys() {
                    match prev_state {
                        Some(ref prev_state) => {
                            if !prev_state.keys.contains(key) {
                                on_key_down(Some(key), &state);
                            }
                        }
                        None => on_key_down(Some(key), &state),
                    }
                }
                // if state.contains_left_mouse_button() {
                //     match prev_state {
                //         Some(ref prev_state) => {
                //             if !prev_state.contains_left_mouse_button() {
                //                 on_key_down(None, &state);
                //             }
                //         }
                //         None => on_key_down(None, &state),
                //     }
                // }
                if state.contains_middle_mouse_button() {
                    match prev_state {
                        Some(ref prev_state) => {
                            if !prev_state.contains_middle_mouse_button() {
                                on_key_down(None, &state);
                            }
                        }
                        None => on_key_down(None, &state),
                    }
                }
                // if state.contains_right_mouse_button() {
                //     match prev_state {
                //         Some(ref prev_state) => {
                //             if !prev_state.contains_right_mouse_button() {
                //                 on_key_down(None, &state);
                //             }
                //         }
                //         None => on_key_down(None, &state),
                //     }
                // }
            }
            // 处理按键抬起
            {
                match prev_state {
                    Some(ref prev_state) => {
                        for pre_key in prev_state.keys() {
                            if !state.keys.contains(pre_key) {
                                on_key_up(Some(pre_key), &state);
                            }
                        }
                        // if prev_state.contains_left_mouse_button()
                        //     && !state.contains_left_mouse_button()
                        // {
                        //     on_key_up(None, &state);
                        // }
                        if prev_state.contains_middle_mouse_button()
                            && !state.contains_middle_mouse_button()
                        {
                            on_key_up(None, &state);
                        }
                        // if prev_state.contains_right_mouse_button()
                        //     && !state.contains_right_mouse_button()
                        // {
                        //     on_key_up(None, &state);
                        // }
                    }
                    None => (),
                }
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
