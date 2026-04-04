import { Clock24 } from "./client/clock.tsx";
import { parseUrl } from "./client/url.ts";

export function Html(
  { initialDate, url }: { initialDate: Temporal.Instant; url: URL },
) {
  return (
    <html style={{ height: "100%" }}>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body style={{ height: "100%", margin: 0 }}>
        <div
          id="app"
          data-initial-date={initialDate.epochMilliseconds}
          style={{ height: "100%" }}
        >
          <Clock24
            parameter={parseUrl(url)}
            initialInstant={initialDate}
            onChangeUrl={() => {}}
          />
        </div>
      </body>
    </html>
  );
}
