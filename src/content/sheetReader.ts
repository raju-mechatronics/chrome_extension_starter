import { read, WorkBook } from "xlsx";

// read from xlsx file
function readFromXlsx(file: File): Promise<WorkBook> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = function (e) {
      const data = e.target?.result;
      if (!data) {
        reject("No data found");
        return;
      }
      const workbook = read(data, { type: "array" });
      resolve(workbook);
    };
    reader.onerror = function (e) {
      reject(e);
    };
    reader.readAsArrayBuffer(file);
  });
}

function parseWorkbookToJson(workBook: WorkBook, sheetName?: string) {
  const sheet = workBook.Sheets[sheetName || workBook.SheetNames[0]];
  const ref = sheet["!ref"];
  if (!ref) {
    return [];
  }
  const [start, end] = ref.split(":");
  const parseResult: any[] = [];
  const headings: Record<string, string> = {};
  for (let row = +start.charAt(1); row <= +end.charAt(1); row++) {
    console.log(headings, parseResult);
    const unitResult: Record<string, any> = {};
    for (let col = start.charCodeAt(0); col <= end.charCodeAt(0); col++) {
      if (row === +start.charAt(1)) {
        console.log();
        headings[col.toString()] = sheet[String.fromCharCode(col) + row].v;
        continue;
      } else {
        console.log(
          headings[col.toString()],
          col,
          String.fromCharCode(col),
          row,
          sheet[String.fromCharCode(col) + row]
        );
        unitResult[headings[col.toString()]] =
          sheet[String.fromCharCode(col) + row]?.v;
      }
    }
    if (Object.keys(unitResult).length === 0) {
      continue;
    }
    unitResult["completed"] = false;
    parseResult.push(unitResult);
  }
  return parseResult;
}

export default async function parseSheet(file: File) {
  const workbook = await readFromXlsx(file);
  return parseWorkbookToJson(workbook);
}
