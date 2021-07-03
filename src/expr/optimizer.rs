use super::parser::Expression;

pub struct ExpressionTokenTree {
    pub token: u8,
    pub operands: Option<Vec<ExpressionTokenTree>>,
}


impl ExpressionTokenTree {
    pub fn from_variable(code: u8) -> ExpressionTokenTree {
        ExpressionTokenTree {
            token: code,
            operands: None,
        }
    }
}