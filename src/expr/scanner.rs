pub const TOKEN_OPERATOR: u8 = 1;
pub const TOKEN_CONSTANT: u8 = 2;
pub const TOKEN_SYMBOL: u8 = 3;


fn between(x: char, l: char, r: char) -> bool {
    return (l <= x) && (x < r);
}


fn is_number(c: char) -> bool {
    return between(c, 48 as char, 58 as char);
}


fn is_alphabet(c: char) -> bool {
    return between(c, 65 as char, 91 as char) || between(c, 97 as char, 123 as char);
}


fn is_variable_token(c: char) -> bool {
    return is_number(c) || is_alphabet(c) || c == '_' || c == '@';
}


pub struct Token<'a> {
    pub token: &'a str,
    pub ttype: u8,
    pub pos: usize,
}


pub struct Scanner<'a> {
    expr: &'a str,
    t: usize,
}


impl<'a> Scanner<'a> {
    pub fn new(expr: &'a str) -> Scanner<'a> {
        Scanner { expr, t: 0 }
    }
}


impl<'a> Iterator for Scanner<'a> {
    type Item = Token<'a>;

    fn next(&mut self) -> Option<Self::Item> {
        let n = self.expr.len();
        let expr_bytes = self.expr.as_bytes();

        while self.t < n {
            let mut c = expr_bytes[self.t] as char;
            match c {
                ' ' => {
                    self.t += 1;
                    continue;
                }
                '(' | ')' | '+' | '-' | '*' | '/' | '%' | '^' => {
                    let slice = &self.expr[self.t..=self.t];
                    let snap = Token {
                        token: slice,
                        ttype: TOKEN_OPERATOR,
                        pos: self.t,
                    };
                    self.t += 1;
                    return Some(snap);
                }
                '&' | '|' => {
                    let head = self.t;
                    let mut prev = c;
                    loop {
                        self.t += 1;
                        if self.t >= n {
                            break;
                        }
                        prev = c;
                        c = expr_bytes[self.t] as char;
                        if c != prev {
                            break;
                        }
                    }
                    let slice = &self.expr[head..self.t];
                    let snap = Token {
                        token: slice,
                        ttype: TOKEN_OPERATOR,
                        pos: head,
                    };
                    return Some(snap);
                }
                _ if is_number(c) => {
                    let head = self.t;
                    loop {
                        self.t += 1;
                        if self.t >= n {
                            break;
                        }
                        c = expr_bytes[self.t] as char;
                        if !is_number(c) {
                            break;
                        }
                    }
                    let slice = &self.expr[head..self.t];
                    let snap = Token {
                        token: slice,
                        ttype: TOKEN_CONSTANT,
                        pos: head,
                    };
                    return Some(snap);
                }
                _ if is_alphabet(c) => {
                    let head = self.t;
                    loop {
                        self.t += 1;
                        if self.t >= n {
                            break;
                        }
                        c = expr_bytes[self.t] as char;
                        if !is_variable_token(c) {
                            break;
                        }
                    }
                    let slice = &self.expr[head..self.t];
                    let snap = Token {
                        token: slice,
                        ttype: TOKEN_SYMBOL,
                        pos: head,
                    };
                    return Some(snap);
                }
                _ => {
                    panic!("Unknown token {} in pos {}. ", c, self.t);
                }
            }
        }
        return None;
    }
}
