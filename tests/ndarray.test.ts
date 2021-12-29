import { expect } from "chai";
import { nd } from "src/ndarray";


// test('a array whose elements are all 0', () => {
//   const Ss = [3, 6, 5, 3];
//   console.log(nd.zeros);
//   const s = nd.zeros(Ss);
//   for (let i = 0; i < s.size; i++) expect(s.buffer[i]).to.be.equal(0);
// });


// test('a array whose elements are all 1', () => {
//   const Ss = [3, 6, 5, 3];

//   const s = nd.ones(Ss);
//   for (let i = 0; i < s.size; i++) expect(s.buffer[i]).to.be.equal(1);
// });


// test('a array whose elements are random', () => {
//   const Ss = [3, 6, 5, 3];

//   const s = nd.random(Ss);
//   console.log(s.buffer);
// });


// test('the construction from a array', async () => {
//   const s = await nd.array([
//     [1, 2, 3],
//     [10, 20, 30],
//     [100, 200, 300],
//   ], "i32");

//   s.show();

//   expect(Array.from(s.shape)).to.have.ordered.members([3, 3]);

//   const bs = Array.from(s.buffer);
  
//   for (let i = 1; i <= 3; i++) {
//     expect(bs).to.have.include.members([i, i * 10, i * 100]);
//   }
// });


// test('flat a array and test if it can be accessed correctly', () => {
//   const H = 3;
//   const W = 6;

//   const s = nd.random([H, W]);
//   s.show();

//   const s2 = s.reshape([H, 2, 3]);
//   s2.show();

//   const flat_s2 = s.flat();

//   const _shape = s2.shape;
//   expect(_shape[0]).to.be.equal(H);
//   expect(_shape[1]).to.be.equal(2);
//   expect(_shape[2]).to.be.equal(3);

//   for (let i = 0; i < H; i++) {
//     for (let j = 0; j < 2; j++) {
//       for (let k = 0; k < 3; k++) {
//         expect(s2.at(i, j, k)).to.be.equal(flat_s2.at(i * 6 + j * 3 + k));
//       }
//     }
//   }
// });

test('inplace unary operation', () => {
  const H = 30;
  const W = 60;

  const s1 = nd.random([H, W, H, W,]);
  // s1.show();
  console.log("@@@", s1.buffer);

  const s3 = nd.sin(s1);
  console.log(s3.buffer);

  // for (let i = 0; i < size; i++) expect(Math.sin(s1.buffer[i])).to.be.equal(s3.buffer[i]);

  // const s2 = s3.cos();
  // s2.show();
  // for (let i = 0; i < size; i++) expect(s2.buffer[i]).to.be.equal(s3.buffer[i]);

  // const e2 = s3.equal(s2);
  // e2.show();
  // expect(e2.all()).to.be.true;
});


// test('array slice', () => {
//   const H = 3;
//   const W = 6;

//   const s1 = nd.random([H, W]);
//   s1.show();

//   const size = s1.size;

//   const s3 = nd.sin(s1);
//   for (let i = 0; i < size; i++) expect(Math.sin(s1.buffer[i])).to.be.equal(s3.buffer[i]);

//   const s2 = s3.cos();
//   s2.show();
//   for (let i = 0; i < size; i++) expect(s2.buffer[i]).to.be.equal(s3.buffer[i]);

//   const e2 = s3.equal(s2);
//   e2.show();
//   expect(e2.all()).to.be.true;
// });
