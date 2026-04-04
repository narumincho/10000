import React from "react";
import { renderToReadableStream } from "react-dom/server";
import { ImageResponse } from "@vercel/og";
import { Clock24 } from "./client/clock.tsx";
import { parseUrl } from "./client/url.ts";
import dist from "./dist.json" with { type: "json" };

export default {
  async fetch(request) {
    const url = new URL(request.url);
    switch (url.pathname) {
      case "/":
        return new Response(
          await renderToReadableStream(
            <Html initialDate={Temporal.Now.instant()} url={url} />,
            {
              bootstrapModules: [`/client-${dist.clientHash}`],
            },
          ),
          {
            headers: { "Content-Type": "text/html; charset=utf-8" },
          },
        );
      case `/client-${dist.clientHash}`:
        return new Response(dist.clientCode, {
          headers: { "Content-Type": "application/javascript; charset=utf-8" },
        });
      case "/og-image":
        return new ImageResponse(
          (
            <div
              style={{
                fontSize: 40,
                color: "black",
                background: "white",
                width: "100%",
                height: "100%",
                padding: "50px 200px",
                textAlign: "center",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              👋 10000日の誕生日は...?
            </div>
          ),
          {
            width: 1200,
            height: 630,
          },
        );
    }
    return new Response("Not Found", { status: 404 });
  },
} satisfies Deno.ServeDefaultExport;

function Html(
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
