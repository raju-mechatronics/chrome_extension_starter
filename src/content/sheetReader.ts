import { read, WorkBook } from "xlsx";

function convertToNumber(val: string) {
  var base = "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
    i,
    j,
    result = 0;

  for (i = 0, j = val.length - 1; i < val.length; i += 1, j -= 1) {
    result += Math.pow(base.length, j) * (base.indexOf(val[i]) + 1);
  }

  return result;
}

function convertNumberToLetter(val: number) {
  var base = "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
    result = "",
    i;

  while (val > 0) {
    i = val % base.length;
    if (i === 0) {
      i = base.length;
    }
    result = base[i - 1] + result;
    val = (val - i) / base.length;
  }

  return result;
}

// extract the column number from the cell reference
function extractColumn(cell: string) {
  const num = cell.replace(/[0-9]/g, "");
  return convertToNumber(num);
}

// extract the row number from the cell reference
function extractRow(cell: string) {
  const num = cell.replace(/[A-Z]/g, "");
  return parseInt(num);
}

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
  for (let row = extractRow(start); row <= extractRow(end); row++) {
    console.log(headings, parseResult);
    const unitResult: Record<string, any> = {};
    for (let col = extractColumn(start); col <= extractColumn(end); col++) {
      if (row === extractRow(start)) {
        console.log(row);
        const val = sheet[convertNumberToLetter(col) + row]?.v;
        if (val) headings[convertNumberToLetter(col)] = val;
        continue;
      } else {
        console.log(
          headings[col.toString()],
          col,
          String.fromCharCode(col),
          row,
          sheet[String.fromCharCode(col) + row]
        );
        const val = sheet[convertNumberToLetter(col) + row]?.v;
        if (val) unitResult[headings[convertNumberToLetter(col)]] = val;
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
  console.log(workbook);
  return parseWorkbookToJson(workbook);
}
