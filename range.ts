console.log("32bit整数 符号付き", {
  min: new Date(-(2 ** 31) * 1000).toISOString(),
  max: new Date((2 ** 31 - 1) * 1000).toISOString(),
});

console.log("32bit整数 符号なし", {
  min: new Date(0).toISOString(),
  max: new Date((2 ** 32 - 1) * 1000).toISOString(),
});

// console.log("64bit整数 符号付き", {
//   min: Temporal.Instant.fromEpochNanoseconds(
//     -(2n ** 63n) * 1000n * 1000n * 1000n,
//   ),
//   max: Temporal.Instant.fromEpochNanoseconds(
//     (2n ** 63n - 1n) * 1000n * 1000n * 1000n,
//   ),
// });

console.log("Date", {
  min: new Date(-100_000_000 * 24 * 60 * 60 * 1000).toISOString(),
  max: new Date(100_000_000 * 24 * 60 * 60 * 1000).toISOString(),
});

console.log("Temporal", {
  min: Temporal.Instant.fromEpochNanoseconds(
    -100_000_000n * 24n * 60n * 60n * 1000n * 1000n * 1000n - 1n,
  ),
  max: Temporal.Instant.fromEpochNanoseconds(
    100_000_000n * 24n * 60n * 60n * 1000n * 1000n * 1000n,
  ),
});
