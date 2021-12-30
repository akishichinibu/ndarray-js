# array-js

A n dim array library writen in Typescript and AssemblyScript, utilizing the wasm and WebGL for high-performance computation in browser. 

Still under development...

A expression parser and evaluator: 

```typescript
const a = nd.random([H, W, ], { maxValue: (1 << 31) });
const b = nd.random([H, W, ], { maxValue: 1 });
const result = ndeval`sin(${a} + 3) * exp(${b})`;
```

and a multi-demension ndarray container: 

```typescript
test('unary operation', async () => {
  const H = 6000;
  const W = 6000;

  const s1 = nd.random([H, W, ], { maxValue: (1 << 31) });
  const s3 = await nd.sin(s1);
  const s4 = await s3.add(5);
});
```
