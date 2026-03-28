export type Clock24Parameter = {
  readonly message: string;
  readonly deadline:
    | Deadline
    | undefined;
};

export type Deadline = {
  readonly date: Date;
  readonly timezoneOffset: number;
  readonly at: Date;
};
