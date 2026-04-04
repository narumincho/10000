import * as React from "react";
import { createRoot, hydrateRoot } from "react-dom/client";
import { Clock24 } from "./clock.tsx";
import { encodeUrl, parseUrl } from "./url.ts";
import type {} from "navigation-api-types";

const appElement = document.getElementById("app");
if (!appElement) {
  throw new Error("app element not found");
}

const app = <WithRouter />;
if (appElement.hasChildNodes()) {
  hydrateRoot(appElement, app);
} else {
  const root = (globalThis as {
    __clockAppRoot?: ReturnType<typeof createRoot>;
  }).__clockAppRoot ?? createRoot(appElement);
  (globalThis as {
    __clockAppRoot?: ReturnType<typeof createRoot>;
  }).__clockAppRoot = root;
  root.render(app);
}

function WithRouter() {
  const [parameter, setParameter] = React.useState(
    parseUrl(new URL(location.href)),
  );

  React.useEffect(() => {
    const handler = (event: NavigateEvent) => {
      if (new URL(event.destination.url).pathname !== location.pathname) {
        return;
      }
      event.intercept({
        // deno-lint-ignore require-await
        handler: async () => {
          setParameter(parseUrl(new URL(event.destination.url)));
        },
      });
    };

    navigation?.addEventListener("navigate", handler);

    return () => {
      navigation?.removeEventListener("navigate", handler);
    };
  }, []);

  return (
    <Clock24
      parameter={parameter}
      initialInstant={(() => {
        const initialDateText = appElement?.dataset.initialDate;
        if (initialDateText === undefined) {
          return Temporal.Now.instant();
        }
        const initialDate = Number.parseInt(initialDateText, 10);
        if (Number.isNaN(initialDate)) {
          return Temporal.Now.instant();
        }
        return Temporal.Instant.fromEpochMilliseconds(initialDate);
      })()}
      onChangeUrl={(parameter) => {
        console.log("onChangeUrl", parameter);
        navigation?.navigate(encodeUrl(parameter), {
          history: "replace",
        });
      }}
    />
  );
}
