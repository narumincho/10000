import { UrlParameter } from "./url.ts";

export type TimeDifferenceText = {
  readonly days: number;
  readonly hours: number;
  readonly minutes: number;
  readonly seconds: number;
  readonly after: boolean;
};

export function TimeDifferencePanel(
  {
    message,
    baseDateText,
    plusDays,
    targetDateText,
    timeDifference,
    theme,
    onMessageChange,
    onBaseDateChange,
    onPlusDaysChange,
  }: {
    readonly message: string;
    readonly baseDateText: string;
    readonly plusDays: number;
    readonly targetDateText: string;
    readonly timeDifference: TimeDifferenceText;
    readonly theme: UrlParameter["theme"];
    readonly onMessageChange: (newMessage: string) => void;
    readonly onBaseDateChange: (newBaseDate: string) => void;
    readonly onPlusDaysChange: (newPlusDays: number) => void;
  },
) {
  return (
    <div
      style={{
        height: "100%",
        display: "grid",
        placeItems: "center",
        color: "white",
      }}
    >
      <div
        style={{
          width: "min(100%, 420px)",
          display: "grid",
          gap: 14,
          padding: "28px 24px",
          borderRadius: 28,
          border: `1px solid ${theme.infoOutline}`,
          background: "rgba(255, 255, 255, 0.12)",
          boxShadow: "0 20px 48px rgba(0, 0, 0, 0.2)",
          backdropFilter: "blur(12px)",
        }}
      >
        <PanelField
          label="メッセージ"
          value={message}
          type="text"
          textColor={theme.infoText}
          outlineColor={theme.infoOutline}
          onChange={onMessageChange}
        />
        <PanelField
          label="日付"
          value={baseDateText}
          type="date"
          textColor={theme.infoText}
          outlineColor={theme.infoOutline}
          onChange={onBaseDateChange}
        />
        <PanelField
          label="+ する日数"
          value={plusDays.toString()}
          type="number"
          textColor={theme.infoText}
          outlineColor={theme.infoOutline}
          onChange={(value) => {
            onPlusDaysChange(parseInteger(value));
          }}
        />
        <div
          style={{
            paddingTop: 8,
            borderTop: `1px solid ${theme.infoOutline}`,
            display: "grid",
            gap: 8,
            textAlign: "center",
          }}
        >
          <div style={{ fontSize: 18, fontWeight: 700 }}>
            「{targetDateText}」まで
          </div>
          <div
            style={{ fontSize: 28, fontWeight: 800, letterSpacing: "0.04em" }}
          >
            {timeDifference.after ? "経過" : "あと"} {timeDifference.days} 日
            {" "}
            {timeDifference.hours} 時間 {timeDifference.minutes} 分{" "}
            {timeDifference.seconds} 秒
          </div>
        </div>
      </div>
    </div>
  );
}

function PanelField(
  { label, value, type, outlineColor, onChange }: {
    readonly label: string;
    readonly value: string;
    readonly type: "text" | "date" | "number";
    readonly textColor: string;
    readonly outlineColor: string;
    readonly onChange: (value: string) => void;
  },
) {
  return (
    <label
      style={{
        display: "grid",
        gap: 6,
      }}
    >
      <span style={{ fontSize: 14, fontWeight: 700 }}>{label}</span>
      <input
        type={type}
        value={value}
        style={{
          width: "100%",
          borderRadius: 14,
          color: "white",
          border: `1px solid ${outlineColor}`,
          background: "rgba(20, 16, 16, 0.6)",
          padding: "12px 14px",
          fontSize: 18,
          outline: "none",
        }}
        onChange={(event) => {
          onChange(event.target.value);
        }}
      />
    </label>
  );
}

export function addDaysToDateText(dateText: string, plusDays: number): string {
  return Temporal.PlainDate.from(dateText).add({ days: plusDays }).toString();
}

export function dateTextToInstant(
  dateText: string,
  timezone: string,
): Temporal.Instant {
  return Temporal.PlainDate.from(dateText)
    .toZonedDateTime({ timeZone: timezone, plainTime: "00:00:00" })
    .toInstant();
}

function parseInteger(value: string): number {
  const parsed = Number.parseInt(value, 10);
  return Number.isNaN(parsed) ? 0 : parsed;
}
