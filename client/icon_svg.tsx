import type { UrlParameter } from "./url.ts";

export function renderClockIconSvg(
  { parameter, now }: {
    readonly parameter: UrlParameter;
    readonly now: Temporal.Instant;
  },
): string {
  const timezone = parameter.timezone ?? Temporal.Now.timeZoneId();
  const zonedNow = now.toZonedDateTimeISO(timezone);
  const elapsedMillisecondsOfDay =
    (((zonedNow.hour * 60) + zonedNow.minute) * 60 + zonedNow.second) * 1000 +
    zonedNow.millisecond;

  return [
    `<svg xmlns="http://www.w3.org/2000/svg" width="256" height="256" viewBox="-100 -100 200 200">`,
    `<rect x="-100" y="-100" width="200" height="200" fill="${parameter.theme.background}"/>`,
    `<circle cx="0" cy="0" r="93" stroke="${parameter.theme.dialStroke}" fill="${parameter.theme.dialFill}"/>`,
    ...Array.from({ length: 24 }, (_, index) => {
      const angle = index / 24 * Math.PI * 2 - Math.PI / 2;
      const isOdd = index % 2 === 1;
      const radius = parameter.oddHourNumberDisplay === "hidden"
        ? 2
        : isOdd && parameter.oddHourNumberDisplay === "small"
        ? 2
        : 3.5;
      return `<circle cx="${Math.cos(angle) * 75}" cy="${
        Math.sin(angle) * 75
      }" r="${radius}" fill="${parameter.theme.markers}"/>`;
    }),
    ...Array.from({ length: 60 }, (_, index) => {
      const angle = index / 60 * Math.PI * 2 - Math.PI / 2;
      const isFive = index % 5 === 0;
      return `<line x1="${Math.cos(angle) * (isFive ? 85 : 87)}" y1="${
        Math.sin(angle) * (isFive ? 85 : 87)
      }" x2="${Math.cos(angle) * 93}" y2="${
        Math.sin(angle) * 93
      }" stroke-width="${
        isFive ? 2 : 1
      }" stroke="${parameter.theme.markers}"/>`;
    }),
    renderHour24Hand(
      elapsedMillisecondsOfDay / (1000 * 60 * 60 * 24) * 360,
      parameter.theme.hourHand,
      parameter.handDesigns.hour24,
    ),
    renderMinuteHand(
      elapsedMillisecondsOfDay / (1000 * 60 * 60) * 360,
      parameter.theme.minuteHand,
      parameter.handDesigns.minute,
    ),
    renderSecondHand(
      elapsedMillisecondsOfDay / (1000 * 60) * 360,
      parameter.theme.secondHand,
      parameter.handDesigns.second,
    ),
    `<circle cx="0" cy="0" r="4.5" fill="${parameter.theme.infoOutline}"/>`,
    `<circle cx="0" cy="0" r="2.2" fill="${parameter.theme.markers}"/>`,
    `</svg>`,
  ].join("");
}

export function renderClockIconSvgDataUrl(
  input: { readonly parameter: UrlParameter; readonly now: Temporal.Instant },
): string {
  return `data:image/svg+xml;charset=utf-8,${
    encodeURIComponent(renderClockIconSvg(input))
  }`;
}

function renderHour24Hand(
  angle: number,
  color: string,
  design: UrlParameter["handDesigns"]["hour24"],
): string {
  switch (design) {
    case "leaf":
      return renderGroup(
        angle,
        `<path d="M -6 0 C -5 -5 -2 -10 0 -44 C 2 -10 5 -5 6 0 C 3 2 2 8 0 16 C -2 8 -3 2 -6 0 Z" fill="${color}"/>`,
      );
    case "sword":
      return renderGroup(
        angle,
        `<path d="M -4 14 L -4 2 L -8 -2 L -2 -12 L -1 -48 L 0 -56 L 1 -48 L 2 -12 L 8 -2 L 4 2 L 4 14 Z" fill="${color}"/>`,
      );
    case "bar":
      return renderGroup(
        angle,
        `<path d="M -3 16 L -3 -40 L -6 -46 L 0 -54 L 6 -46 L 3 -40 L 3 16 Z" fill="${color}"/>`,
      );
  }
}

function renderMinuteHand(
  angle: number,
  color: string,
  design: UrlParameter["handDesigns"]["minute"],
): string {
  switch (design) {
    case "dauphine":
      return renderGroup(
        angle,
        `<path d="M -4 0 C -3 -6 -1 -18 0 -70 C 1 -18 3 -6 4 0 C 2 2 1 10 0 20 C -1 10 -2 2 -4 0 Z" fill="${color}"/>`,
      );
    case "sword":
      return renderGroup(
        angle,
        `<path d="M -3 18 L -3 2 L -6 -2 L -2 -18 L -1 -74 L 0 -84 L 1 -74 L 2 -18 L 6 -2 L 3 2 L 3 18 Z" fill="${color}"/>`,
      );
    case "bar":
      return renderGroup(
        angle,
        `<path d="M -2.5 20 L -2.5 -64 L -5 -70 L 0 -82 L 5 -70 L 2.5 -64 L 2.5 20 Z" fill="${color}"/>`,
      );
  }
}

function renderSecondHand(
  angle: number,
  color: string,
  design: UrlParameter["handDesigns"]["second"],
): string {
  switch (design) {
    case "needle":
      return renderGroup(
        angle,
        `<path d="M -1 14 L -1 -74 L 0 -90 L 1 -74 L 1 14 Z" fill="${color}"/>` +
          `<path d="M -2 12 A 2 2 0 1 0 2 12 A 2 2 0 1 0 -2 12 Z" fill="${color}"/>`,
      );
    case "lollipop":
      return renderGroup(
        angle,
        `<path d="M -1 18 L -1 -76 L 0 -90 L 1 -76 L 1 18 Z" fill="${color}"/>` +
          `<circle cx="0" cy="-58" r="6" fill="none" stroke="${color}" stroke-width="2"/>` +
          `<circle cx="0" cy="12" r="2" fill="${color}"/>`,
      );
    case "pointer":
      return renderGroup(
        angle,
        `<path d="M -1 18 L -1 -50 L 0 -90 L 1 -50 L 1 18 Z" fill="${color}"/>` +
          `<path d="M -4 -36 L 0 -90 L 4 -36 Z" fill="${color}"/>`,
      );
  }
}

function renderGroup(angle: number, children: string): string {
  return `<g transform="rotate(${angle})">${children}</g>`;
}
