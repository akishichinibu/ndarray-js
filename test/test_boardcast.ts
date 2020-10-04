// import { describe, it } from "mocha";
// import { expect } from "chai";
// import { NdArray, NumericType } from "../src/main";


// describe("binaryBoardcast", () => {
//     const H = 3;
//     const W = 6;
//     const D = 9;

//     const s1 = NdArray.ones([H, 1, W], NumericType.D);
//     let s4 = NdArray.zeros([D, ], NumericType.D).fill(3);

//     let s3;

//     it('ErrorShape', () => {
//         expect(() => {
//             s3 = s1.add(s4);
//         }).to.throw();
//     });


//     let s2 = s4.reshape([1, D, 1]);
//     s3 = s1.add(s2);

//     it('CanExecuteBoardcast', () => {
//         const _shape = s3.getShape();
//         expect(_shape[0]).to.be.equal(H);
//         expect(_shape[1]).to.be.equal(D);
//         expect(_shape[2]).to.be.equal(W);
//     });


//     it('CorrectValue', () => {
//         for (let i = 0; i < H; i++) {
//             for (let j = 0; j < D; j++) {
//                 for (let k = 0; k < W; k++) {
//                     expect(s3.at(i, j, k)).to.be.equal(4);
//                 }
//             }
//         }
//     });

//     it('CannotInplace', () => {
//         expect(() => {
//             s1.add(s2, true);
//         }).to.throw();
//     });
// });
