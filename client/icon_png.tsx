import type { HandDesigns, OddHourNumberDisplay } from "./design_mode.tsx";
import type { UrlParameter } from "./url.ts";

const iconSize = 256;
const dialSize = 220;
const center = iconSize / 2;

export function ClockIconPng(
  { parameter, now }: {
    readonly parameter: UrlParameter;
    readonly now: Temporal.Instant;
  },
) {
  const timezone = parameter.timezone ?? Temporal.Now.timeZoneId();
  const zonedNow = now.toZonedDateTimeISO(timezone);
  const elapsedMillisecondsOfDay =
    (((zonedNow.hour * 60) + zonedNow.minute) * 60 + zonedNow.second) * 1000 +
    zonedNow.millisecond;

  return (
    <div
      style={{
        width: `${iconSize}px`,
        height: `${iconSize}px`,
        display: "flex",
        position: "relative",
        overflow: "hidden",
        background: parameter.theme.background,
      }}
    >
      <div
        style={{
          position: "absolute",
          left: `${(iconSize - dialSize) / 2}px`,
          top: `${(iconSize - dialSize) / 2}px`,
          width: `${dialSize}px`,
          height: `${dialSize}px`,
          borderRadius: "9999px",
          border: `5px solid ${parameter.theme.dialStroke}`,
          background: parameter.theme.dialFill,
        }}
      />
      {Array.from({ length: 60 }).map((_, index) => (
        <Marker
          key={`marker-${index}`}
          angle={index / 60 * 360}
          color={parameter.theme.markers}
          wide={index % 5 === 0}
        />
      ))}
      {Array.from({ length: 24 }).map((_, index) => (
        <HourMarker
          key={`hour-${index}`}
          angle={index / 24 * 360}
          color={parameter.theme.markers}
          oddHourNumberDisplay={parameter.oddHourNumberDisplay}
          isOdd={index % 2 === 1}
        />
      ))}
      <HourHand
        angle={elapsedMillisecondsOfDay / (1000 * 60 * 60 * 24) * 360}
        color={parameter.theme.hourHand}
        design={parameter.handDesigns}
      />
      <MinuteHand
        angle={elapsedMillisecondsOfDay / (1000 * 60 * 60) * 360}
        color={parameter.theme.minuteHand}
        design={parameter.handDesigns}
      />
      <SecondHand
        angle={elapsedMillisecondsOfDay / (1000 * 60) * 360}
        color={parameter.theme.secondHand}
        design={parameter.handDesigns}
      />
      <div
        style={{
          position: "absolute",
          left: `${center - 6}px`,
          top: `${center - 6}px`,
          width: "12px",
          height: "12px",
          borderRadius: "9999px",
          background: parameter.theme.infoOutline,
        }}
      />
      <div
        style={{
          position: "absolute",
          left: `${center - 3}px`,
          top: `${center - 3}px`,
          width: "6px",
          height: "6px",
          borderRadius: "9999px",
          background: parameter.theme.markers,
        }}
      />
    </div>
  );
}

function Marker(
  { angle, color, wide }: {
    readonly angle: number;
    readonly color: string;
    readonly wide: boolean;
  },
) {
  return (
    <div
      style={{
        position: "absolute",
        left: `${center}px`,
        top: `${center}px`,
        display: "flex",
        width: "0px",
        height: "0px",
        transform: `rotate(${angle}deg)`,
        transformOrigin: "center center",
      }}
    >
      <div
        style={{
          position: "absolute",
          left: wide ? "-1.5px" : "-1px",
          top: `${-dialSize / 2 + 8}px`,
          width: wide ? "3px" : "2px",
          height: wide ? "12px" : "8px",
          borderRadius: "9999px",
          background: color,
        }}
      />
    </div>
  );
}

