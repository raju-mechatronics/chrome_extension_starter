//@ts-ignore
pdfjsLib.GlobalWorkerOptions.workerSrc = "./pdf.worker.js";

const fileInput = document.getElementById("file-input") as HTMLInputElement;
const output = document.getElementById("output") as HTMLDivElement;

function readText(file: File): Promise<string> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = function () {
      const typedarray = new Uint8Array(this.result as ArrayBuffer);
      const text = processPDF(typedarray);
      resolve(text);
    };
    reader.readAsArrayBuffer(file);
  });
}

fileInput.addEventListener("change", async (e) => {
  const target = e.target as HTMLInputElement | null;
  //@ts-ignore
  const file = e.target?.files[0];
  if (file) {
    const text = await readText(file);
    console.log({ text });
  }
  // extractData(text);
});

async function processPDF(data: Uint8Array) {
  // @ts-ignore
  const pdf = await pdfjsLib.getDocument({ data: data }).promise;
  let textContent = "";
  const numPages = pdf.numPages;

  for (let pageNum = 1; pageNum <= numPages; pageNum++) {
    const page = await pdf.getPage(pageNum);
    const text = await page.getTextContent();
    text.items.forEach((item: any) => {
      textContent += item.str + " ";
    });
  }

  console.log(textContent);
  return textContent;
}

function extractData(text: string) {
  const data: { [key: string]: string | string[] } = {};
  const medications: string[] = [];
  const lines = text.split("\n");

  lines.forEach((line) => {
    if (line.includes("Patient:")) {
      data["Patient"] = line.split("Patient:")[1].trim();
    } else if (line.includes("Patient Address:")) {
      data["Patient Address"] = line.split("Patient Address:")[1].trim();
    } else if (line.includes("Date of Birth:")) {
      data["Date of Birth"] = line.split("Date of Birth:")[1].trim();
    } else if (line.includes("NHS Number:")) {
      data["NHS Number"] = line.split("NHS Number:")[1].trim();
    } else if (line.match(/\d+mg|\d+micrograms/)) {
      medications.push(line.trim());
    }
  });

  data["Medications"] = medications;

  displayData(data);
}

function displayData(data: { [key: string]: string | string[] }) {
  const outputHtml = `
        <h2>Extracted Data</h2>
        <p><strong>Patient:</strong> ${data["Patient"]}</p>
        <p><strong>Patient Address:</strong> ${data["Patient Address"]}</p>
        <p><strong>Date of Birth:</strong> ${data["Date_of_Birth"]}</p>
        <p><strong>NHS Number:</strong> ${data["NHS Number"]}</p>
        <h3>Medications</h3>
        <ul>
            ${
              Array.isArray(data["Medications"])
                ? data["Medications"].map((med) => `<li>${med}</li>`).join("")
                : ""
            }
        </ul>
    `;

  output.innerHTML = outputHtml;
}
