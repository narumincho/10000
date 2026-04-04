import * as React from "react";
import { UrlParameter } from "./url.ts";

const getTimezoneOffsetText = (
  timezone: string,
  now: Temporal.Instant,
): string => {
  return `[${timezone}]`;
  // const timezoneOffset = Temporal.TimeZone.from(timezone)
  //   .getOffsetNanosecondsFor(
  //     now,
  //   );
  // const isPlus = timezoneOffset <= 0;
  // const timezoneOffsetAbs = Math.abs(timezoneOffset);

  // const offsetHour = Math.floor(timezoneOffsetAbs / 60);
  // const offsetMinute = Math.floor(timezoneOffsetAbs % 60);

  // return `[${timezone}] ${isPlus ? "+" : "-"}${
  //   offsetHour.toString().padStart(2, "0")
  // }:${offsetMinute.toString().padStart(2, "0")}`;
};

export const ClockSetting = (
  { message, timezone, targetDate, now, onChangeUrl }: {
    readonly message: string;
    readonly timezone: string;
    readonly targetDate: Temporal.Instant | undefined;
    readonly now: Temporal.Instant;
    readonly onChangeUrl: (newURL: UrlParameter) => void;
  },
): React.ReactElement => {
  return (
    <div
      style={{
        padding: 16,
        height: "100%",
        boxSizing: "border-box",
        display: "grid",
        alignContent: "end",
        gap: 16,
      }}
    >
      <label
        style={{
          display: "flex",
          gap: 8,
          alignItems: "center",
        }}
      >
        <div style={{ width: 80 }}>date</div>
        <input
          style={{ padding: 4, fontSize: 16 }}
          type="datetime-local"
          value={targetDate?.toZonedDateTimeISO(timezone).toLocaleString()}
          onChange={(e) => {
            const newValue = e.target.value;

            const newTargetDate = Temporal.ZonedDateTime.from(
              newValue + getTimezoneOffsetText(timezone, now),
            ).toInstant();

            onChangeUrl({ message, timezone, targetDate: newTargetDate });
          }}
        />
        <div>{getTimezoneOffsetText(timezone, now)}</div>
      </label>
      <label
        style={{
          display: "flex",
          gap: 8,
          alignItems: "center",
        }}
      >
        <div style={{ width: 80 }}>message</div>
        <input
          style={{ padding: 4, fontSize: 16 }}
          type="text"
          value={message}
          onChange={(e) => {
            const newMessage = e.target.value;

            onChangeUrl({ message: newMessage, timezone, targetDate });
          }}
        />
      </label>
    </div>
  );
};
