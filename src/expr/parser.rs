use std::collections::hash_map::HashMap;
use std::collections::hash_set::HashSet;
use std::iter::FromIterator;

use wasm_bindgen::prelude::*;

use crate::utils::log;
use crate::utils::log_u32;

use super::scanner::Scanner;
use super::scanner::Token;
use super::scanner::TOKEN_CONSTANT;
use super::scanner::TOKEN_OPERATOR;
use super::scanner::TOKEN_SYMBOL;

use super::optimizer::ExpressionTokenTree;

use super::operator::OPERATOR_PROPERTY;
use super::operator::FUNCTION_TABLE;

const VARIABLE_OFFSET: u8 = 128;
const OPERATOR_OFFSET: u8 = 64;
const FUNCTION_OFFSET: u8 = 1;

const CODE_LEFT_PARENTHESIS: u8 = 53;
const CODE_RIGHT_PARENTHESIS: u8 = 54;


#[allow(dead_code)]
pub struct Expression<'a> {
    expr: &'a str,
    has_compiled: bool,

    token: Vec<Token<'a>>,
    result: Vec<u8>,

    constant_symbol_table: HashMap<String, String>,
    symbol_table: HashMap<String, u8>,
}


#[allow(dead_code)]
impl<'a> Expression<'a> {
    pub fn new(expr: &'a str) -> Expression {
        Expression {
            expr,
            has_compiled: false,

            token: Vec::new(),
            result: Vec::new(),

            constant_symbol_table: HashMap::new(),
            symbol_table: HashMap::new(),
        }
    }

    pub fn add_symbol(&mut self, symbol: &str) -> u8 {
        let index = self.symbol_table.len() as u8 + VARIABLE_OFFSET;
        self.symbol_table.insert(symbol.to_string(), index);
        return index;
    }

    pub fn add_constant_symbol(&mut self, value: &str) -> u8 {
        let index = self.symbol_table.len() as u8;
        let variable = format!("$inner_{}$", index);
        self.add_symbol(&variable);
        self.constant_symbol_table.insert(variable, value.to_string());
        return index;
    }

    pub fn tokenize(&mut self) -> usize {
        let ts = Scanner::new(self.expr);
        ts.for_each(|r| self.token.push(r));
        return self.token.len();
    }

