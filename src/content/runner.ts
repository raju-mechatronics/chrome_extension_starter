import { wait } from "../utils";
import { writeString } from "./communicate";
import { DataUnit, Headings, StateStorage } from "./types";

async function formatStringToWrite(data: DataUnit, str: string) {
  const keys = Object.keys(data) as (keyof DataUnit)[];
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

async function updateList(currentData: DataUnit) {
  const { dataList } = (await chrome.storage.local.get("dataList")) as {
    dataList: DataUnit[];
  };
  if (!dataList) {
    chrome.storage.local.clear();
  }
  // find the current data unit and mark it as completed
  const updatedData = dataList.map((data) => {
    if (JSON.stringify(data) === JSON.stringify(currentData)) {
      return { ...data, completed: true };
    }
    return data;
  });
  await chrome.storage.local.set({ dataList: updatedData });
  return updatedData;
}

function findCurrentUndoneIndex(data: StateStorage["dataList"]) {
  for (let i = 0; i < data.length; i++) {
    if (data[i].completed) {
      continue;
    } else {
      return i;
    }
  }
  return -1;
}

async function getCurrentDataUnit() {
  const { dataList } = (await chrome.storage.local.get("dataList")) as {
    dataList: DataUnit[];
  };
  if (!dataList) {
    return;
  }
  const currentDataUnitIndex = findCurrentUndoneIndex(dataList);
  if (currentDataUnitIndex === -1) {
    return;
  }
  const currentDataUnit = dataList[currentDataUnitIndex];
  if (!currentDataUnit) {
    return;
  }
  return currentDataUnit;
}

function completed() {
  chrome.storage.local.clear();
  console.log("completed");
  return;
}

async function initChannelSwitch() {
  const currentData = await getCurrentDataUnit();
  if (!currentData) {
    completed();
    return;
  }
  await chrome.storage.local.set({
    switchChannelto: currentData["channel name"],
  });
  location.href = "https://www.youtube.com/channel_switcher";
}

function isChannelSwitchPage() {
  return window.location.href.startsWith("https://www.youtube.com/account");
}

async function switchChannel() {
  const { switchChannelto } = (await chrome.storage.local.get(
    "switchChannelto"
  )) as { switchChannelto: string };
  if (!switchChannelto) {
    return;
  }
  const currentData = await getCurrentDataUnit();
  if (!currentData) {
    completed();
    return;
  }
  const channelName = currentData["channel name"].trim();
  const channelNames = document.querySelectorAll(
    "#channel-title"
  ) as NodeListOf<HTMLElement>;
  if (channelNames.length === 0) {
    return completed();
  }
  for (const channel of channelNames) {
    if (channel.textContent === channelName) {
      channel.click();
      return;
    }
  }
}

async function isSwitchingChannel() {
  const fromStorage = await chrome.storage.local.get("switchChannelto");
  return !!fromStorage.switchChannelto;
}

async function goToStudio() {
  const avtBtn = document.querySelector(
    "#avatar-btn"
  ) as HTMLButtonElement | null;
  if (!avtBtn) {
    return;
  }
  avtBtn.click();
  await wait(1000);
  const studioNavigateBtn = document.querySelector(
    "#items > ytd-compact-link-renderer a[href*=studio]"
  ) as HTMLButtonElement | null;
  if (!studioNavigateBtn) {
    return;
  }
  studioNavigateBtn.click();
  chrome.storage.local.remove("switchChannelto");
}

async function isRunning() {
  const runningStorage = (await chrome.storage.local.get("running")) as {
    running: "running" | "paused" | "idle";
  };
  return runningStorage?.running === "running";
}

export async function runBot() {
  await wait(5000);
  if (!(await isRunning())) {
    return;
  }
  if (isErrorPage()) {
    await wait(100);
    initChannelSwitch();
    return;
  }

  if (await isSwitchingChannel()) {
    if (isChannelSwitchPage()) {
      await switchChannel();
      return;
    }

    return goToStudio();
  }
  const currentData = await getCurrentDataUnit();
  if (!currentData) {
    chrome.storage.local.clear();
    console.log("completed");
    return;
  } else {
    console.log(currentData);
    if (!currentData) {
      return;
    }
    const { "channel name": channelName, "unique video id": videoId } =
      currentData;
    console.log(videoId, channelName);
    if (getCurrentVideoId() !== videoId) {
      return updateVideoURL(videoId);
    }
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
    if (formattedDescription !== description) {
      const res = await writeString(formattedDescription, true);
      // const res = { status: "ok" };

      console.log(res);
    }
    await wait(1000);
    const saveBtn = getSaveBtn();
    if (!saveBtn) {
      return;
    }
    saveBtn.click();
    await waitSaveComplete();
    await updateList(currentData);
  }
  return runBot();
}

function getSaveBtn() {
  return document.querySelector("#save") as HTMLElement | null;
}

async function waitSaveComplete() {
  await wait(5000);
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

function isErrorPage() {
  console.log("error page");
  return (
    location.href.match(/https:\/\/studio.youtube.com\/video\/.*\/edit/gi) &&
    document.querySelector("ytcp-error-section:not([hidden])") &&
    document.getElementById("error-message")?.textContent ===
      "Oops, something went wrong."
  );
}
