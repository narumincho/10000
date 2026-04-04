export type UrlParameter = {
  readonly message: string;
  readonly timezone: string | undefined;
  readonly targetDate: Temporal.Instant | undefined;
};

export function parseUrl(url: URL): UrlParameter {
  return {
    message: url.searchParams.get("message") ?? "",
    timezone: url.searchParams.get("timezone") ?? undefined,
    targetDate: tryParseTemporalInstant(url.searchParams.get("date")) ??
      undefined,
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

export function encodeUrl(
  { message, timezone, targetDate }: UrlParameter,
): string {
  return `?${new URLSearchParams({
    ...(message ? { message } : {}),
    ...(timezone ? { timezone } : {}),
    ...(targetDate ? { date: targetDate.toString() } : {}),
  })}`;
}
