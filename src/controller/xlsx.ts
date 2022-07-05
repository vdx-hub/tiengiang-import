import { _client } from "@db/mongodb";
import { log } from "console";
import jsonxlsx, { IJsonSheet, ISettings } from "json-as-xlsx"
import XLSX from 'xlsx';

const defaultSetting: ISettings = {
  fileName: "DefaultName", // Name of the resulting spreadsheet
  extraLength: 3, // A bigger number means that columns will be wider
  writeOptions: {
    type: "buffer",
    bookType: "xlsx",
  },// Style options from https://github.com/SheetJS/sheetjs#writing-options
}
// 
// sinh xlsx DB Tiền Giang
// 
async function createXLSX(data: IJsonSheet[], settings = defaultSetting) {
  return jsonxlsx(data, { ...defaultSetting, ...settings });
}

// 
// Đọc/ xử lý file excel
// 

// First row get
function getMetaDataXLSX(xlsxBuffer: Buffer) {
  var workbook = XLSX.read(xlsxBuffer, { type: "buffer" });
  let data: any = {};

  for (let sheet of workbook.SheetNames) {
    let headers = [];
    var range = XLSX.utils.decode_range(workbook.Sheets[sheet]['!ref'] || '');
    var C = range.s.c;
    var R = range.e.r;
    for (C = range.s.c; C <= range.e.c; ++C) {
      var cell = workbook.Sheets[sheet][XLSX.utils.encode_cell({ c: C, r: 0 })] /* find the cell in the first row */
      var hdr = "Cột không tên " + C; // <-- replace with your desired default 
      if (cell && cell.t) hdr = XLSX.utils.format_cell(cell);
      headers.push(hdr);
    }
    data[sheet] = {
      ...data[sheet]?.headers,
      headers: headers,
      valueRowCount: R,
      valueColumnCount: C,
    }
  }
  return data
}

async function previewXLSX(xlsxBuffer: Buffer, configStr: string, previewNo?: number) {
  var workbook = XLSX.read(xlsxBuffer, { type: "buffer", sheetRows: previewNo });
  let data: any = {};
  var config;
  try {
    config = JSON.parse(configStr || "{}");
  }
  catch (err: any) {
    data = err.message
  }
  if (config) {
    data = await mapConfigSheet(workbook, config)
  }
  return data;
}

async function processXLSX(xlsxBuffer: Buffer, configStr: string) {
  var workbook = XLSX.read(xlsxBuffer, { type: "buffer" });
  let data: any = {};
  var config;
  try {
    config = JSON.parse(configStr || "{}");
  }
  catch (err: any) {
    data = err.message
  }
  if (config) {
    data = await mapConfigSheet(workbook, config)
    let test = _client.db('CSDL_MT').collection('C_TESTIMPORT').find().toArray();
    log(test)
  }
  return data;
}

async function editCell(worksheet: XLSX.WorkSheet, cell: string, value: any) {
  await XLSX.utils.sheet_add_aoa(worksheet, [
    [value]
  ], { origin: cell });
}
async function mapConfigSheet(worksheet: XLSX.WorkBook, config: any) {
  let data: any = {};
  for (let sheet of worksheet.SheetNames) {
    if (config[sheet]) {
      for (let col in config[sheet]) {
        editCell(worksheet.Sheets[sheet], col + '1', config[sheet][col])
      }
    }
    data[sheet] = XLSX.utils.sheet_to_json(worksheet.Sheets[sheet]);
  }
  return data
}


export { createXLSX, getMetaDataXLSX, processXLSX, previewXLSX }
