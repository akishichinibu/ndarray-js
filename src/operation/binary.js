import { ndArray } from "../ndarray"


ndArray.prototype.add = function(operand, inplace) {
    return this.binaryOperation((a, b) => { return a + b; }, operand, inplace);
}


ndArray.prototype.sub = function(operand, inplace) {
    return this.binaryOperation((a, b) => { return a - b; }, operand, inplace);
}


ndArray.prototype.mul = function(operand, inplace) {
    return this.binaryOperation((a, b) => { return a * b; }, operand, inplace);
}


ndArray.prototype.div = function(operand, inplace) {
    return this.binaryOperation((a, b) => { return a / b; }, operand, inplace);
}


ndArray.prototype.mod = function(operand, inplace) {
    return this.binaryOperation((a, b) => { return a % b; }, operand, inplace);
}


ndArray.prototype.shl = function(operand, inplace) {
    return this.binaryOperation((a, b) => { return a << b; }, operand, inplace);
}


ndArray.prototype.shr = function(operand, inplace) {
    return this.binaryOperation((a, b) => { return a >> b; }, operand, inplace);
}


ndArray.prototype.pow = function(operand, inplace) {
    return this.binaryOperation((a, b) => { return Math.pow(a, b); }, operand, inplace);
}
