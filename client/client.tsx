import React from "react";
import { hydrateRoot } from "react-dom/client";
import { Clock24 } from "./clock.tsx";
import { encodeUrl, parseUrl } from "./url.ts";
import type {} from "navigation-api-types";

const appElement = document.getElementById("app");
if (!appElement) {
  throw new Error("app element not found");
}

hydrateRoot(
  appElement,
  <WithRouter />,
);

function WithRouter() {
  const [parameter, setParameter] = React.useState(
    parseUrl(new URL(location.href)),
  );

  React.useEffect(() => {
    const handler = (event: NavigateEvent) => {
      if (!event.destination.sameDocument) {
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
      initialInstant={Temporal.Instant.fromEpochMilliseconds(
        Number.parseInt(appElement?.dataset.initialDate ?? "", 10),
      )}
      onChangeUrl={(parameter) => {
        console.log("onChangeUrl", parameter);
        navigation?.navigate(encodeUrl(parameter), {
          history: "replace",
        });
      }}
    />
  );
}
