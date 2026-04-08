import { renderToStaticMarkup } from "react-dom/server";
import type { UrlParameter } from "./url.ts";
import { Hour24Hand, MinuteHand, SecondHand } from "./hand.tsx";

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

  return renderToStaticMarkup(
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="256"
      height="256"
      viewBox="-100 -100 200 200"
    >
      <rect
        x={-100}
        y={-100}
        width={200}
        height={200}
        fill={parameter.theme.background}
      />
      <circle
        cx={0}
        cy={0}
        r={93}
        stroke={parameter.theme.dialStroke}
        fill={parameter.theme.dialFill}
      />
      {Array.from({ length: 24 }).map((_, index) => {
        const angle = index / 24 * Math.PI * 2 - Math.PI / 2;
        const isOdd = index % 2 === 1;
        return (
          <circle
            key={`hour-${index}`}
            cx={Math.cos(angle) * 75}
            cy={Math.sin(angle) * 75}
            r={parameter.oddHourNumberDisplay === "hidden"
              ? 2
              : isOdd && parameter.oddHourNumberDisplay === "small"
              ? 2
              : 3.5}
            fill={parameter.theme.markers}
          />
        );
      })}
      {Array.from({ length: 60 }).map((_, index) => {
        const angle = index / 60 * Math.PI * 2 - Math.PI / 2;
        const isFive = index % 5 === 0;
        return (
          <line
            key={`marker-${index}`}
            x1={Math.cos(angle) * (isFive ? 85 : 87)}
            y1={Math.sin(angle) * (isFive ? 85 : 87)}
            x2={Math.cos(angle) * 93}
            y2={Math.sin(angle) * 93}
            strokeWidth={isFive ? 2 : 1}
            stroke={parameter.theme.markers}
          />
        );
      })}
      <Hour24Hand
        angle0To1={elapsedMillisecondsOfDay / (1000 * 60 * 60 * 24)}
        color={parameter.theme.hourHand}
        design={parameter.handDesigns.hour24}
      />
      <MinuteHand
        angle0To1={elapsedMillisecondsOfDay / (1000 * 60 * 60)}
        color={parameter.theme.minuteHand}
        design={parameter.handDesigns.minute}
      />
      <SecondHand
        angle0To1={elapsedMillisecondsOfDay / (1000 * 60)}
        color={parameter.theme.secondHand}
        design={parameter.handDesigns.second}
      />
      <circle cx={0} cy={0} r={4.5} fill={parameter.theme.infoOutline} />
      <circle cx={0} cy={0} r={2.2} fill={parameter.theme.markers} />
    </svg>,
  );
}