    pub fn compile(&mut self) -> &Vec<u8> {
        let operator_index_map: HashMap<String, u8> = OPERATOR_PROPERTY
            .iter()
            .enumerate()
            .map(|(i, (v, _, __))| (v.to_string(), i as u8 + OPERATOR_OFFSET))
            .collect();

        let operator_priority_map: HashMap<u8, u8> = OPERATOR_PROPERTY
            .iter()
            .enumerate()
            .map(|(i, (_, p, _))| (i as u8 + OPERATOR_OFFSET, *p))
            .collect();

        let function_map: HashMap<String, u8> = FUNCTION_TABLE
            .iter()
            .enumerate()
            .map(|(i, (f, _))| (f.to_string(), i as u8 + FUNCTION_OFFSET))
            .collect();

        let n = self.token.len();
        let mut operator_stack: Vec<(u8, usize)> = Vec::with_capacity(n);

        for i in 0..n {
            let e = self.token.get(i).unwrap();
            let token = e.token;
            let ttype = e.ttype;
            let pos = e.pos;

            let tt = format!("{} {} {}", token, ttype, pos);
            log(&tt);
            match token {
                "(" => {
                    operator_stack.push((CODE_LEFT_PARENTHESIS, pos));
                }
                ")" => loop {
                    if operator_stack.len() == 0 {
                        panic!("The ')' in the pos {} is not matched with a '('. ", pos);
                    }
                    let (last_op, _) = operator_stack.pop().unwrap();
                    if last_op == CODE_LEFT_PARENTHESIS {
                        break;
                    }
                    self.result.push(last_op);
                },

                _ if ttype == TOKEN_CONSTANT => {
                    let index = self.add_constant_symbol(&token);
                    self.result.push(index);
                }

                _ if ttype == TOKEN_SYMBOL => {
                    if function_map.contains_key(token) {
                        let fun_index = function_map.get(token).unwrap();
                        operator_stack.push((*fun_index, pos));
                    } else {
                        let index = self.add_symbol(&token);
                        self.result.push(index);
                    }
                }

                _ if ttype == TOKEN_OPERATOR => {
                    let op_index = operator_index_map.get(token).unwrap();
                    let priority = operator_priority_map.get(op_index).unwrap();

                    let tt = format!(
                        "### {} {} {} {}",
                        token,
                        op_index,
                        priority,
                        operator_stack.len()
                    );
                    log(&tt);

                    while operator_stack.len() > 0 {
                        let (last_op, _) = operator_stack.last().unwrap();
                        let tt = format!("@@@ {}", last_op);
                        log(&tt);

                        if *last_op == CODE_LEFT_PARENTHESIS {
                            break;
                        }

                        let last_priority;

                        if *last_op < 50 {
                            last_priority = 128;
                        } else {
                            last_priority = *operator_priority_map.get(last_op).unwrap();
                        }

                        if priority > &last_priority {
                            break;
                        }

                        self.result.push(*last_op);
                        operator_stack.pop();
                    }

                    operator_stack.push((*op_index, pos));
                }

                _ => {
                    panic!("Unexpect token {}", token);
                }
            }
        }

        while operator_stack.len() > 0 {
            let (last_op, last_position) = operator_stack.pop().unwrap();

            if last_op == CODE_LEFT_PARENTHESIS {
                panic!(
                    "The '(' in the post {} is not match with ')'. ",
                    last_position
                );
            }

            self.result.push(last_op);
        }

        return &self.result;
    }

    pub fn build_expr_tree(&self) -> ExpressionTokenTree {
        let mut operand_stack: Vec<ExpressionTokenTree> = Vec::new();

        let operator_operands_map: HashMap<u8, u8> = OPERATOR_PROPERTY
            .iter()
            .enumerate()
            .map(|(i, (_, _, p))| (i as u8 + OPERATOR_OFFSET, *p))
            .collect();

        for opcode in self.result.iter() {
            match *opcode {
                _ if *opcode >= VARIABLE_OFFSET => {
                    let node = ExpressionTokenTree::from_variable(*opcode);
                    operand_stack.push(node);
                }
                _ if *opcode >= FUNCTION_OFFSET => {
                    let operand_num = *operator_operands_map.get(opcode).unwrap() as usize;
                    let n = operand_stack.len();

                    if n < operand_num {
                        panic!("failed");
                    }

                    let mut operands: Vec<ExpressionTokenTree> = Vec::with_capacity(operand_num);

                    for _ in (n - operand_num)..n {
                        let node = operand_stack.pop().unwrap();
                        operands.push(node);
                    }

                    let head_node = ExpressionTokenTree { 
                        token: *opcode,
                        operands: Some(operands),
                    };

                    operand_stack.push(head_node);
                }
                _ => {
                    panic!("failed");
                }
            }
        }

        if operand_stack.len() != 1 {
            panic!("failed");
        }

        let result = operand_stack.pop().unwrap();
        return result;
    }
}


// #[allow(dead_code)]
// #[wasm_bindgen]
// pub fn expr_parse(ptr: *mut u8, size: usize, opcodes: *mut u8, ) {
//     unsafe {
//         let expr = Vec::from_raw_parts(ptr, size, size);
//         let expr_str = String::from_utf8(expr).unwrap();
//         let mut _opcodes = Vec::from_raw_parts(opcodes, size, size);

//         let mut expr = Expression::new(&expr_str);
//         expr.tokenize();
//         expr.compile();

//         _result[0] = expr.result.len() as u8;
//         expr.result
//             .iter()
//             .enumerate()
//             .for_each(|(i, r)| _result[i + 1] = *r);

//         std::mem::forget(expr);
//         std::mem::forget(_result);
//     }
// }
