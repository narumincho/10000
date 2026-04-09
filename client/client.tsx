import "./temporal_polyfill.ts";
import { useEffect, useState } from "react";
import { hydrateRoot } from "react-dom/client";
import { Clock24 } from "./clock.tsx";
import { renderClockIconSvgDataUrl } from "./icon_svg.tsx";
import { encodeUrlParams, parseUrl } from "./url.ts";
import type {} from "navigation-api-types";

const appElement = document.getElementById("app");
if (!appElement) {
  throw new Error("app element not found");
}

hydrateRoot(appElement, <WithRouter />);

function WithRouter() {
  const [parameter, setParameter] = useState(
    parseUrl(new URL(location.href)),
  );

  useEffect(() => {
    console.log("effect start!");
    setIconLink({
      type: "image/svg+xml",
      href: renderClockIconSvgDataUrl({
        parameter,
        now: Temporal.Instant.fromEpochMilliseconds(Date.now()),
      }),
    });
    const timer = setInterval(() => {
      setIconLink({
        type: "image/svg+xml",
        href: renderClockIconSvgDataUrl({
          parameter,
          now: Temporal.Instant.fromEpochMilliseconds(Date.now()),
        }),
      });
    }, 1000);
    return () => {
      clearInterval(timer);
    };
  }, [parameter]);

  useEffect(() => {
    const handler = (event: NavigateEvent) => {
      if (!event.canIntercept) {
        return;
      }
      if (new URL(event.destination.url).pathname !== location.pathname) {
        return;
      }
      event.intercept({
        focusReset: "manual",
        scroll: "manual",
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
        navigation?.navigate(encodeUrlParams(parameter), {
          history: "replace",
        });
      }}
    />
  );
}

function setIconLink(
  { type, href }: {
    readonly type: string;
    readonly href: string;
  },
) {
  let iconLink = document.head.querySelector<HTMLLinkElement>(
    `link[rel="icon"][type="${type}"]`,
  );
  if (!iconLink) {
    iconLink = document.createElement("link");
    iconLink.rel = "icon";
    iconLink.type = type;
    document.head.append(iconLink);
  }
  iconLink.href = href;
}
