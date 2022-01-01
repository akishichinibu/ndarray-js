import { expect } from "chai";
import { nd } from "src";
import core from "src/core";
import { timer } from "src/utils";

const case1 = async () => {
  const H = 30;
  const W = 60;

  core.memory.grow(1 << 10);

  const a1 = await nd.random([H, W, H, W, H], { dtype: "i8", maxValue: (1 << 7) });
  const a2 = await nd.random([H, 1, 1, W, H], { dtype: "f64", maxValue: (1 << 30) });

  console.log(a1.size);
  console.log(a1.byteLength);

  const [_, dt1] = await timer(async () => {
    const b1 = await nd.sin(a1);
  })();

  console.log(dt1);

  const [__, dt2] = await timer(async () => {
    const b1 = await a1.add(4);
    const b2 = await b1.add(a2);
  })();

  console.log(dt2);
}

case1();
