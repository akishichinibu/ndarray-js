import { expect } from "chai";

import sp from "src/shape";
import { IndexError } from "src/exception";
import { Shape } from "src/container";


test('a array with zero dimension', () => {
  expect(() => {
    sp.shape([]);
  }).to.throw(IndexError);
});


test('a array which all the dimensions are set to be one', () => {
  const s1 = sp.ones(5);
  for (let i = 0; i < 5; i++) expect(s1.at(i)).to.be.equal(1);
});


test("get shape from an array", async () => {
  const dummy = [
    [
      [1, 2, 3],
      [4, 5, 6],
    ],
  ]

  // expect(isScalar(dummy)).to.be.false;
  // expect(isScalar(dummy[0])).to.be.false;
  // expect(isScalar(dummy[0][0])).to.be.true;

  const s = await Shape.getShapeFromAnyArray(dummy);
  expect(Array.from(s)).to.have.ordered.members([1, 2, 3]);

  const ss = sp.shape(s);
  expect(ss.size).to.be.eq(6);

  const [i1, i2] = ss.linearIndex([[0, 1, 2], [0, 0, 1]]);
  expect(i1).to.be.eq(5);
  expect(i2).to.be.eq(1);
});


test("get shape from an array which is not unify", async () => {
  const dummy = [
    [
      [1, 2, 3],
      [4,],
    ],
    []
  ];

  const s = await Shape.getShapeFromAnyArray(dummy);
  expect(Array.from(s)).to.have.ordered.members([2, 2, 3]);
});


test("check if an array is unify", async () => {
  const dummy1 = [
    [1, 2, 3],
    [4, 5, 6],
  ];

  expect(await Shape.checkIfShapeUnify(dummy1, [2, 3])).to.be.true;
  expect(await Shape.checkIfShapeUnify(dummy1, [3, 3])).to.be.false;

  const dummy2 = [
    [1, 2, 3],
  ];

  expect(await Shape.checkIfShapeUnify(dummy2, [1, 3])).to.be.true;
  expect(await Shape.checkIfShapeUnify(dummy2, [2, 3])).to.be.false;

  const dummy3 = [
    [1,],
  ];

  expect(await Shape.checkIfShapeUnify(dummy3, [1, 1])).to.be.true;
  expect(await Shape.checkIfShapeUnify(dummy3, [1,])).to.be.false;

  const dummy4 = [
    [
      [1, 2, 3],
      [4,],
    ],
    []
  ];

  expect(await Shape.checkIfShapeUnify(dummy4, [2, 2, 3])).to.be.false;
  expect(await Shape.checkIfShapeUnify(dummy4, [3, 3, 3])).to.be.false;
});
