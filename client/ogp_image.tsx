import { ImageResponse } from "@vercel/og";
import { addDaysToDateText, dateTextToInstant } from "./diff.tsx";
import { parseUrl } from "./url.ts";

const WIDTH = 1200;
const HEIGHT = 630;

export function createOgImage(url: URL): ImageResponse {
  return new ImageResponse(
    <OgpImage url={url} />,
    {
      width: WIDTH,
      height: HEIGHT,
    },
  );
}

export function OgpImage({ url }: { url: URL }) {
  const parameter = parseUrl(url);
  const timezone = parameter.timezone ?? "UTC";
  const now = tryParseTemporalInstant(url.searchParams.get("now")) ??
    Temporal.Now.instant();
  const nowForText = now.toZonedDateTimeISO(timezone);
  const baseDateText = parameter.baseDate ??
    nowForText.toPlainDate().toString();
  const targetDateText = addDaysToDateText(baseDateText, parameter.plusDays);
  const targetDate = dateTextToInstant(targetDateText, timezone);
  const duration = now.until(targetDate).round({
    largestUnit: "day",
    smallestUnit: "second",
    roundingMode: "trunc",
  });
  const after = duration.sign < 0;
  const normalizedDuration = after ? duration.negated() : duration;

  return (
    <div
      style={{
        width: WIDTH,
        height: HEIGHT,
        display: "flex",
        background: "#000000",
        color: "#ffffff",
        padding: "40px 56px",
        flexDirection: "column",
        justifyContent: "center",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "baseline",
          flexWrap: "wrap",
          gap: "10px",
          lineHeight: 1.1,
          marginBottom: 14,
        }}
      >
        <span
          style={{
            fontSize: 60,
            fontWeight: 800,
          }}
        >
          {parameter.message}
        </span>
        {parameter.message && (
          <span
            style={{
              fontSize: 28,
              opacity: 0.82,
            }}
          >
            (
          </span>
        )}
        <span
          style={{
            fontSize: 56,
            fontWeight: 700,
          }}
        >
          {baseDateText}
        </span>
        <span
          style={{
            fontSize: 28,
            opacity: 0.82,
          }}
        >
          {parameter.message && <span>)</span>} から
        </span>
      </div>
      <div
        style={{
          display: "flex",
          alignItems: "baseline",
          flexWrap: "wrap",
          gap: "10px",
          lineHeight: 1.1,
          marginBottom: 22,
        }}
      >
        <span
          style={{
            fontSize: 62,
            fontWeight: 800,
          }}
        >
          {parameter.plusDays}
        </span>
        <span
          style={{
            fontSize: 28,
            opacity: 0.82,
          }}
        >
          日後 の (
        </span>
        <span
          style={{
            fontSize: 56,
            fontWeight: 700,
          }}
        >
          {targetDateText}
        </span>
        <span
          style={{
            fontSize: 28,
            opacity: 0.82,
          }}
        >
          ) まで
        </span>
      </div>
      <div
        style={{
          display: "flex",
          alignItems: "baseline",
          flexWrap: "wrap",
          gap: "8px",
          fontSize: 120,
          fontWeight: 800,
          lineHeight: 1,
          letterSpacing: "0.02em",
        }}
      >
        {!after && (
          <span
            style={{
              fontSize: 28,
              fontWeight: 600,
              opacity: 0.82,
            }}
          >
            あと
          </span>
        )}
        <span>{normalizedDuration.days}</span>
        <span
          style={{
            fontSize: 28,
            fontWeight: 600,
            opacity: 0.82,
          }}
        >
          日
        </span>
        <span>{normalizedDuration.hours}</span>
        <span
          style={{
            fontSize: 28,
            fontWeight: 600,
            opacity: 0.82,
          }}
        >
          時間
        </span>
        <span>{normalizedDuration.minutes}</span>
        <span
          style={{
            fontSize: 28,
            fontWeight: 600,
            opacity: 0.82,
          }}
        >
          分
        </span>
        <span>{normalizedDuration.seconds}</span>
        <span
          style={{
            fontSize: 28,
            fontWeight: 600,
            opacity: 0.82,
          }}
        >
          秒
        </span>
        {after && (
          <span
            style={{
              fontSize: 34,
              fontWeight: 600,
              opacity: 0.82,
            }}
          >
            経過
          </span>
        )}
      </div>
    </div>
  );
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
