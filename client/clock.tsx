import { useEffect, useRef, useState } from "react";
import { UrlParameter } from "./url.ts";
import { Hour24Hand, MinuteHand, SecondHand } from "./hand.tsx";

type ClockTheme = {
  readonly background: string;
  readonly dialStroke: string;
  readonly dialFill: string;
  readonly markers: string;
  readonly hourHand: string;
  readonly minuteHand: string;
  readonly secondHand: string;
  readonly infoText: string;
  readonly infoOutline: string;
};

const defaultTheme: ClockTheme = {
  background: "#724242",
  dialStroke: "#ca8484",
  dialFill: "#b56566",
  markers: "#000000",
  hourHand: "#60554A",
  minuteHand: "#FAE080",
  secondHand: "#FA2222",
  infoText: "#400488",
  infoOutline: "#ffffff",
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
  return (
    <Clock24WithTimezone
      message={parameter.message}
      timezone={parameter.timezone}
      targetDate={parameter.targetDate}
      initialInstant={initialInstant}
      onChangeUrl={onChangeUrl}
    />
  );
}

export function Clock24WithTimezone(
  { message, timezone, targetDate, initialInstant, onChangeUrl }: {
    readonly message: string;
    readonly timezone: string;
    readonly targetDate: Temporal.Instant | undefined;
    readonly initialInstant: Temporal.Instant;
    readonly onChangeUrl: (newURL: UrlParameter) => void;
  },
) {
  const [now, setNow] = useState<Temporal.Instant>(initialInstant);
  const [isDesignMode, setIsDesignMode] = useState(false);
  const [theme, setTheme] = useState<ClockTheme>(defaultTheme);

  useAnimationFrame(() => {
    setNow(Temporal.Now.instant());
  });

  const zonedNow = now.toZonedDateTimeISO(timezone);
  const elapsedMillisecondsOfDay =
    (((zonedNow.hour * 60) + zonedNow.minute) * 60 + zonedNow.second) * 1000 +
    zonedNow.millisecond;

  const limitValueAndUnit = targetDate === undefined
    ? undefined
    : timeToDisplayText({ targetDate, now });

  return (
    <div
      style={{
        backgroundColor: theme.background,
        height: "100%",
        position: "relative",
      }}
    >
      <title>{clock24Title({ message, timezone, targetDate })}</title>
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
            return (
              <text
                key={index}
                textAnchor="middle"
                alignmentBaseline="middle"
                x={Math.cos(angle) * 75}
                y={Math.sin(angle) * 75}
                fill={theme.markers}
                fontSize={12}
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
        />
        <MinuteHand
          angle0To1={elapsedMillisecondsOfDay / (1000 * 60 * 60)}
          color={theme.minuteHand}
        />
        <SecondHand
          angle0To1={elapsedMillisecondsOfDay / (1000 * 60)}
          color={theme.secondHand}
        />
        <circle cx={0} cy={0} r={4.5} fill={theme.infoOutline} />
        <circle cx={0} cy={0} r={2.2} fill={theme.markers} />

        <Message
          message={message}
          textColor={theme.infoText}
          outlineColor={theme.infoOutline}
          onChange={(newMessage) => {
            onChangeUrl({ message: newMessage, timezone, targetDate });
          }}
        />
        {limitValueAndUnit && (
          <text
            x={0}
            y={-10}
            textAnchor="middle"
            alignmentBaseline="middle"
            fill={theme.infoText}
            stroke={theme.infoOutline}
            strokeWidth={0.5}
            fontSize={18}
          >
            {limitValueAndUnit.after ? "から" : "まで"}
            {limitValueAndUnit.value}
            {limitValueAndUnit.unit}
          </text>
        )}
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
            )}:{(Math.floor(elapsedMillisecondsOfDay / 1000) % 60).toString()
            .padStart(2, "0")}
        </text>
        {isDesignMode && (
          <>
            <ColorEditor
              x={-96}
              y={72}
              label="背景"
              value={theme.background}
              onChange={(background) => setTheme({ ...theme, background })}
            />
            <ColorEditor
              x={-96}
              y={-96}
              label="外枠"
              value={theme.dialStroke}
              onChange={(dialStroke) => setTheme({ ...theme, dialStroke })}
            />
            <ColorEditor
              x={54}
              y={-96}
              label="文字盤"
              value={theme.dialFill}
              onChange={(dialFill) => setTheme({ ...theme, dialFill })}
            />
            <ColorEditor
              x={-96}
              y={-16}
              label="目盛"
              value={theme.markers}
              onChange={(markers) => setTheme({ ...theme, markers })}
            />
            <ColorEditor
              x={-44}
              y={44}
              label="24h針"
              value={theme.hourHand}
              onChange={(hourHand) => setTheme({ ...theme, hourHand })}
            />
            <ColorEditor
              x={0}
              y={-84}
              label="分針"
              value={theme.minuteHand}
              onChange={(minuteHand) => setTheme({ ...theme, minuteHand })}
            />
            <ColorEditor
              x={70}
              y={-12}
              label="秒針"
              value={theme.secondHand}
              onChange={(secondHand) => setTheme({ ...theme, secondHand })}
            />
            <ColorEditor
              x={44}
              y={44}
              label="文字"
              value={theme.infoText}
              onChange={(infoText) => setTheme({ ...theme, infoText })}
            />
            <ColorEditor
              x={-8}
              y={72}
              label="縁取り"
              value={theme.infoOutline}
              onChange={(infoOutline) => setTheme({ ...theme, infoOutline })}
            />
          </>
        )}
      </svg>
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
            d="M19.14 12.94a7.43 7.43 0 0 0 .05-.94 7.43 7.43 0 0 0-.05-.94l2.03-1.58a.5.5 0 0 0 .12-.64l-1.92-3.32a.5.5 0 0 0-.6-.22l-2.39.96a7.28 7.28 0 0 0-1.63-.94l-.36-2.54a.5.5 0 0 0-.49-.42h-3.84a.5.5 0 0 0-.49.42l-.36 2.54c-.58.23-1.13.55-1.63.94l-2.39-.96a.5.5 0 0 0-.6.22L2.71 8.84a.5.5 0 0 0 .12.64l2.03 1.58a7.43 7.43 0 0 0-.05.94 7.43 7.43 0 0 0 .05.94l-2.03 1.58a.5.5 0 0 0-.12.64l1.92 3.32a.5.5 0 0 0 .6.22l2.39-.96c.5.39 1.05.71 1.63.94l.36 2.54a.5.5 0 0 0 .49.42h3.84a.5.5 0 0 0 .49-.42l.36-2.54c.58-.23 1.13-.55 1.63-.94l2.39.96a.5.5 0 0 0 .6-.22l1.92-3.32a.5.5 0 0 0-.12-.64ZM12 15.5A3.5 3.5 0 1 1 12 8.5a3.5 3.5 0 0 1 0 7Z"
            fill="currentColor"
          />
        </svg>
      </button>
    </div>
  );
}

