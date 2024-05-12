import { createState } from "./utils.ts";

type NordStorageId = `nord_storage_${number}`;
type SharkVpnStorageId = `shark_vpn_storage_${number}`;

type RunningState = {
  status: "running" | "idle" | "error" | "paused";
  activeFileData: {
    //@ts-ignore
    [key: `Sub ID${1 | 2 | 3 | 4 | 5}`]: string;
    url?: string;
  }[];
  activeFileName: string;
  activeId: number;
};

export type StorageData = {
  fileName: string;
  id: number;
  data: {
    //@ts-ignore
    [key: `Sub ID${1 | 2 | 3 | 4 | 5}`]: string;
    url?: string;
  }[];
};

export type STATE = {
  [key in NordStorageId | SharkVpnStorageId]: StorageData;
};

export const selectedFileData = createState<RunningState | undefined>(
  undefined,
);
export const viewTableData = createState(false);

export const saveToStorage = async (runningState: RunningState) => {
  const data: StorageData = {
    fileName: runningState.activeFileName,
    id: runningState.activeId,
    data: runningState.activeFileData,
  };

  if (document.URL.includes("nordvpn")) {
    await chrome.storage.local.set({
      ["nord_storage_" + data.id]: data,
    });
  } else if (document.URL.includes("surfshark")) {
    await chrome.storage.local.set({
      ["shark_vpn_storage_" + data.id]: data,
    });
  }
};
