import { Temporal as TemporalPolyfill } from "@js-temporal/polyfill";

const temporalGlobal = globalThis as typeof globalThis & {
  Temporal?: typeof Temporal;
};

temporalGlobal.Temporal ??= TemporalPolyfill;
