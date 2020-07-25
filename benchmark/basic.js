const array = require("../src/main");
const { timer } = require("../src/utils");
const chai = require('chai'), expect = chai.expect;

describe('benchmark basic', () => {

    describe("large binary operation", () => {
        const H = 30;
        const W = 60;
        const s = array.ndArray.ones([H, W, H, W], "d");

        describe("scalar boardcast", () => {
            timer("add", () => {
                s.add(4, true);
            });

            timer("sub", () => {
                s.sub(-5, true);
            });

            timer("mul", () => {
                s.mul(7, true);
            });

            timer("div", () => {
                s.div(3, true);
            });

            timer("mod", () => {
                s.mod(17, true);
            });

            s.show();
        });

        describe("same size boardcast", () => {
            const H = 30;
            const W = 60;

            const s1 = array.ndArray.random([H, W, H, W], "d");
            const s2 = array.ndArray.random([H, W, H, W], "d");

            let s3;

            timer("add", () => {
                s3 = s1.add(s2);
                s.show();
            });

            timer("sub", () => {
                s3 = s1.sub(s2);
            });

            timer("mul", () => {
                s3 = s1.mul(s2);
            });

            timer("div", () => {
                s3 = s2.mul(100).round();
                s3.show();
                s3 = s1.div(s3);
                s3.show();
            });
        });
    });
});
