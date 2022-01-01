import { expect } from "chai";
import { nd } from "src";


test('a array whose elements are all 0', async () => {
  const Ss = [3, 6, 5, 3];
  const s = await nd.zeros(Ss);
  expect(s.size).to.be.equal(Ss.reduce((prev, cur) => prev * cur, 1));
  for (let i = 0; i < s.size; i++) expect(s.buffer[i]).to.be.equal(0);
  s.free();
});


test('a array whose elements are all 1', async () => {
  const Ss = [3, 6, 5, 3];

  const s = await nd.ones(Ss);
  for (let i = 0; i < s.size; i++) expect(s.buffer[i]).to.be.equal(1);
  s.free();
});


test('the construction from a array', async () => {
  const s = await nd.array([
    [1, 2, 3],
    [10, 20, 30],
    [100, 200, 300],
  ], "i32");

  s.show();

  expect(Array.from(s.shape)).to.have.ordered.members([3, 3]);
  expect(s.at(1, 2)).to.be.eq(30);
  const bs = Array.from(s.buffer);

  for (let i = 1; i <= 3; i++) {
    expect(bs).to.have.include.members([i, i * 10, i * 100]);
  }

  s.free();
});


test('flat a array and test if it can be accessed correctly', async () => {
  const H = 3;
  const W = 6;

  const s = await nd.random([H, W]);
  s.show();

  const s2 = s.reshape([H, 2, 3]);
  s2.show();

  const flat_s2 = s.flat();

  const _shape = s2.shape;
  console.log(_shape);
  expect(_shape[0]).to.be.equal(H);
  expect(_shape[1]).to.be.equal(2);
  expect(_shape[2]).to.be.equal(3);

  for (let i = 0; i < H; i++) {
    for (let j = 0; j < 2; j++) {
      for (let k = 0; k < 3; k++) {
        expect(s2.at(i, j, k)).to.be.equal(flat_s2.at(i * 6 + j * 3 + k));
      }
    }
  }
});


test('inplace unary operation', async () => {
  const H = 65;
  const W = 65;

  const s1 = await nd.random([H, W,], { maxValue: (1 << 31) });
  const s2 = await nd.random([H, 1,]);
  s1.show();

  const s3 = await nd.sin(s1);
  s3.show();

  const s4 = await s3.add(5);
  s4.show();

  const s5 = await s4.add(s2);
  s5.show();
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
