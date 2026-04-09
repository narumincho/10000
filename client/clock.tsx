import { useEffect, useRef, useState } from "react";
import { DesignMode } from "./design_mode.tsx";
import { Hour24Hand, MinuteHand, SecondHand } from "./hand.tsx";
import { UrlParameter } from "./url.ts";
import {
  addDaysToDateText,
  dateTextToInstant,
  TimeDifferencePanel,
  TimeDifferenceText,
} from "./diff.tsx";

type UrlParameterWithTimezone = UrlParameter & {
  readonly timezone: string;
};

function useAnimationFrame(callback = () => {}) {
  const reqIdRef = useRef<number>(undefined);
  const loop = () => {
    reqIdRef.current = requestAnimationFrame(loop);
    callback();
  };

  useEffect(() => {
    reqIdRef.current = requestAnimationFrame(loop);
    return () => {
      if (reqIdRef.current !== undefined) {
        cancelAnimationFrame(reqIdRef.current);
      }
    };
  }, [loop]);
}

export function Clock24(
  { parameter, initialInstant, onChangeUrl }: {
    readonly parameter: UrlParameter;
    readonly initialInstant: Temporal.Instant;
    readonly onChangeUrl: (newURL: UrlParameter) => void;
  },
) {
  useEffect(() => {
    if (!parameter.timezone) {
      onChangeUrl({
        ...parameter,
        timezone: Temporal.Now.timeZoneId(),
      });
    }
  }, [parameter.timezone, onChangeUrl, parameter]);

  if (!parameter.timezone) {
    return <div>loading timezone...</div>;
  }
  const parameterWithTimezone: UrlParameterWithTimezone = {
    ...parameter,
    timezone: parameter.timezone,
  };
  return (
    <Clock24WithTimezone
      parameter={parameterWithTimezone}
      initialInstant={initialInstant}
      onChangeUrl={onChangeUrl}
    />
  );
}

