const { NdArray } = require("../main");
const chai = require('chai'), expect = chai.expect;
var Benchmark = require('benchmark');

const suite = new Benchmark.Suite;

(() => {
    const H = 30;
    const W = 60;
    const s = NdArray.ones([H, W, H, W], "d");

    suite.add('boardcast#add', function() {
        s.add(4, true);
    }).add("boardcast#sub", function() {
        s.sub(-5, true);
    }).add("boardcast#mul", function() {
        s.mul(7, true);
    }).add("boardcast#div", function() {
        s.div(3, true);
    }).add("boardcast#mod", function() {
        s.mod(17, true);
    })
    s.show();
})()

suite.run({ 'async': false });

// describe('benchmark basic', () => {

//     describe("large binary operation", () => {
        

//         describe("scalar boardcast", () => {
//             timer("add", () => {
                
//             });

//             timer("sub", () => {
//                 s.sub(-5, true);
//             });

//             timer("mul", () => {
//                 s.mul(7, true);
//             });

//             timer("div", () => {
//                 s.div(3, true);
//             });

//             timer("mod", () => {
//                 s.mod(17, true);
//             });

//             s.show();
//         });

//         describe("same size boardcast", () => {
//             const H = 30;
//             const W = 60;

//             const s1 = NdArray.random([H, W, H, W], "d");
//             const s2 = NdArray.random([H, W, H, W], "d");

//             let s3;

//             timer("add", () => {
//                 s3 = s1.add(s2);
//                 s.show();
//             });

//             timer("sub", () => {
//                 s3 = s1.sub(s2);
//             });

//             timer("mul", () => {
//                 s3 = s1.mul(s2);
//             });

//             timer("div", () => {
//                 s3 = s2.mul(100).round();
//                 s3.show();
//                 s3 = s1.div(s3);
//                 s3.show();
//             });
//         });
//     });
// });
