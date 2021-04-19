import { between, isScalar } from "../src/utils";
import { expect } from "chai";


test('test `between` ', () => {
  expect(between(1, 1, 2)).to.be.true;
  expect(between(2, 1, 2)).to.be.false;
  expect(between(1.5, 1, 2)).to.be.true;
  expect(between(3.5, 1, 2)).to.be.false;
  expect(between(1, 1, 1)).to.be.false;
  expect(between(2, 1, 1)).to.be.false;
});


test('test `isScalar`', () => {
  expect(isScalar(1)).to.be.true;
  expect(isScalar(1.5)).to.be.true;
  expect(isScalar(true)).to.be.true;
  expect(isScalar(false)).to.be.true;
  expect(isScalar(BigInt(10000000000000000000000000000000000000000))).to.be.true;

  expect(isScalar([1, 2, 3])).to.be.false;
  expect(isScalar([1, ])).to.be.false;
  expect(isScalar(new Map([[1, 2], ]))).to.be.false;
});