export function Clock24WithTimezone(
  { parameter, initialInstant, onChangeUrl }: {
    readonly parameter: UrlParameterWithTimezone;
    readonly initialInstant: Temporal.Instant;
    readonly onChangeUrl: (newURL: UrlParameterWithTimezone) => void;
  },
) {
  const [now, setNow] = useState<Temporal.Instant>(initialInstant);
  const [isDesignMode, setIsDesignMode] = useState(false);

  useAnimationFrame(() => {
    setNow(Temporal.Now.instant());
  });

  const {
    message,
    theme,
    handDesigns,
    oddHourNumberDisplay,
    timeDifferenceVisible,
    baseDate,
    plusDays,
  } = parameter;
  const { timezone } = parameter;
  const zonedNow = now.toZonedDateTimeISO(timezone);
  const elapsedMillisecondsOfDay =
    (((zonedNow.hour * 60) + zonedNow.minute) * 60 + zonedNow.second) * 1000 +
    zonedNow.millisecond;
  const baseDateText = baseDate ?? zonedNow.toPlainDate().toString();
  const targetDateText = addDaysToDateText(baseDateText, plusDays);
  const targetDate = dateTextToInstant(targetDateText, timezone);
  const timeDifference = timeToDisplayText({ targetDate, now });

  return (
    <div
      style={{
        backgroundColor: theme.background,
        height: "100%",
        position: "relative",
      }}
    >
      <title>{clock24Title(parameter)}</title>
      {timeDifferenceVisible
        ? (
          <TimeDifferencePanel
            message={message}
            baseDateText={baseDateText}
            plusDays={plusDays}
            targetDateText={targetDateText}
            timeDifference={timeDifference}
            theme={theme}
            onMessageChange={(newMessage) => {
              onChangeUrl({ ...parameter, message: newMessage });
            }}
            onBaseDateChange={(newBaseDate) => {
              onChangeUrl({ ...parameter, baseDate: newBaseDate });
            }}
            onPlusDaysChange={(newPlusDays) => {
              onChangeUrl({ ...parameter, plusDays: newPlusDays });
            }}
          />
        )
        : (
          <svg
            style={{
              display: "block",
              width: "100%",
              height: "100%",
            }}
            viewBox="-100 -100 200 200"
          >
            <circle
              cx={0}
              cy={0}
              r={93}
              stroke={theme.dialStroke}
              fill={theme.dialFill}
            />
            <g name="numbers">
              {Array.from({ length: 24 }).map((_, index) => {
                const angle = index / 24 * Math.PI * 2 - Math.PI / 2;
                const isOdd = index % 2 === 1;
                if (isOdd && oddHourNumberDisplay === "hidden") {
                  return null;
                }
                return (
                  <text
                    key={index}
                    textAnchor="middle"
                    alignmentBaseline="middle"
                    x={Math.cos(angle) * 75}
                    y={Math.sin(angle) * 75}
                    fill={theme.markers}
                    fontSize={isOdd && oddHourNumberDisplay === "small"
                      ? 8
                      : 12}
                  >
                    {index}
                  </text>
                );
              })}
            </g>
            <g name="markings">
              {Array.from({ length: 60 }).map((_, index) => {
                const angle = index / 60 * Math.PI * 2 - Math.PI / 2;
                const isFive = index % 5 === 0;
                return (
                  <line
                    key={index}
                    x1={Math.cos(angle) * (isFive ? 85 : 87)}
                    y1={Math.sin(angle) * (isFive ? 85 : 87)}
                    x2={Math.cos(angle) * 93}
                    y2={Math.sin(angle) * 93}
                    strokeWidth={isFive ? 2 : 1}
                    stroke={theme.markers}
                  />
                );
              })}
            </g>

            <Hour24Hand
              angle0To1={elapsedMillisecondsOfDay / (1000 * 60 * 60 * 24)}
              color={theme.hourHand}
              design={handDesigns.hour24}
            />
            <MinuteHand
              angle0To1={elapsedMillisecondsOfDay / (1000 * 60 * 60)}
              color={theme.minuteHand}
              design={handDesigns.minute}
            />
            <SecondHand
              angle0To1={elapsedMillisecondsOfDay / (1000 * 60)}
              color={theme.secondHand}
              design={handDesigns.second}
            />
            <circle cx={0} cy={0} r={4.5} fill={theme.infoOutline} />
            <circle cx={0} cy={0} r={2.2} fill={theme.markers} />

            <Message
              message={message}
              textColor={theme.infoText}
              outlineColor={theme.infoOutline}
              onChange={(newMessage) => {
                onChangeUrl({ ...parameter, message: newMessage });
              }}
            />
            <text
              x={0}
              y={15}
              textAnchor="middle"
              alignmentBaseline="middle"
              fill={theme.infoText}
              stroke={theme.infoOutline}
              strokeWidth={0.2}
              fontSize={8}
              fontWeight="bold"
            >
              {zonedNow.year}/{zonedNow.month}/{zonedNow.day}
            </text>
            <text
              x={0}
              y={30}
              textAnchor="middle"
              alignmentBaseline="middle"
              fill={theme.infoText}
              stroke={theme.infoOutline}
              strokeWidth={0.5}
              fontSize={18}
            >
              {(Math.floor(elapsedMillisecondsOfDay / (1000 * 60 * 60)) % 24)
                .toString().padStart(
                  2,
                  "0",
                )}:{(Math.floor(elapsedMillisecondsOfDay / (1000 * 60)) % 60)
                .toString().padStart(
                  2,
                  "0",
                )}:{(Math.floor(elapsedMillisecondsOfDay / 1000) % 60)
                .toString()
                .padStart(2, "0")}
            </text>
            {isDesignMode && (
              <DesignMode
                theme={theme}
                handDesigns={handDesigns}
                oddHourNumberDisplay={oddHourNumberDisplay}
                onThemeChange={(nextTheme) =>
                  onChangeUrl({ ...parameter, theme: nextTheme })}
                onHandDesignsChange={(nextHandDesigns) =>
                  onChangeUrl({ ...parameter, handDesigns: nextHandDesigns })}
                onOddHourNumberDisplayChange={(nextOddHourNumberDisplay) =>
                  onChangeUrl({
                    ...parameter,
                    oddHourNumberDisplay: nextOddHourNumberDisplay,
                  })}
              />
            )}
          </svg>
        )}
      <button
        type="button"
        aria-label={timeDifferenceVisible
          ? "時間差の表示を隠す"
          : "時間差の表示を出す"}
        onClick={() => {
          onChangeUrl({
            ...parameter,
            timeDifferenceVisible: !timeDifferenceVisible,
          });
        }}
        style={{
          position: "absolute",
          left: 24,
          bottom: 24,
          width: 56,
          height: 56,
          borderRadius: "50%",
          border: "1px solid rgba(255, 255, 255, 0.35)",
          background: timeDifferenceVisible
            ? "rgba(20, 16, 16, 0.82)"
            : "rgba(20, 16, 16, 0.62)",
          color: "#ffffff",
          display: "grid",
          placeItems: "center",
          cursor: "pointer",
          boxShadow: "0 10px 25px rgba(0, 0, 0, 0.25)",
          backdropFilter: "blur(6px)",
        }}
      >
        <TimeDifferenceIcon active={timeDifferenceVisible} />
      </button>
      {!timeDifferenceVisible && (
        <button
          type="button"
          aria-label={isDesignMode
            ? "デザイン編集モードを閉じる"
            : "デザイン編集モードを開く"}
          onClick={() => {
            setIsDesignMode((value) => !value);
          }}
          style={{
            position: "absolute",
            right: 24,
            bottom: 24,
            width: 56,
            height: 56,
            borderRadius: "50%",
            border: "1px solid rgba(255, 255, 255, 0.35)",
            background: "rgba(20, 16, 16, 0.7)",
            color: "#ffffff",
            display: "grid",
            placeItems: "center",
            cursor: "pointer",
            boxShadow: "0 10px 25px rgba(0, 0, 0, 0.25)",
            backdropFilter: "blur(6px)",
          }}
        >
          <svg width="26" height="26" viewBox="0 0 24 24" aria-hidden="true">
            <path
              d="M19.14 12.94a7.43 7.43 0 0 0 .05-.94 7.43 7.43 0 0 0-.05-.94l2.03-1.58a.5.5 0 0 0 .12-.64l-1.92-3.32a.5.5 0 0 0-.6-.22l-2.39.96a7.28 7.28 0 0 0-1.63-.94l-.36-2.54a.5.5 0 0 0-.49-.42h-3.84a.5.5 0 0 0-.49.42l-.36 2.54c-.58.23-1.13.55-1.63.94l-2.39-.96a.5.5 0 0 0-.6.22L2.71 8.84a.5.5 0 0 0 .12.64l2.03 1.58a.5.5 0 0 0-.05.94 7.43 7.43 0 0 0 .05.94l-2.03 1.58a.5.5 0 0 0-.12.64l1.92 3.32a.5.5 0 0 0 .6.22l2.39-.96c.5.39 1.05.71 1.63.94l.36 2.54a.5.5 0 0 0 .49.42h3.84a.5.5 0 0 0 .49-.42l.36-2.54c.58-.23 1.13-.55 1.63-.94l2.39.96a.5.5 0 0 0 .6-.22l1.92-3.32a.5.5 0 0 0-.12-.64ZM12 15.5A3.5 3.5 0 1 1 12 8.5a3.5 3.5 0 0 1 0 7Z"
              fill="currentColor"
            />
          </svg>
        </button>
      )}
    </div>
  );
}

