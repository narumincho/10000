import {
  type ClockTheme,
  defaultHandDesigns,
  defaultTheme,
  type HandDesigns,
  type OddHourNumberDisplay,
} from "./design_mode.tsx";
import {
  hour24HandDesignOptions,
  minuteHandDesignOptions,
  secondHandDesignOptions,
} from "./hand.tsx";

export type UrlParameter = {
  readonly message: string;
  readonly timezone: string | undefined;
  readonly targetDate: Temporal.Instant | undefined;
  readonly timeDifferenceVisible: boolean;
  readonly baseDate: string | undefined;
  readonly plusDays: number;
  readonly theme: ClockTheme;
  readonly handDesigns: HandDesigns;
  readonly oddHourNumberDisplay: OddHourNumberDisplay;
};

export function parseUrl(url: URL): UrlParameter {
  return {
    message: url.searchParams.get("message") ?? "",
    timezone: url.searchParams.get("timezone") ?? undefined,
    targetDate: tryParseTemporalInstant(url.searchParams.get("date")) ??
      undefined,
    timeDifferenceVisible: url.searchParams.get("diff") !== "hidden",
    baseDate: url.searchParams.get("baseDate") ?? undefined,
    plusDays: tryParseInteger(url.searchParams.get("plusDays")) ?? 0,
    theme: {
      background: url.searchParams.get("bg") ?? defaultTheme.background,
      dialStroke: url.searchParams.get("dialStroke") ?? defaultTheme.dialStroke,
      dialFill: url.searchParams.get("dialFill") ?? defaultTheme.dialFill,
      markers: url.searchParams.get("markers") ?? defaultTheme.markers,
      hourHand: url.searchParams.get("hourHandColor") ?? defaultTheme.hourHand,
      minuteHand: url.searchParams.get("minuteHandColor") ??
        defaultTheme.minuteHand,
      secondHand: url.searchParams.get("secondHandColor") ??
        defaultTheme.secondHand,
      infoText: url.searchParams.get("infoText") ?? defaultTheme.infoText,
      infoOutline: url.searchParams.get("infoOutline") ??
        defaultTheme.infoOutline,
    },
    handDesigns: {
      hour24: parseEnum(
        url.searchParams.get("hourHandDesign"),
        hour24HandDesignOptions,
        defaultHandDesigns.hour24,
      ),
      minute: parseEnum(
        url.searchParams.get("minuteHandDesign"),
        minuteHandDesignOptions,
        defaultHandDesigns.minute,
      ),
      second: parseEnum(
        url.searchParams.get("secondHandDesign"),
        secondHandDesignOptions,
        defaultHandDesigns.second,
      ),
    },
    oddHourNumberDisplay: parseEnum(
      url.searchParams.get("oddHourNumber"),
      ["same", "small", "hidden"] as const,
      "same",
    ),
  };
}

function tryParseTemporalInstant(
  value: string | null,
): Temporal.Instant | undefined {
  if (!value) {
    return undefined;
  }
  try {
    return Temporal.Instant.from(value);
  } catch {
    return undefined;
  }
}

export function encodeUrlParams(
  {
    message,
    timezone,
    targetDate,
    timeDifferenceVisible,
    baseDate,
    plusDays,
    theme,
    handDesigns,
    oddHourNumberDisplay,
    now,
  }: UrlParameter & { now?: Temporal.Instant },
): string {
  return `?${new URLSearchParams({
    ...(message ? { message } : {}),
    ...(timezone ? { timezone } : {}),
    ...(targetDate ? { date: targetDate.toString() } : {}),
    ...(!timeDifferenceVisible ? { diff: "hidden" } : {}),
    ...(baseDate ? { baseDate } : {}),
    ...(plusDays !== 0 ? { plusDays: plusDays.toString() } : {}),
    bg: theme.background,
    dialStroke: theme.dialStroke,
    dialFill: theme.dialFill,
    markers: theme.markers,
    hourHandColor: theme.hourHand,
    minuteHandColor: theme.minuteHand,
    secondHandColor: theme.secondHand,
    infoText: theme.infoText,
    infoOutline: theme.infoOutline,
    hourHandDesign: handDesigns.hour24,
    minuteHandDesign: handDesigns.minute,
    secondHandDesign: handDesigns.second,
    oddHourNumber: oddHourNumberDisplay,
    ...(now ? { now: now.toString() } : {}),
  })}`;
}

function parseEnum<T extends string>(
  value: string | null,
  options: readonly T[],
  fallback: T,
): T {
  if (value && options.includes(value as T)) {
    return value as T;
  }
  return fallback;
}

function tryParseInteger(value: string | null): number | undefined {
  if (!value) {
    return undefined;
  }
  const parsed = Number.parseInt(value, 10);
  if (Number.isNaN(parsed)) {
    return undefined;
  }
  return parsed;
}
