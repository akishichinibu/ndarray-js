import { expect } from "chai";

import { Shape, sp } from "@src/shape";
import { IndexError } from "@src/exception";
import { isScalar } from "@src/utils";


test('a array with zero dimension', () => {
  expect(() => {
    const s1 = sp.shape([]);
  }).to.throw(IndexError);
});


test('a array which all the dimensions are set to be one', () => {
  const s1 = sp.ones(5);
  for (let i = 0; i < 5; i++) expect(s1.at(i)).to.be.equal(1);
});


test("GetShapeFromDummy1", () => {
  const dummy = [
    [1, 2, 3],
    [4, 5, 6],
  ]

  expect(isScalar(dummy)).to.be.false;
  expect(isScalar(dummy[0])).to.be.false;
  expect(isScalar(dummy[0][0])).to.be.true;

  const s = Shape.getShapeFromDummy(dummy);
  expect(Array.from(s)).to.have.ordered.members([2, 3]);
});


test("GetShapeFromDummy2", () => {
  const dummy = [
    [
      [1, 2, 3],
      [4,],
    ],
    []
  ];

  const s = Shape.getShapeFromDummy(dummy);
  expect(Array.from(s)).to.have.ordered.members([2, 2, 3]);
});


test("CheckShapeUnify1", () => {
  const dummy1 = [
    [1, 2, 3],
    [4, 5, 6],
  ];
  
  expect(Shape.checkShapeUnify(dummy1, [2, 3])).to.be.true;
  expect(Shape.checkShapeUnify(dummy1, [3, 3])).to.be.false;

  const dummy2 = [
    [1, 2, 3],
  ];

  expect(Shape.checkShapeUnify(dummy2, [1, 3])).to.be.true;
  expect(Shape.checkShapeUnify(dummy2, [2, 3])).to.be.false;

  const dummy3 = [
    [1, ],
  ];

  expect(Shape.checkShapeUnify(dummy3, [1, 1])).to.be.true;
  expect(Shape.checkShapeUnify(dummy3, [1, ])).to.be.false;
});


test("CheckShapeUnify2", () => {
  const dummy = [
    [
      [1, 2, 3],
      [4,],
    ],
    []
  ];

  expect(Shape.checkShapeUnify(dummy, [2, 2, 3])).to.be.false;
  expect(Shape.checkShapeUnify(dummy, [3, 3, 3])).to.be.false;
});
