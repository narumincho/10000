import { Temporal as TemporalPolyfill } from "@js-temporal/polyfill";

(globalThis as unknown as {
  Temporal?: typeof TemporalPolyfill;
}).Temporal ??= TemporalPolyfill;
