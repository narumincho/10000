import React, { useEffect } from "react";
import { ClockSetting } from "./clockSetting.tsx";
import { UrlParameter } from "./url.ts";

function useAnimationFrame(callback = () => {}) {
  const reqIdRef = React.useRef<number>(undefined);
  const loop = React.useCallback(() => {
    reqIdRef.current = requestAnimationFrame(loop);
    callback();
  }, [callback]);

  React.useEffect(() => {
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
  const [timezone, setTImezone] = React.useState<string | undefined>(
    parameter.timezone,
  );
  useEffect(() => {
    setTImezone(Temporal.Now.timeZoneId());
  });

  if (!timezone) {
    return <div>loading timezone...</div>;
  }
  return (
    <Clock24WithTimezone
      message={parameter.message}
      timezone={timezone}
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
  const [isSettingMode, setIsSettingMode] = React.useState<boolean>(false);
  const [now, setNow] = React.useState<Temporal.Instant>(initialInstant);

  useAnimationFrame(() => {
    setNow(Temporal.Now.instant());
  });

  const zonedNow = now.toZonedDateTimeISO(timezone);
  const seconds = zonedNow.second;

  const limitValueAndUnit = targetDate === undefined
    ? undefined
    : timeToDisplayText({ targetDate, now });

  return (
    <div
      style={{ backgroundColor: "#724242", height: "100%", display: "grid" }}
    >
      <svg
        style={{
          gridColumn: "1 / 2",
          gridRow: "1 / 2",
          width: "100%",
          height: "100%",
          display: "grid",
        }}
        viewBox="-100 -100 200 200"
      >
        <circle cx={0} cy={0} r={93} stroke="#ca8484" fill="#b56566" />
        {Array.from({ length: 24 }).map((_, index) => {
          const angle = index / 24 * Math.PI * 2 - Math.PI / 2;
          return (
            <text
              text-anchor="middle"
              alignment-baseline="middle"
              x={Math.cos(angle) * 75}
              y={Math.sin(angle) * 75}
              fill="#000"
              fontSize={12}
            >
              {index}
            </text>
          );
        })}
        {Array.from({ length: 60 }).map((_, index) => {
          const angle = index / 60 * Math.PI * 2 - Math.PI / 2;
          const isFive = index % 5 === 0;
          return (
            <line
              x1={Math.cos(angle) * (isFive ? 85 : 87)}
              y1={Math.sin(angle) * (isFive ? 85 : 87)}
              x2={Math.cos(angle) * 93}
              y2={Math.sin(angle) * 93}
              strokeWidth={isFive ? 2 : 1}
              stroke="#000"
            />
          );
        })}
        <Needle
          angle0To1={seconds / (1000 * 60)}
          color="#FA2222"
          length={90}
          width={1}
        />
        <Needle
          angle0To1={seconds / (1000 * 60 * 60)}
          color="#FAE080"
          length={70}
          width={2}
        />
        <Needle
          angle0To1={seconds / (1000 * 60 * 60 * 24)}
          color="#60554A"
          length={50}
          width={3}
        />
        <text
          x={0}
          y={-30}
          textAnchor="middle"
          alignmentBaseline="middle"
          fill="#400488"
          stroke="white"
          strokeWidth={0.5}
          fontSize={18}
        >
          {message}
        </text>
        {limitValueAndUnit && (
          <text
            x={0}
            y={-10}
            textAnchor="middle"
            alignmentBaseline="middle"
            fill="#400488"
            stroke="white"
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
          fill="#400488"
          stroke="white"
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
          fill="#400488"
          stroke="white"
          strokeWidth={0.5}
          fontSize={18}
        >
          {(Math.floor(seconds / (1000 * 60 * 60)) % 24).toString().padStart(
            2,
            "0",
          )}:{(Math.floor(seconds / (1000 * 60)) % 60).toString().padStart(
            2,
            "0",
          )}:{(Math.floor(seconds / (1000)) % 60).toString().padStart(2, "0")}
        </text>
        <time>
          {now.toZonedDateTimeISO(timezone).toString()}
        </time>
      </svg>
      {isSettingMode &&
        (
          <div
            style={{
              gridColumn: "1 / 2",
              gridRow: "1 / 2",
              backdropFilter: "blur(8px)",
            }}
          >
            <ClockSetting
              message={message}
              timezone={timezone}
              targetDate={targetDate}
              now={now}
              onChangeUrl={onChangeUrl}
            />
          </div>
        )}
      <div
        style={{
          gridColumn: "1 / 2",
          gridRow: "1 / 2",
          justifySelf: "end",
          zIndex: "1",
        }}
      >
        <button
          type="button"
          style={{
            padding: 16,
            cursor: "pointer",
            backgroundColor: "black",
            fontSize: 24,
          }}
          onClick={() => {
            setIsSettingMode((prev) => !prev);
          }}
        >
          ⚙️
        </button>
      </div>
    </div>
  );
}

export function Needle(
  props: {
    readonly angle0To1: number;
    readonly color: string;
    readonly length: number;
    readonly width: number;
  },
) {
  return (
    <g transform={`rotate(${(props.angle0To1 * 360 + 270) % 360})`}>
      <polygon
        points={`-5 0 0 -${props.width} ${props.length} 0 0 ${props.width} -5 0`}
        fill={props.color}
      />
    </g>
  );
}

export function clock24Title(parameter: UrlParameter) {
  return parameter.message + " | 1周24時間の時計 | definy";
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
