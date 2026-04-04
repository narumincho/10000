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
const rootState = globalThis as {
  __clockAppRoot?: {
    render: (children: React.ReactNode) => void;
  };
};
if (rootState.__clockAppRoot) {
  rootState.__clockAppRoot.render(app);
} else {
  rootState.__clockAppRoot = appElement.hasChildNodes()
    ? hydrateRoot(appElement, app)
    : createRoot(appElement);
  if (!appElement.hasChildNodes()) {
    rootState.__clockAppRoot.render(app);
  }
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
          throw new Error("data-initial-date not found");
        }
        const initialDate = Number.parseInt(initialDateText, 10);
        if (Number.isNaN(initialDate)) {
          throw new Error("data-initial-date is invalid");
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
