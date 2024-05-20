import { wait } from "../utils";
import { writeString } from "./communicate";
import { DataUnit, Headings, StateStorage } from "./types";

async function formatStringToWrite(data: DataUnit, str: string) {
  const keys = Object.keys(data) as (keyof DataUnit)[];
  // {"current 1" : "replace 1"}
  for (const key of keys) {
    if (key.startsWith("current")) {
      const currentIndex = key.split(" ")[1];
      const replaceKey = `replace ${currentIndex}` as Headings;
      const currentKey = key as Headings;
      if (!data[currentKey] || !data[replaceKey]) continue;
      str = str.replace(data[currentKey], data[replaceKey]);
    }
  }
  return str;
}

async function updateList(data: StateStorage["dataList"], updateIndex: number) {
  const updatedData = data.map((item, index) => {
    if (index === updateIndex) {
      return { ...item, completed: true };
    } else {
      return item;
    }
  });
  await chrome.storage.local.set({ dataList: updatedData });
  return updatedData;
}

async function findCurrentUndoneIndex(data: StateStorage["dataList"]) {
  for (let i = 0; i < data.length; i++) {
    if (data[i].completed) {
      continue;
    } else {
      return i;
    }
  }
  return -1;
}

export async function runBot(dataList: DataUnit[]) {
  const currentData = await chrome.storage.local.get(["dataList"]);
  const data = currentData.dataList;
  if (!data) {
    return;
  }
  const currentDataIndex = await findCurrentUndoneIndex(data);
  if (currentDataIndex === -1) {
    console.log("finished");
    chrome.storage.local.clear();
    return;
  } else {
    const currentData = data[currentDataIndex];
    const { "channel name": channelName, "unique video id": videoId } =
      currentData;
    const descriptionBox = getDescriptionBox() as HTMLElement | null;
    if (!descriptionBox) {
      return;
    }
    const description = descriptionBox.innerText;
    descriptionBox.click();
    descriptionBox.focus();
    const formattedDescription = await formatStringToWrite(
      currentData,
      description
    );
    writeString(formattedDescription, true);
    return;
  }
  updateList(dataList, await findCurrentUndoneIndex(dataList));
}

function getSaveBtn() {
  return document.querySelector("#save");
}

async function waitSaveComplete() {
  const loadChangeEl = document.querySelector(
    "#entity-page"
  ) as HTMLDivElement | null;
  if (!loadChangeEl) {
    return;
  }
  while (loadChangeEl.classList.contains("loading")) {
    await wait(1000);
  }
}

function getCurrentVideoId() {
  const url = window.location.href;
  if (url.startsWith("https://studio.youtube.com/video/")) {
    const videoId = url.split("/")[4];
    return videoId;
  }
  return null;
}

function updateVideoURL(videoId: string) {
  location.href = `https://studio.youtube.com/video/${videoId}/edit`;
}

function getDescriptionBox() {
  return document.querySelectorAll("#textbox")[1];
}
