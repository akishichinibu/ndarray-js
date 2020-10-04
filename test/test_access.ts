// import { NdArray, NumericType } from "../src/main";
// import { describe, it } from "mocha";
// import { expect } from "chai";


// describe("#access", () => {
//     const H = 3;
//     const W = 6;

//     const s = NdArray.random([H, W], NumericType.D);
//     s.show();

//     const flat_s = s.flat();

//     it('AccessRight', () => {
//         for (let i = 0; i < H; i++) {
//             for (let j = 0; j < W; j++) {
//                 expect(s.at(i, j)).to.be.equal(flat_s.at((i * W) + j));
//             }
//         }
//     });

//     it('ReshapeAndAccessRight', () => {
//         const s2 = s.reshape([H, 2, 3]);
//         s2.show();

//         const flat_s2 = s.flat();

//         const _shape = s2.getShape();
//         expect(_shape[0]).to.be.equal(H);
//         expect(_shape[1]).to.be.equal(2);
//         expect(_shape[2]).to.be.equal(3);

//         s2.show();

//         for (let i = 0; i < H; i++) {
//             for (let j = 0; j < 2; j++) {
//                 for (let k = 0; k < 3; k++) {
//                     expect(s2.at(i, j, k)).to.be.equal(flat_s2.at(i * 6 + j * 3 + k));
//                 }
//             }
//         }
//     });
// });
