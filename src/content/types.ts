export type Headings =
  | "channel name"
  | "unique video id"
  | `current ${number}`
  | `replace ${number}`;

export type DataUnit = { completed: boolean } & Record<Headings, string>;
export type StateStorage = {
  dataList: DataUnit[];
  running: "idle" | "running" | "paused";
  currentChannel: string;
  switchChannelto?: string;
};
