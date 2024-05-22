import { runBot } from "./content/runner";
import { DataUnit, Headings, StateStorage } from "./content/types";
import {
  pauseButton,
  resumeButton,
  runButton,
  stopButton,
  uploadBtn,
} from "./content/ui";
import { hide, show } from "./utils";

async function handleButtonChange() {
  const data = (await chrome.storage.local.get(null)) as StateStorage;
  if (Object.keys(data).length === 0) {
    interupter = true;
    show(uploadBtn);
    hide(runButton, stopButton, resumeButton, pauseButton);
    return;
  }
  if (data.running === "idle" && data.dataList) {
    interupter = true;
    hide(uploadBtn, stopButton, resumeButton, pauseButton);
    show(runButton);
    return;
  }
  if (data.running === "paused" && data.dataList) {
    interupter = true;
    hide(uploadBtn, runButton, pauseButton);
    show(stopButton, resumeButton);
    return;
  }
  if (data.running === "running" && data.dataList) {
    interupter = false;
    hide(uploadBtn, runButton, resumeButton);
    show(stopButton, pauseButton);
    runBot();
  }
}

handleButtonChange();

let interupter = false;

chrome.storage.local.onChanged.addListener(async (changes) => {
  if (changes.dataList && !changes.running) return;
  handleButtonChange();
});

function isErrorPage() {
  return (
    document.getElementById("error-message")?.textContent ===
    "Oops, something went wrong."
  );
}
