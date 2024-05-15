import "./ui.ts";
import { saveToStorage, selectedFileData } from "./state.ts";
import { fillInputField, wait } from "./utils.ts";

console.log(chrome.runtime.id, "hello");

let running = false;
let prevIndex = 0;

//
selectedFileData.addListeners((value) => {
  if (value && value.status === "running") {
    if (!running) {
      running = true;
      startFetching();
    }
  } else {
    running = false;
  }
});

function getUpdateButton() {
  return document.querySelector(
    "#single-offer div.panel.sub-ids.open form button"
  ) as HTMLButtonElement | null;
}

function getTinyUrlSelectCheckbox() {
  return document.querySelector(
    "#single-offer div.tiny-url > label > input"
  ) as HTMLInputElement | null;
}

function getTrackingURLField() {
  return document.querySelector("#trackingLink") as HTMLTextAreaElement | null;
}

async function startFetching() {
  const addSubIdBtn = document.querySelector(
    "#single-offer div.header > ul > li:nth-child(3)"
  ) as HTMLInputElement | null;

  if (addSubIdBtn && addSubIdBtn.className !== "active") {
    addSubIdBtn.click();
    await wait(500);
  }

  if (getTinyUrlSelectCheckbox() && !getTinyUrlSelectCheckbox()?.checked) {
    getTinyUrlSelectCheckbox()?.click();
  }

  await wait(800);

  if (running) {
    console.log("fetching data");
    const value = selectedFileData.value();
    const data = value?.activeFileData;
    if (data) {
      console.log(data);
      while (prevIndex < data.length) {
        if (running) {
          const datums = data[prevIndex];
          console.log(datums);
          const inputFields = document.querySelectorAll("[id^='aff_sub']");
          for (let i = 0; i < inputFields.length; i++) {
            const inputField = inputFields[i] as HTMLInputElement;

            fillInputField(
              inputField, // @ts-ignore
              datums[`Sub ID${i + 1}`]
                ? // @ts-ignore
                  datums[`Sub ID${i + 1}`]
                : ""
            );
          }
          getUpdateButton()?.click();
          await wait(800);
          const trackingURL = getTrackingURLField()?.value;
          console.log(trackingURL);
          //@ts-ignore
          data[prevIndex]["url"] = trackingURL;
          prevIndex++;

          if (prevIndex % 3 === 0) {
            selectedFileData.setValue({
              activeFileData: data,
            });
            await saveToStorage(selectedFileData.value()!);
          }
        } else {
          break;
        }
      }
      selectedFileData.setValue({
        activeFileData: data,
      });
      if (prevIndex >= data.length) {
        running = false;
        prevIndex = 0;
        await saveToStorage(selectedFileData.value()!);
        selectedFileData.setValue(undefined);
      }
    }
  }
}
