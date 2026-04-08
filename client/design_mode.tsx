import {
  type Hour24HandDesign,
  hour24HandDesignOptions,
  type MinuteHandDesign,
  minuteHandDesignOptions,
  type SecondHandDesign,
  secondHandDesignOptions,
} from "./hand.tsx";

export type ClockTheme = {
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

export const defaultTheme: ClockTheme = {
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

export type HandDesigns = {
  readonly hour24: Hour24HandDesign;
  readonly minute: MinuteHandDesign;
  readonly second: SecondHandDesign;
};

export const defaultHandDesigns: HandDesigns = {
  hour24: "leaf",
  minute: "dauphine",
  second: "needle",
};

export type OddHourNumberDisplay = "same" | "small" | "hidden";

export const oddHourNumberDisplayOptions: readonly OddHourNumberDisplay[] = [
  "same",
  "small",
  "hidden",
];

export function DesignMode(
  {
    theme,
    handDesigns,
    oddHourNumberDisplay,
    onThemeChange,
    onHandDesignsChange,
    onOddHourNumberDisplayChange,
  }: {
    readonly theme: ClockTheme;
    readonly handDesigns: HandDesigns;
    readonly oddHourNumberDisplay: OddHourNumberDisplay;
    readonly onThemeChange: (theme: ClockTheme) => void;
    readonly onHandDesignsChange: (handDesigns: HandDesigns) => void;
    readonly onOddHourNumberDisplayChange: (
      oddHourNumberDisplay: OddHourNumberDisplay,
    ) => void;
  },
) {
  return (
    <>
      <ColorEditor
        x={-96}
        y={72}
        label="背景"
        value={theme.background}
        onChange={(background) => onThemeChange({ ...theme, background })}
      />
      <ColorEditor
        x={-96}
        y={-96}
        label="外枠"
        value={theme.dialStroke}
        onChange={(dialStroke) => onThemeChange({ ...theme, dialStroke })}
      />
      <ColorEditor
        x={54}
        y={-96}
        label="文字盤"
        value={theme.dialFill}
        onChange={(dialFill) => onThemeChange({ ...theme, dialFill })}
      />
      <ColorEditor
        x={-96}
        y={-16}
        label="目盛"
        value={theme.markers}
        onChange={(markers) => onThemeChange({ ...theme, markers })}
      />
      <SelectEditor
        x={-96}
        y={18}
        label="奇数数字"
        value={oddHourNumberDisplay}
        options={oddHourNumberDisplayOptions}
        onChange={onOddHourNumberDisplayChange}
      />
      <ColorEditor
        x={-44}
        y={44}
        label="24h針"
        value={theme.hourHand}
        onChange={(hourHand) => onThemeChange({ ...theme, hourHand })}
      />
      <SelectEditor
        x={-70}
        y={52}
        label="24h針"
        value={handDesigns.hour24}
        options={hour24HandDesignOptions}
        onChange={(hour24) => onHandDesignsChange({ ...handDesigns, hour24 })}
      />
      <ColorEditor
        x={0}
        y={-84}
        label="分針"
        value={theme.minuteHand}
        onChange={(minuteHand) => onThemeChange({ ...theme, minuteHand })}
      />
      <SelectEditor
        x={-26}
        y={-96}
        label="分針"
        value={handDesigns.minute}
        options={minuteHandDesignOptions}
        onChange={(minute) => onHandDesignsChange({ ...handDesigns, minute })}
      />
      <ColorEditor
        x={70}
        y={-12}
        label="秒針"
        value={theme.secondHand}
        onChange={(secondHand) => onThemeChange({ ...theme, secondHand })}
      />
      <SelectEditor
        x={68}
        y={0}
        label="秒針"
        value={handDesigns.second}
        options={secondHandDesignOptions}
        onChange={(second) => onHandDesignsChange({ ...handDesigns, second })}
      />
      <ColorEditor
        x={44}
        y={44}
        label="文字"
        value={theme.infoText}
        onChange={(infoText) => onThemeChange({ ...theme, infoText })}
      />
      <ColorEditor
        x={-8}
        y={72}
        label="縁取り"
        value={theme.infoOutline}
        onChange={(infoOutline) => onThemeChange({ ...theme, infoOutline })}
      />
    </>
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

function SelectEditor<T extends string>(
  { x, y, label, value, options, onChange }: {
    readonly x: number;
    readonly y: number;
    readonly label: string;
    readonly value: T;
    readonly options: readonly T[];
    readonly onChange: (value: T) => void;
  },
) {
  return (
    <foreignObject x={x} y={y} width={54} height={18}>
      <select
        aria-label={label}
        value={value}
        style={{
          width: "100%",
          height: "100%",
          borderRadius: 999,
          border: "1px solid rgba(255, 255, 255, 0.35)",
          background: "rgba(20, 16, 16, 0.85)",
          color: "#ffffff",
          fontSize: 8,
          padding: "0 6px",
          outline: "none",
        }}
        onChange={(event) => {
          onChange(event.target.value as T);
        }}
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </foreignObject>
  );
}
