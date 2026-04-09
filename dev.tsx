import { createServer as createHttpServer } from "node:http";
import { renderToString } from "react-dom/server";
import { createServer as createViteServer } from "vite";
import { ImageResponse } from "@vercel/og";
import type * as html from "./html.tsx";
import type * as clockIconModule from "./client/icon_png.tsx";
import type * as clockIconSvgModule from "./client/icon_svg.tsx";
import type * as urlModule from "./client/url.ts";

const address = "::1";
const browserAddress = "[::1]";
const port = 3000;
const server = createHttpServer();

const vite = await createViteServer({
  appType: "custom",
  server: {
    middlewareMode: true,
    hmr: {
      server,
      host: browserAddress,
      clientPort: port,
    },
  },
});

server.on("request", (request, response) => {
  vite.middlewares(request, response, async () => {
    const requestUrl = request.url ?? "/";
    const url = new URL(
      requestUrl,
      `http://${request.headers.host ?? `[${address}]:${port}`}`,
    );

    try {
      if (url.pathname === "/") {
        response.writeHead(200, {
          "Content-Type": "text/html; charset=utf-8",
        });
        const htmlModule =
          (await vite.ssrLoadModule("/html.tsx")) as typeof html;
        response.end(
          await vite.transformIndexHtml(
            requestUrl,
            renderToString(
              <htmlModule.Html
                initialDate={Temporal.Now.instant()}
                url={url}
                scriptPath="./client/client.tsx"
              />,
            ),
          ),
        );
        return;
      }

      if (url.pathname === "/icon.png") {
        console.log("Generating icon.png...");
        const clockIcon = (await vite.ssrLoadModule(
          "/client/icon_png.tsx",
        )) as typeof clockIconModule;
        const urlParser =
          (await vite.ssrLoadModule("/client/url.ts")) as typeof urlModule;
        const iconResponse = new ImageResponse(
          (
            <clockIcon.ClockIconPng
              parameter={urlParser.parseUrl(url)}
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

        response.writeHead(
          iconResponse.status,
          Object.fromEntries(iconResponse.headers),
        );
        if (!iconResponse.body) {
          response.end();
          return;
        }
        await iconResponse.body.pipeTo(
          new WritableStream<Uint8Array>({
            write(chunk) {
              response.write(chunk);
            },
            close() {
              response.end();
            },
            abort(error) {
              response.destroy(
                error instanceof Error ? error : new Error(String(error)),
              );
            },
          }),
        );
        return;
      }

      if (url.pathname === "/icon.svg") {
        const clockIconSvg = (await vite.ssrLoadModule(
          "/client/icon_svg.tsx",
        )) as typeof clockIconSvgModule;
        const urlParser =
          (await vite.ssrLoadModule("/client/url.ts")) as typeof urlModule;
        response.writeHead(200, {
          "Content-Type": "image/svg+xml; charset=utf-8",
          "Cache-Control": "public, max-age=604800, immutable",
        });
        response.end(
          clockIconSvg.renderClockIconSvg({
            parameter: urlParser.parseUrl(url),
            now: Temporal.Now.instant(),
          }),
        );
        return;
      }

      response.writeHead(404, {
        "Content-Type": "text/plain; charset=utf-8",
      });
      response.end("Not Found");
    } catch (error) {
      if (error instanceof Error) {
        vite.ssrFixStacktrace(error);
      }
      console.error(error);
      response.writeHead(500, {
        "Content-Type": "text/plain; charset=utf-8",
      });
      response.end(
        error instanceof Error ? error.stack ?? error.message : String(error),
      );
    }
  });
});

server.listen(port, address, () => {
  console.log(`Server is running at http://${browserAddress}:${port}`);
});
