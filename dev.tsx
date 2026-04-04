import { createServer as createHttpServer } from "node:http";
import { renderToString } from "react-dom/server";
import { createServer as createViteServer } from "vite";
import type * as html from "./html.tsx";

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

    if (url.pathname !== "/") {
      response.writeHead(404, {
        "Content-Type": "text/plain; charset=utf-8",
      });
      response.end("Not Found");
      return;
    }

    try {
      response.writeHead(200, {
        "Content-Type": "text/html; charset=utf-8",
      });
      const htmlModule = (await vite.ssrLoadModule("/html.tsx")) as typeof html;
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
