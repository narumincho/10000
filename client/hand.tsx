export type Hour24HandDesign = "leaf" | "sword" | "bar";
export type MinuteHandDesign = "dauphine" | "sword" | "bar";
export type SecondHandDesign = "needle" | "lollipop" | "pointer";

export const hour24HandDesignOptions: readonly Hour24HandDesign[] = [
  "leaf",
  "sword",
  "bar",
];

export const minuteHandDesignOptions: readonly MinuteHandDesign[] = [
  "dauphine",
  "sword",
  "bar",
];

export const secondHandDesignOptions: readonly SecondHandDesign[] = [
  "needle",
  "lollipop",
  "pointer",
];

export function Hour24Hand(
  props: {
    readonly angle0To1: number;
    readonly color: string;
    readonly design: Hour24HandDesign;
  },
) {
  return (
    <g transform={`rotate(${props.angle0To1 * 360})`}>
      {props.design === "leaf" && (
        <path
          d="M -6 0 C -5 -5 -2 -10 0 -44 C 2 -10 5 -5 6 0 C 3 2 2 8 0 16 C -2 8 -3 2 -6 0 Z"
          fill={props.color}
        />
      )}
      {props.design === "sword" && (
        <path
          d="M -4 14 L -4 2 L -8 -2 L -2 -12 L -1 -48 L 0 -56 L 1 -48 L 2 -12 L 8 -2 L 4 2 L 4 14 Z"
          fill={props.color}
        />
      )}
      {props.design === "bar" && (
        <path
          d="M -3 16 L -3 -40 L -6 -46 L 0 -54 L 6 -46 L 3 -40 L 3 16 Z"
          fill={props.color}
        />
      )}
    </g>
  );
}

export function MinuteHand(
  props: {
    readonly angle0To1: number;
    readonly color: string;
    readonly design: MinuteHandDesign;
  },
) {
  return (
    <g transform={`rotate(${props.angle0To1 * 360})`}>
      {props.design === "dauphine" && (
        <path
          d="M -4 0 C -3 -6 -1 -18 0 -70 C 1 -18 3 -6 4 0 C 2 2 1 10 0 20 C -1 10 -2 2 -4 0 Z"
          fill={props.color}
        />
      )}
      {props.design === "sword" && (
        <path
          d="M -3 18 L -3 2 L -6 -2 L -2 -18 L -1 -74 L 0 -84 L 1 -74 L 2 -18 L 6 -2 L 3 2 L 3 18 Z"
          fill={props.color}
        />
      )}
      {props.design === "bar" && (
        <path
          d="M -2.5 20 L -2.5 -64 L -5 -70 L 0 -82 L 5 -70 L 2.5 -64 L 2.5 20 Z"
          fill={props.color}
        />
      )}
    </g>
  );
}

export function SecondHand(
  props: {
    readonly angle0To1: number;
    readonly color: string;
    readonly design: SecondHandDesign;
  },
) {
  return (
    <g transform={`rotate(${props.angle0To1 * 360})`}>
      {props.design === "needle" && (
        <>
          <path
            d="M -1 14 L -1 -74 L 0 -90 L 1 -74 L 1 14 Z"
            fill={props.color}
          />
          <path
            d="M -2 12 A 2 2 0 1 0 2 12 A 2 2 0 1 0 -2 12 Z"
            fill={props.color}
          />
        </>
      )}
      {props.design === "lollipop" && (
        <>
          <path
            d="M -1 18 L -1 -76 L 0 -90 L 1 -76 L 1 18 Z"
            fill={props.color}
          />
          <circle
            cx={0}
            cy={-58}
            r={6}
            fill="none"
            stroke={props.color}
            strokeWidth={2}
          />
          <circle cx={0} cy={12} r={2} fill={props.color} />
        </>
      )}
      {props.design === "pointer" && (
        <>
          <path
            d="M -1 18 L -1 -50 L 0 -90 L 1 -50 L 1 18 Z"
            fill={props.color}
          />
          <path
            d="M -4 -36 L 0 -90 L 4 -36 Z"
            fill={props.color}
          />
        </>
      )}
    </g>
  );
}
