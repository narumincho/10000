import React from "react";
import { renderToReadableStream } from "react-dom/server";
import { ImageResponse } from "@vercel/og";

export default {
  async fetch(request) {
    const url = new URL(request.url);
    switch (url.pathname) {
      case "/":
        return new Response(await renderToReadableStream(<Html />), {
          headers: { "Content-Type": "text/html; charset=utf-8" },
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

function Html() {
  return (
    <html>
      <head>
        <title>10000日</title>
      </head>
      <body>
        <h1>10000日</h1>
      </body>
    </html>
  );
}
