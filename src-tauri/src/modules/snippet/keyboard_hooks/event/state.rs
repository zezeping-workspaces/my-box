use device_query::{DeviceQuery, DeviceState, Keycode, MouseState};

#[derive(Debug, Clone)]
pub struct State {
    pub keys: Vec<Keycode>,
    pub mouse: MouseState,
}

impl State {
    pub fn from(device_state: &DeviceState) -> Self {
        Self {
            keys: device_state.get_keys(),
            mouse: device_state.get_mouse(),
        }
    }
    pub fn is_empty(&self) -> bool {
        self.keys().is_empty()
            && self
                .mouse()
                .button_pressed
                .iter()
                .filter(|&x| *x)
                .collect::<Vec<_>>()
                .is_empty()
    }
    pub fn contains_backspace_key(&self) -> bool {
        self.keys.contains(&Keycode::Backspace)
    }
    pub fn contains_shift_key(&self) -> bool {
        self.keys.contains(&Keycode::LShift) || self.keys.contains(&Keycode::RShift)
    }
    pub fn contains_control_key(&self) -> bool {
        self.keys.contains(&Keycode::LControl) || self.keys.contains(&Keycode::RControl)
    }
    pub fn contains_option_key(&self) -> bool {
        self.keys.contains(&Keycode::LOption) || self.keys.contains(&Keycode::ROption)
    }
    pub fn contains_command_key(&self) -> bool {
        self.keys.contains(&Keycode::Command)
    }
    pub fn contains_alt_key(&self) -> bool {
        self.keys.contains(&Keycode::LAlt) || self.keys.contains(&Keycode::RAlt)
    }
    pub fn contains_left_mouse_button(&self) -> bool {
        self.mouse.button_pressed[1]
    }
    pub fn contains_right_mouse_button(&self) -> bool {
        self.mouse.button_pressed[2]
    }
    pub fn contains_middle_mouse_button(&self) -> bool {
        self.mouse.button_pressed[3]
    }

    pub fn keys(&self) -> Vec<&Keycode> {
        self.keys.iter().collect()
    }
    pub fn mouse(&self) -> &MouseState {
        &self.mouse
    }
}
