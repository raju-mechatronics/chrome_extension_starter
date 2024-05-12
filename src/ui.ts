import Papa from "papaparse";
import {
  saveToStorage,
  selectedFileData,
  STATE,
  StorageData,
  viewTableData,
} from "./state.ts";
import { hide, show } from "./utils.ts";

const container = document.createElement("div");
container.id = "ext_container";
container.className = "extension_container";
document.body!.appendChild(container);

export function createTable() {
  const table = document.createElement("dialog");
  table.id = "ext_dialog";
  table.innerHTML = `
  <div class="table-container">
  <table id="ext_dataTable">
    <thead>
        <tr>
            <th>Index</th>
            <th>Name</th>
            <th>Data Count</th>
            <th>Action</th>
        </tr>
    </thead> 
    <tbody id="ext_tableBody">
        <tr>
        </tr>
    </tbody>
    </table>
    </div>`;
  return table;
}

function createRow(index: number, id: string, name: string, dataCount: number) {
  const row = document.createElement("tr");
  row.innerHTML = `
    <td>${index}</td>
    <td>${name}</td>
    <td>${dataCount}</td>
    <td>
        <button id=${id} class="delete-button">delete</button>
        <button id=${id} class="download-button">download</button>
    </td>`;
  return row;
}

//create a round button

export const createButton = (
  text: string,
  color: string,
  onClick: (e: MouseEvent) => void,
  parent: HTMLElement,
) => {
  const button = document.createElement("button");
  button.innerText = text;
  button.style.backgroundColor = color;
  button.style.borderRadius = "20px";

  button.addEventListener("click", (e) => {
    onClick(e);
  });

  parent.appendChild(button);
  return button;
};

const createUploadButton = () => {
  //upload button
  const uploadButton = document.createElement("input");
  uploadButton.type = "file";
  uploadButton.id = "upload_from_extension";
  uploadButton.setAttribute("hidden", "true");
  // uploadButton.innerText = "file";
  //allow only csv
  uploadButton.setAttribute("accept", ".csv");
  container.appendChild(uploadButton);
  const button = createButton(
    "Upload",
    "blue",
    () => uploadButton.click(),
    container,
  );
  container.appendChild(button);

  uploadButton.addEventListener("change", (e) => {
    //@ts-ignore
    const file = e.target?.files[0];
    Papa.parse(file, {
      header: true,
      complete: (result) => {
        selectedFileData.setValue({
          activeFileName: file.name,
          activeFileData: result.data.filter((e: any) => {
            return (
              e["Sub ID1"] ||
              e["Sub ID2"] ||
              e["Sub ID3"] ||
              e["Sub ID4"] ||
              e["Sub ID5"]
            );
          }) as any,
          activeId: Date.now(),
          status: "idle",
        });
      },
      error: (error) => {
        console.log(error);
      },
    });
  });

  return button;
};

const tableView = createButton(
  "view",
  "#8b8181",
  () => {
    viewTableData.setValue(!viewTableData.value());
  },
  container,
);
const uploadButton = createUploadButton();
const stopButton = createButton(
  "Stop",
  "red",
  async () => {
    const data = selectedFileData.value();
    if (data) {
      await saveToStorage(data);
    }
    selectedFileData.setValue(undefined);
  },
  container,
);
const startButton = createButton(
  "Start",
  "green",
  () => {
    if (selectedFileData.value())
      selectedFileData.setValue({
        status: "running",
      });
  },
  container,
);
const pauseButton = createButton(
  "Pause",
  "orange",
  () => {
    if (selectedFileData.value())
      selectedFileData.setValue({
        status: "paused",
      });
  },
  container,
);

const resumeButton = createButton(
  "Resume",
  "green",
  () => {
    if (selectedFileData.value())
      selectedFileData.setValue({
        status: "running",
      });
  },
  container,
);

hide(startButton);
hide(pauseButton);
hide(stopButton);
hide(resumeButton);

selectedFileData.addListeners((data) => {
  if (data) {
    if (data.status === "idle") {
      show(startButton);
      show(uploadButton);
      hide(pauseButton);
      hide(stopButton);
      hide(resumeButton);
      show(tableView);
    }
    if (data.status === "running") {
      hide(startButton);
      show(pauseButton);
      show(stopButton);
      hide(resumeButton);
      hide(uploadButton);
      hide(tableView);
    }
    if (data.status === "paused") {
      hide(startButton);
      hide(pauseButton);
      show(stopButton);
      show(resumeButton);
      hide(uploadButton);
      hide(tableView);
    }
  } else {
    hide(startButton);
    hide(pauseButton);
    hide(stopButton);
    hide(resumeButton);
    show(uploadButton);
    show(tableView);
  }
});

const tableDialog = createTable();
container.appendChild(tableDialog);
viewTableData.addListeners((data) => {
  if (data) {
    tableDialog.setAttribute("open", "true");
  } else {
    tableDialog.removeAttribute("open");
  }
});

tableDialog.addEventListener("click", (e) => {
  const target = e.target as HTMLDialogElement;
  if (target === tableDialog) {
    viewTableData.setValue(false);
  }
});

function renderTable(
  rows: { index: number; id: string; name: string; dataCount: number }[],
) {
  const tableBody = tableDialog.querySelector("tbody");
  if (tableBody) {
    tableBody.innerHTML = "";
    rows.forEach((row) => {
      tableBody.appendChild(
        createRow(row.index, row.id, row.name, row.dataCount),
      );
    });
  }
}

async function getRenderDataFromStorage() {
  const allData: STATE = await chrome.storage.local.get(null);
  console.log(allData);
  const rows = Object.keys(allData).map((key, index) => {
    const { fileName, data } = allData[key as keyof STATE] as StorageData;
    return {
      index: index + 1,
      id: key,
      name: fileName,
      dataCount: data.length,
    };
  });
  return rows;
}

getRenderDataFromStorage().then((data) => {
  renderTable(data);
});

chrome.storage.onChanged.addListener(async () => {
  const data = await getRenderDataFromStorage();
  renderTable(data);
});

tableDialog.querySelector("table")?.addEventListener("click", async (e) => {
  const target = e.target as HTMLButtonElement;
  console.log(target);
  if (target.className === "download-button") {
    const id = target.id;
    const data = await chrome.storage.local.get(id);
    const { fileName, data: fileData } = data[id] as StorageData;
    const csv = Papa.unparse(fileData);
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = fileName;
    a.click();
  }
  if (target.className === "delete-button") {
    const id = target.id;
    await chrome.storage.local.remove(id);
  }
});

hide(container);

setInterval(() => {
  if (
    document.URL.startsWith(
      "https://affiliates.nordvpn.com/publisher/#!/offer/",
    ) ||
    document.URL.startsWith(
      "https://surfshark.hasoffers.com/publisher/#!/offer/",
    )
  ) {
    if (container.hidden) show(container);
  } else {
    if (!container.hidden) hide(container);
  }
}, 500);
