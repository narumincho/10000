import { Clock24 } from "./client/clock.tsx";
import { encodeUrlParams, parseUrl } from "./client/url.ts";

export function Html(
  { initialDate, url, scriptPath }: {
    initialDate: Temporal.Instant;
    url: URL;
    scriptPath: string;
  },
) {
  const parameter = parseUrl(url);
  return (
    <html style={{ height: "100%" }}>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link
          rel="icon"
          type="image/svg+xml"
          href={`/icon.svg${
            encodeUrlParams({ ...parameter, now: initialDate })
          }`}
        />
        {
          /* <link
          rel="icon"
          type="image/png"
          href={`/icon.png${
            encodeUrlParams({ ...parameter, now: initialDate })
          }`}
        /> */
        }
        <meta
          property="og:image"
          content={`/og-image${
            encodeUrlParams({ ...parameter, now: initialDate })
          }`}
        />
        <script type="module" src={scriptPath} />
      </head>
      <body style={{ height: "100%", margin: 0 }}>
        <div
          id="app"
          data-initial-date={initialDate.epochMilliseconds}
          style={{ height: "100%" }}
        >
          <Clock24
            parameter={parameter}
            initialInstant={initialDate}
            onChangeUrl={() => {}}
          />
        </div>
      </body>
    </html>
  );
}
