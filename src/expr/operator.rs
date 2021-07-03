
#[allow(dead_code)]
pub const OPERATOR_PROPERTY: [(&'static str, u8, u8); 12] = [
    ("+", 0, 2),
    ("-", 0, 2),
    ("*", 1, 2),
    ("/", 1, 2),
    ("%", 2, 2),
    ("^", 2, 2),
    ("&", 1, 2),
    ("|", 1, 2),
    ("!", 3, 1),
    ("~", 3, 1),
    ("||", 0, 2),
    ("&&", 0, 2),
];


#[allow(dead_code)]
pub const FUNCTION_TABLE: [(&'static str, u8); 8] = [
    ("sin", 1),
    ("cos", 1),
    ("tan", 1),
    ("sinh", 1),
    ("cosh", 1),
    ("tanh", 1),
    ("exp", 1),
    ("log", 1),
];
