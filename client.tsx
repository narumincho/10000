import React from "react";
import { hydrateRoot } from "react-dom/client";
import { Clock24 } from "./clock.tsx";

const appElement = document.getElementById("app");
if (!appElement) {
  throw new Error("app element not found");
}

hydrateRoot(
  appElement,
  <Clock24
    parameter={{ message: "", deadline: undefined }}
    onChangeUrl={() => {}}
  />,
);
