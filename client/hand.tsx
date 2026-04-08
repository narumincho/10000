export function Hour24Hand(
  props: {
    readonly angle0To1: number;
    readonly color: string;
  },
) {
  return (
    <g transform={`rotate(${props.angle0To1 * 360})`}>
      <path
        d="M -6 0 C -5 -5 -2 -10 0 -44 C 2 -10 5 -5 6 0 C 3 2 2 8 0 16 C -2 8 -3 2 -6 0 Z"
        fill={props.color}
      />
    </g>
  );
}

export function MinuteHand(
  props: {
    readonly angle0To1: number;
    readonly color: string;
  },
) {
  return (
    <g transform={`rotate(${props.angle0To1 * 360})`}>
      <path
        d="M -4 0 C -3 -6 -1 -18 0 -70 C 1 -18 3 -6 4 0 C 2 2 1 10 0 20 C -1 10 -2 2 -4 0 Z"
        fill={props.color}
      />
    </g>
  );
}

export function SecondHand(
  props: {
    readonly angle0To1: number;
    readonly color: string;
  },
) {
  return (
    <g transform={`rotate(${props.angle0To1 * 360})`}>
      <path
        d="M -1 14 L -1 -74 L 0 -90 L 1 -74 L 1 14 Z"
        fill={props.color}
      />
      <path
        d="M -2 12 A 2 2 0 1 0 2 12 A 2 2 0 1 0 -2 12 Z"
        fill={props.color}
      />
    </g>
  );
}
