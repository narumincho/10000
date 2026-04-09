import { renderToReadableStream } from "react-dom/server";
import { ImageResponse } from "@vercel/og";
import { Html } from "./html.tsx";
import { addDaysToDateText, dateTextToInstant } from "./client/diff.tsx";
import { ClockIconPng } from "./client/icon_png.tsx";
import { renderClockIconSvg } from "./client/icon_svg.tsx";
import { parseUrl } from "./client/url.ts";

const scriptName = (await Array.fromAsync(Deno.readDir("./dist/assets")))[0];

if (!scriptName) {
  throw new Error("client script not found");
}

const scriptContent = await Deno.readFile(`./dist/assets/${scriptName.name}`);

export default {
  async fetch(request) {
    const url = new URL(request.url);
    switch (url.pathname) {
      case "/":
        return new Response(
          await renderToReadableStream(
            <Html
              initialDate={Temporal.Now.instant()}
              url={url}
              scriptPath={scriptName.name}
            />,
          ),
          {
            headers: { "Content-Type": "text/html; charset=utf-8" },
          },
        );
      case `/${scriptName.name}`:
        return new Response(scriptContent, {
          headers: { "Content-Type": "application/javascript; charset=utf-8" },
        });
      case "/og-image":
        return createOgImage(url);
      case "/icon.png":
        return new ImageResponse(
          (
            <ClockIconPng
              parameter={parseUrl(url)}
              now={Temporal.Now.instant()}
            />
          ),
          {
            width: 256,
            height: 256,
            headers: {
              "Cache-Control": "public, max-age=604800, immutable",
            },
          },
        );
      case "/icon.svg":
        return new Response(
          renderClockIconSvg({
            parameter: parseUrl(url),
            now: Temporal.Now.instant(),
          }),
          {
            headers: {
              "Content-Type": "image/svg+xml; charset=utf-8",
              "Cache-Control": "public, max-age=604800, immutable",
            },
          },
        );
    }
    return new Response("Not Found", { status: 404 });
  },
} satisfies Deno.ServeDefaultExport;

function createOgImage(url: URL): ImageResponse {
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

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          background: "#000000",
          color: "#ffffff",
          padding: "56px 72px",
        }}
      >
        <div
          style={{
            width: "100%",
            height: "100%",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            border: "2px solid rgba(255,255,255,0.32)",
            padding: "44px 52px",
          }}
        >
          <div
            style={{
              display: "flex",
              fontSize: 56,
              fontWeight: 700,
              lineHeight: 1.2,
              marginBottom: 18,
              whiteSpace: "pre-wrap",
            }}
          >
            {`${parameter.message || "message"} (${baseDateText}) から`}
          </div>
          <div
            style={{
              display: "flex",
              fontSize: 48,
              lineHeight: 1.25,
              marginBottom: 28,
            }}
          >
            {`${parameter.plusDays} 日後 の (${targetDateText}) まで`}
          </div>
          <div
            style={{
              display: "flex",
              fontSize: 64,
              fontWeight: 800,
              lineHeight: 1.15,
              letterSpacing: "0.02em",
              whiteSpace: "pre-wrap",
            }}
          >
            {`${
              after ? "" : "あと"
            } ${normalizedDuration.days} 日 ${normalizedDuration.hours} 時間 ${normalizedDuration.minutes} 分 ${normalizedDuration.seconds} 秒 ${
              after ? "経過" : ""
            }`}
          </div>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    },
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
