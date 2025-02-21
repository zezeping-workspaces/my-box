mod state;
pub use state::State;

use device_query::Keycode;

#[derive(Debug, Clone)]
pub struct Event {
    pub state: State,
    pub key: Option<Keycode>,
}

impl Event {
    pub fn new(state: State, key: Option<Keycode>) -> Self {
        Self { state, key }
    }
    pub fn contains_backspace_key(&self) -> bool {
        self.state.contains_backspace_key()
    }
    pub fn contains_shift_key(&self) -> bool {
        self.state.contains_shift_key()
    }
    pub fn contains_control_key(&self) -> bool {
        self.state.contains_control_key()
    }
    pub fn contains_option_key(&self) -> bool {
        self.state.contains_option_key()
    }
    pub fn contains_command_key(&self) -> bool {
        self.state.contains_command_key()
    }
    pub fn contains_alt_key(&self) -> bool {
        self.state.contains_alt_key()
    }
    pub fn contains_left_mouse_button(&self) -> bool {
        self.state.contains_left_mouse_button()
    }
    pub fn contains_right_mouse_button(&self) -> bool {
        self.state.contains_right_mouse_button()
    }
    pub fn contains_middle_mouse_button(&self) -> bool {
        self.state.contains_middle_mouse_button()
    }

    // 将key转换为大小写
    pub fn key_string(&self) -> Option<String> {
        if let Some(key) = &self.key {
            match key {
                Keycode::A => {
                    if self.contains_shift_key() {
                        Some("A".to_string())
                    } else {
                        Some("a".to_string())
                    }
                }
                Keycode::B => {
                    if self.contains_shift_key() {
                        Some("B".to_string())
                    } else {
                        Some("b".to_string())
                    }
                }
                Keycode::C => {
                    if self.contains_shift_key() {
                        Some("C".to_string())
                    } else {
                        Some("c".to_string())
                    }
                }
                Keycode::D => {
                    if self.contains_shift_key() {
                        Some("D".to_string())
                    } else {
                        Some("d".to_string())
                    }
                }
                Keycode::E => {
                    if self.contains_shift_key() {
                        Some("E".to_string())
                    } else {
                        Some("e".to_string())
                    }
                }
                Keycode::F => {
                    if self.contains_shift_key() {
                        Some("F".to_string())
                    } else {
                        Some("f".to_string())
                    }
                }
                Keycode::G => {
                    if self.contains_shift_key() {
                        Some("G".to_string())
                    } else {
                        Some("g".to_string())
                    }
                }
                Keycode::H => {
                    if self.contains_shift_key() {
                        Some("H".to_string())
                    } else {
                        Some("h".to_string())
                    }
                }
                Keycode::I => {
                    if self.contains_shift_key() {
                        Some("I".to_string())
                    } else {
                        Some("i".to_string())
                    }
                }
                Keycode::J => {
                    if self.contains_shift_key() {
                        Some("J".to_string())
                    } else {
                        Some("j".to_string())
                    }
                }
                Keycode::K => {
                    if self.contains_shift_key() {
                        Some("K".to_string())
                    } else {
                        Some("k".to_string())
                    }
                }
                Keycode::L => {
                    if self.contains_shift_key() {
                        Some("L".to_string())
                    } else {
                        Some("l".to_string())
                    }
                }
                Keycode::M => {
                    if self.contains_shift_key() {
                        Some("M".to_string())
                    } else {
                        Some("m".to_string())
                    }
                }
                Keycode::N => {
                    if self.contains_shift_key() {
                        Some("N".to_string())
                    } else {
                        Some("n".to_string())
                    }
                }
                Keycode::O => {
                    if self.contains_shift_key() {
                        Some("O".to_string())
                    } else {
                        Some("o".to_string())
                    }
                }
                Keycode::P => {
                    if self.contains_shift_key() {
                        Some("P".to_string())
                    } else {
                        Some("p".to_string())
                    }
                }
                Keycode::Q => {
                    if self.contains_shift_key() {
                        Some("Q".to_string())
                    } else {
                        Some("q".to_string())
                    }
                }
                Keycode::R => {
                    if self.contains_shift_key() {
                        Some("R".to_string())
                    } else {
                        Some("r".to_string())
                    }
                }
                Keycode::S => {
                    if self.contains_shift_key() {
                        Some("S".to_string())
                    } else {
                        Some("s".to_string())
                    }
                }
                Keycode::T => {
                    if self.contains_shift_key() {
                        Some("T".to_string())
                    } else {
                        Some("t".to_string())
                    }
                }
                Keycode::U => {
                    if self.contains_shift_key() {
                        Some("U".to_string())
                    } else {
                        Some("u".to_string())
                    }
                }
                Keycode::V => {
                    if self.contains_shift_key() {
                        Some("V".to_string())
                    } else {
                        Some("v".to_string())
                    }
                }
                Keycode::W => {
                    if self.contains_shift_key() {
                        Some("W".to_string())
                    } else {
                        Some("w".to_string())
                    }
                }
                Keycode::X => {
                    if self.contains_shift_key() {
                        Some("X".to_string())
                    } else {
                        Some("x".to_string())
                    }
                }
                Keycode::Y => {
                    if self.contains_shift_key() {
                        Some("Y".to_string())
                    } else {
                        Some("y".to_string())
                    }
                }
                Keycode::Z => {
                    if self.contains_shift_key() {
                        Some("Z".to_string())
                    } else {
                        Some("z".to_string())
                    }
                }
                Keycode::Key1 => {
                    if self.contains_shift_key() {
                        Some("!".to_string())
                    } else {
                        Some("1".to_string())
                    }
                }
                Keycode::Key2 => {
                    if self.contains_shift_key() {
                        Some("@".to_string())
                    } else {
                        Some("2".to_string())
                    }
                }
                Keycode::Key3 => {
                    if self.contains_shift_key() {
                        Some("#".to_string())
                    } else {
                        Some("3".to_string())
                    }
                }
                Keycode::Key4 => {
                    if self.contains_shift_key() {
                        Some("$".to_string())
                    } else {
                        Some("4".to_string())
                    }
                }
                Keycode::Key5 => {
                    if self.contains_shift_key() {
                        Some("%".to_string())
                    } else {
                        Some("5".to_string())
                    }
                }
                Keycode::Key6 => {
                    if self.contains_shift_key() {
                        Some("^".to_string())
                    } else {
                        Some("6".to_string())
                    }
                }
                Keycode::Key7 => {
                    if self.contains_shift_key() {
                        Some("&".to_string())
                    } else {
                        Some("7".to_string())
                    }
                }
                Keycode::Key8 => {
                    if self.contains_shift_key() {
                        Some("*".to_string())
                    } else {
                        Some("8".to_string())
                    }
                }
                Keycode::Key9 => {
                    if self.contains_shift_key() {
                        Some("(".to_string())
                    } else {
                        Some("9".to_string())
                    }
                }
                Keycode::Key0 => {
                    if self.contains_shift_key() {
                        Some(")".to_string())
                    } else {
                        Some("0".to_string())
                    }
                }
                Keycode::Grave => {
                    if self.contains_shift_key() {
                        Some("~".to_string())
                    } else {
                        Some("`".to_string())
                    }
                }
                Keycode::Minus => {
                    if self.contains_shift_key() {
                        Some("_".to_string())
                    } else {
                        Some("-".to_string())
                    }
                }
                Keycode::Equal => {
                    if self.contains_shift_key() {
                        Some("+".to_string())
                    } else {
                        Some("=".to_string())
                    }
                }
                Keycode::LeftBracket => {
                    if self.contains_shift_key() {
                        Some("{".to_string())
                    } else {
                        Some("[".to_string())
                    }
                }
                Keycode::RightBracket => {
                    if self.contains_shift_key() {
                        Some("}".to_string())
                    } else {
                        Some("]".to_string())
                    }
                }
                Keycode::BackSlash => {
                    if self.contains_shift_key() {
                        Some("|".to_string())
                    } else {
                        Some(r#"\"#.to_string())
                    }
                }
                Keycode::Semicolon => {
                    if self.contains_shift_key() {
                        Some(": ".to_string())
                    } else {
                        Some(";".to_string())
                    }
                }
                Keycode::Apostrophe => {
                    if self.contains_shift_key() {
                        Some(r#"""#.to_string())
                    } else {
                        Some("'".to_string())
                    }
                }
                Keycode::Comma => {
                    if self.contains_shift_key() {
                        Some("<".to_string())
                    } else {
                        Some(",".to_string())
                    }
                }
                Keycode::Dot => {
                    if self.contains_shift_key() {
                        Some(">".to_string())
                    } else {
                        Some(".".to_string())
                    }
                }
                Keycode::Slash => {
                    if self.contains_shift_key() {
                        Some("?".to_string())
                    } else {
                        Some("/".to_string())
                    }
                }
                Keycode::Numpad0 => Some("0".to_string()),
                Keycode::Numpad1 => Some("1".to_string()),
                Keycode::Numpad2 => Some("2".to_string()),
                Keycode::Numpad3 => Some("3".to_string()),
                Keycode::Numpad4 => Some("4".to_string()),
                Keycode::Numpad5 => Some("5".to_string()),
                Keycode::Numpad6 => Some("6".to_string()),
                Keycode::Numpad7 => Some("7".to_string()),
                Keycode::Numpad8 => Some("8".to_string()),
                Keycode::Numpad9 => Some("9".to_string()),
                Keycode::Space => Some(" ".to_string()),
                Keycode::Tab => Some("\t".to_string()),
                Keycode::Enter => Some("\n".to_string()),
                _ => None,
            }
        } else {
            None
        }
    }
    pub fn to_json(&self) -> serde_json::Value {
        serde_json::json!({
            "key": self.key_string(),
            "backspace": self.contains_backspace_key(),
            "shift": self.contains_shift_key(),
            "ctrl": self.contains_control_key(),
            "option": self.contains_option_key(),
            "alt": self.contains_alt_key(),
            "command": self.contains_command_key(),
            "left_mouse": self.contains_left_mouse_button(),
            "right_mouse": self.contains_right_mouse_button(),
            "middle_mouse": self.contains_middle_mouse_button(),
        })
    }
}
