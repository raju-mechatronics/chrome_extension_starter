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
    // console.log({ text });
    console.log(extractInfo(text));
  }
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

  return textContent;
}

interface Medication {
  name: string;
  qty: string;
  dosage: string;
}

interface PatientInfo {
  name: string;
  address: string;
  dob: string;
  nhsNumber: string;
  medications: Medication[];
}

const extractInfo = (text: string): PatientInfo => {
  const nameMatch = text.match(/Patient\s*:\s*([^]+?)\s*Patient\s*Address\s*:/);
  const addressMatch = text.match(
    /Patient\s*Address\s*:\s*([^]+?)\s*Date\s*of\s*Birth\s*:/
  );
  const dobMatch = text.match(
    /Date\s*of\s*Birth\s*:\s*([^]+?)\s*NHS\s*Number\s*:/
  );
  const nhsNumberMatch = text.match(/NHS\s*Number\s*:\s*([^]+?)\s*We\s*have/);

  const medicationMatches = text.match(
    /Medication\s*Qty\s*Dosage\s*Notes\s*([^]+?)\s*Requested by:/
  );
  const medicationsText = medicationMatches ? medicationMatches[1].trim() : "";

  const medicationLines = medicationsText
    .split(/\s*(?=\d)/)
    .filter((line) => line.trim() !== "");

  const getType = (name: string): string => {
    if (/tablet|pill|capsule/i.test(name)) return "Pills";
    if (/spray/i.test(name)) return "Nasal Spray";
    if (/drop/i.test(name)) return "Drops";
    return "Other";
  };

  console.log(medicationLines);

  const medications: Medication[] = medicationLines.map((line) => {
    const [name, qtyDosage] = line.split(/\s+(?=\d)/);
    const [qty, ...dosageParts] = qtyDosage?.split(" ");
    const dosage = dosageParts?.join(" ");
    const type = getType(name?.trim());
    return {
      name: name.trim(),
      qty: qty.trim(),
      dosage: dosage.trim(),
      type: type,
    };
  });

  return {
    name: nameMatch ? nameMatch[1].trim() : "",
    address: addressMatch ? addressMatch[1].trim() : "",
    dob: dobMatch ? dobMatch[1].trim() : "",
    nhsNumber: nhsNumberMatch ? nhsNumberMatch[1].trim() : "",
    medications: medications,
  };
};

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
