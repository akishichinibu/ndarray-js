const { NdArray } = require("../main");
const chai = require('chai'), expect = chai.expect;


describe('Test base', () => {

    describe("buildAndAccess", () => {
        const H = 3;
        const W = 6;

        const s = NdArray.random([H, W], "d");
        s.show();

        it('AccessRight', () => {
            for (let i = 0; i < H; i++) {
                for (let j = 0; j < W; j++) {
                    expect(s.at(i, j)).to.be.equal(s.buffer[(i * W) + j]);
                }
            }
        });

        it('ReshapeAndAccessRight', () => {
            const s2 = s.reshape([H, 2, 3]);

            const _shape = s2.getShape();
            expect(_shape[0]).to.be.equal(H);
            expect(_shape[1]).to.be.equal(2);
            expect(_shape[2]).to.be.equal(3);

            s2.show();

            for (let i = 0; i < H; i++) {
                for (let j = 0; j < 2; j++) {
                    for (let k = 0; k < 3; k++) {
                        expect(s2.at(i, j, k)).to.be.equal(s2.buffer[i * 6 + j * 3 + k]);
                    }
                }
            }
        });
    })

    describe("binaryOperation", () => {
        const H = 30;
        const W = 60;

        const s = NdArray.ones([H, W, H, W], "d");

        s.add(4, true);
        s.flat();
    });


    describe("unaryOperationLarge", () => {
        const H = 30;
        const W = 60;

        const s = NdArray.random([H, W, H], "d");
        s.show();
        s.sin().show();
    });


    describe("binaryBoardcast", () => {
        const H = 3;
        const W = 6;
        const D = 9;

        const s1 = NdArray.ones([H, 1, W], "d");
        let s4 = NdArray.zeros([D, ], "d").fill(3);

        let s3;
        

        it('ErrorShape', () => {
            expect(() => {
                s3 = s1.add(s4);
            }).to.throw();
        });


        let s2 = s4.reshape([1, D, 1]);
        s3 = s1.add(s2);

        it('CanExecuteBoardcast', () => {
            const _shape = s3.getShape();
            expect(_shape[0]).to.be.equal(H);
            expect(_shape[1]).to.be.equal(D);
            expect(_shape[2]).to.be.equal(W);
        });


        it('CorrectValue', () => {
            for (let i = 0; i < H; i++) {
                for (let j = 0; j < D; j++) {
                    for (let k = 0; k < W; k++) {
                        expect(s3.at(i, j, k)).to.be.equal(4);
                    }
                }
            }
        });


        it('CannotInplace', () => {
            expect(() => {
                s1.add(s2, true);
            }).to.throw();
        });
    });
});
