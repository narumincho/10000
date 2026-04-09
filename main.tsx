import { renderToReadableStream } from "react-dom/server";
import { ImageResponse } from "@vercel/og";
import { Html } from "./html.tsx";
import { ClockIconPng } from "./client/icon_png.tsx";
import { renderClockIconSvg } from "./client/icon_svg.tsx";
import { parseUrl } from "./client/url.ts";
import { createOgImage, OgpImage } from "./client/ogp_image.tsx";

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
      case "/og-image.html":
        return new Response(
          await renderToReadableStream(
            <OgpImage url={url} />,
          ),
          {
            headers: { "Content-Type": "text/html; charset=utf-8" },
          },
        );
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
