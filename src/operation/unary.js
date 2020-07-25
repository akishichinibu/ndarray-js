import { ndArray } from "../ndarray"


ndArray.prototype.sin = function(inplace) {
    return this.unaryOperation(Math.sin, inplace);
}


ndArray.prototype.cos = function(inplace) {
    return this.unaryOperation(Math.cos, inplace);
}


ndArray.prototype.tan = function(inplace) {
    return this.unaryOperation(Math.tan, inplace);
}


ndArray.prototype.exp = function(inplace) {
    return this.unaryOperation(Math.exp, inplace);
}


ndArray.prototype.log = function(inplace) {
    return this.unaryOperation(Math.log, inplace);
}


ndArray.prototype.log2 = function(inplace) {
    return this.unaryOperation(Math.log2, inplace);
}


ndArray.prototype.log10 = function(inplace) {
    return this.unaryOperation(Math.log10, inplace);
}


ndArray.prototype.round = function(inplace) {
    return this.unaryOperation(Math.round, inplace);
}


ndArray.prototype.floor = function(inplace) {
    return this.unaryOperation(Math.floor, inplace);
}


ndArray.prototype.abs = function(inplace) {
    return this.unaryOperation(Math.abs, inplace);
}


ndArray.prototype.sign = function(inplace) {
    return this.unaryOperation(Math.sign, inplace);
}


ndArray.prototype.sqr = function(inplace) {
    return this.unaryOperation((a) => { a * a }, inplace);
}


ndArray.prototype.sqrt = function(inplace) {
    return this.unaryOperation(Math.sqrt, inplace);
}
