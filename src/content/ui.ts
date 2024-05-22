import { hide } from "../utils";
import {
  addButtonContainer,
  addUploadButton,
  createButton,
} from "./components";
import parseSheet from "./sheetReader";

const container = addButtonContainer("bottom-right", 10, 10);
const uploadBtn = addUploadButton();
const uploadButton = createButton("Upload", {
  parent: container,
  onClick: () => {
    uploadBtn.click();
  },
  style: {
    margin: "2px",
    padding: "5px",
    borderRadius: "5px",
    backgroundColor: "green",
    color: "white",
  },
});
const runButton = createButton("Start", {
  parent: container,
  onClick: () => {
    chrome.storage.local.set({ running: "running" });
  },
  style: {
    margin: "2px",
    padding: "5px",
    borderRadius: "5px",
    backgroundColor: "blue",
    color: "white",
  },
});

const stopButton = createButton("Stop", {
  parent: container,
  onClick: () => {
    chrome.storage.local.clear();
  },
  style: {
    margin: "2px",
    padding: "5px",
    borderRadius: "5px",
    backgroundColor: "red",
    color: "white",
  },
});

const pauseButton = createButton("Pause", {
  parent: container,
  onClick: () => {
    chrome.storage.local.set({ running: "paused" });
  },
  style: {
    margin: "2px",
    padding: "5px",
    borderRadius: "5px",
    backgroundColor: "blue",
    color: "white",
  },
});

const resumeButton = createButton("Resume", {
  parent: container,
  onClick: () => {
    chrome.storage.local.set({ running: "running" });
  },
  style: {
    margin: "2px",
    padding: "5px",
    borderRadius: "5px",
    backgroundColor: "blue",
    color: "white",
  },
});

uploadBtn.onchange = async () => {
  const file = uploadBtn.files?.[0];
  if (!file) {
    return;
  }
  const data = await parseSheet(file);
  console.log(data);
  chrome.storage.local.set({ dataList: data, running: "idle" });
};

export { uploadBtn, runButton, stopButton, pauseButton, resumeButton };