function TimeDifferenceIcon({ active }: { readonly active: boolean }) {
  const accentColor = active ? "#FAE080" : "rgba(255, 255, 255, 0.72)";
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" aria-hidden="true">
      <circle
        cx="7"
        cy="8"
        r="3.25"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <path
        d="M7 6.4v1.9l1.25.75"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle
        cx="17"
        cy="16"
        r="3.25"
        fill="none"
        stroke={accentColor}
        strokeWidth="1.5"
      />
      <path
        d="M17 14.4v1.9l1.25.75"
        fill="none"
        stroke={accentColor}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M10.5 15.5h3.8"
        fill="none"
        stroke={accentColor}
        strokeWidth="1.7"
        strokeLinecap="round"
      />
      <path
        d="M12.6 13.4 14.8 15.5 12.6 17.6"
        fill="none"
        stroke={accentColor}
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M13.5 8.5H9.7"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        opacity={active ? 0.55 : 0.95}
      />
      <path
        d="M11.4 6.4 9.2 8.5 11.4 10.6"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity={active ? 0.55 : 0.95}
      />
    </svg>
  );
}

export function clock24Title(parameter: UrlParameter) {
  return `${parameter.message ? `${parameter.message} | ` : ""}1周24時間の時計`;
}

export function timeToDisplayText(
  { targetDate, now }: { targetDate: Temporal.Instant; now: Temporal.Instant },
): TimeDifferenceText {
  const diff = targetDate.epochMilliseconds - now.epochMilliseconds;
  const after = diff < 0;
  const diffAbs = Math.abs(diff);
  const totalSeconds = Math.floor(diffAbs / 1000);
  const days = Math.floor(totalSeconds / (60 * 60 * 24));
  const hours = Math.floor(totalSeconds / (60 * 60)) % 24;
  const minutes = Math.floor(totalSeconds / 60) % 60;
  const seconds = totalSeconds % 60;
  return { days, hours, minutes, seconds, after };
}

function Message(
  { message, textColor, outlineColor, onChange }: {
    readonly message: string;
    readonly textColor: string;
    readonly outlineColor: string;
    readonly onChange: (newMessage: string) => void;
  },
) {
  return (
    <foreignObject
      x={-80}
      y={-30}
      width={160}
      height={30}
      textAnchor="middle"
      alignmentBaseline="middle"
      fill={textColor}
      stroke={outlineColor}
      strokeWidth={0.5}
      fontSize={18}
    >
      <input
        type="text"
        name="message"
        value={message}
        style={{
          background: "transparent",
          textAlign: "center",
          border: "none",
          outline: "none",
          width: "100%",
          fontSize: "inherit",
          fontFamily: "inherit",
          color: "inherit",
        }}
        onChange={(event) => {
          onChange(event.target.value);
        }}
      />
    </foreignObject>
  );
}