function HourMarker(
  { angle, color, oddHourNumberDisplay, isOdd }: {
    readonly angle: number;
    readonly color: string;
    readonly oddHourNumberDisplay: OddHourNumberDisplay;
    readonly isOdd: boolean;
  },
) {
  const size = oddHourNumberDisplay === "hidden"
    ? 4
    : isOdd && oddHourNumberDisplay === "small"
    ? 4
    : 7;

  return (
    <div
      style={{
        position: "absolute",
        left: `${center}px`,
        top: `${center}px`,
        display: "flex",
        width: "0px",
        height: "0px",
        transform: `rotate(${angle}deg)`,
        transformOrigin: "center center",
      }}
    >
      <div
        style={{
          position: "absolute",
          left: `${-size / 2}px`,
          top: `${-dialSize / 2 + 32}px`,
          width: `${size}px`,
          height: `${size}px`,
          borderRadius: "9999px",
          background: color,
        }}
      />
    </div>
  );
}

function HourHand(
  { angle, color, design }: {
    readonly angle: number;
    readonly color: string;
    readonly design: HandDesigns;
  },
) {
  return (
    <HandBase
      angle={angle}
      color={color}
      length={62}
      width={design.hour24 === "bar" ? 8 : design.hour24 === "sword" ? 6 : 10}
      tail={18}
      rounded={design.hour24 !== "sword"}
      diamond={design.hour24 === "sword"}
    />
  );
}

function MinuteHand(
  { angle, color, design }: {
    readonly angle: number;
    readonly color: string;
    readonly design: HandDesigns;
  },
) {
  return (
    <HandBase
      angle={angle}
      color={color}
      length={88}
      width={design.minute === "bar" ? 6 : design.minute === "sword" ? 5 : 8}
      tail={22}
      rounded={design.minute !== "sword"}
      diamond={design.minute === "sword"}
    />
  );
}

function SecondHand(
  { angle, color, design }: {
    readonly angle: number;
    readonly color: string;
    readonly design: HandDesigns;
  },
) {
  return (
    <div
      style={{
        position: "absolute",
        left: `${center}px`,
        top: `${center}px`,
        display: "flex",
        width: "0px",
        height: "0px",
        transform: `rotate(${angle}deg)`,
        transformOrigin: "center center",
      }}
    >
      <div
        style={{
          position: "absolute",
          left: "-1px",
          top: "-92px",
          width: "2px",
          height: "110px",
          borderRadius: "9999px",
          background: color,
        }}
      />
      {design.second === "lollipop" && (
        <div
          style={{
            position: "absolute",
            left: "-8px",
            top: "-68px",
            width: "16px",
            height: "16px",
            borderRadius: "9999px",
            border: `3px solid ${color}`,
            background: "transparent",
          }}
        />
      )}
      {design.second === "pointer" && (
        <div
          style={{
            position: "absolute",
            left: "-5px",
            top: "-92px",
            width: "0px",
            height: "0px",
            borderLeft: "5px solid transparent",
            borderRight: "5px solid transparent",
            borderBottom: `24px solid ${color}`,
          }}
        />
      )}
    </div>
  );
}

function HandBase(
  { angle, color, length, width, tail, rounded, diamond }: {
    readonly angle: number;
    readonly color: string;
    readonly length: number;
    readonly width: number;
    readonly tail: number;
    readonly rounded: boolean;
    readonly diamond: boolean;
  },
) {
  return (
    <div
      style={{
        position: "absolute",
        left: `${center}px`,
        top: `${center}px`,
        display: "flex",
        width: "0px",
        height: "0px",
        transform: `rotate(${angle}deg)`,
        transformOrigin: "center center",
      }}
    >
      <div
        style={{
          position: "absolute",
          left: `${-width / 2}px`,
          top: `${-length}px`,
          width: `${width}px`,
          height: `${length + tail}px`,
          borderRadius: rounded ? "9999px" : "2px",
          background: color,
        }}
      />
      {diamond && (
        <div
          style={{
            position: "absolute",
            left: `${-width}px`,
            top: `${-length + 12}px`,
            width: `${width * 2}px`,
            height: `${width * 2}px`,
            background: color,
            transform: "rotate(45deg)",
          }}
        />
      )}
    </div>
  );
}