export function clock24Title(parameter: UrlParameter) {
  return `${parameter.message ? `${parameter.message} | ` : ""}1周24時間の時計`;
}

export function timeToDisplayText(
  { targetDate, now }: { targetDate: Temporal.Instant; now: Temporal.Instant },
): {
  readonly value: number;
  readonly unit: string;
  readonly after: boolean;
} {
  const diff = targetDate.epochMilliseconds - now.epochMilliseconds;
  const after = diff < 0;
  const diffAbs = Math.abs(diff);
  const diffDay = Math.floor(diffAbs / (1000 * 60 * 60 * 24));
  if (diffDay > 0) {
    return { value: diffDay, unit: "日", after };
  }
  const diffHour = Math.floor(diffAbs / (1000 * 60 * 60));
  if (diffHour > 0) {
    return { value: diffHour, unit: "時間", after };
  }
  const diffMinute = Math.floor(diffAbs / (1000 * 60));
  if (diffMinute > 0) {
    return { value: diffMinute, unit: "分", after };
  }
  const diffSeconds = Math.floor(diffAbs / 1000);
  return { value: diffSeconds, unit: "秒", after };
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
        onChange={(e) => {
          onChange(e.target.value);
        }}
      />
    </foreignObject>
  );
}

function ColorEditor(
  { x, y, label, value, onChange }: {
    readonly x: number;
    readonly y: number;
    readonly label?: string;
    readonly value: string;
    readonly onChange: (value: string) => void;
  },
) {
  return (
    <foreignObject x={x} y={y} width={42} height={42}>
      <label
        style={{
          position: "relative",
          display: "block",
          width: 28,
          height: 28,
        }}
        title={label}
      >
        <span
          style={{
            position: "absolute",
            inset: 0,
            borderRadius: "50%",
            backgroundColor: value,
            border: "2px solid rgba(255, 255, 255, 0.45)",
            boxShadow: "0 1px 3px rgba(0, 0, 0, 0.35)",
            pointerEvents: "none",
          }}
        />
        <input
          type="color"
          aria-label={label}
          value={value}
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            padding: 0,
            border: "none",
            background: "transparent",
            cursor: "pointer",
            opacity: 0,
          }}
          onChange={(event) => {
            onChange(event.target.value);
          }}
        />
      </label>
    </foreignObject>
  );
}
