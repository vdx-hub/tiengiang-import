import { _client } from "@db/mongodb";
import jsonxlsx, { IJsonSheet, ISettings } from "json-as-xlsx"
import XLSX from 'xlsx';
import DBUtils from '@controller/mongodb'

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

async function previewXLSX({ xlsxBuffer, fileName }: any, configStr: string, skipRowNo: number = 0, previewNo: number = 10) {
  let rowToGet: number = Number(previewNo) + Number(skipRowNo) + 1;
  var workbook = XLSX.read(xlsxBuffer, { type: "buffer", sheetRows: rowToGet });
  let responseData: any = {};
  var config;
  try {
    config = JSON.parse(configStr || "{}");
  }
  catch (err: any) {
    responseData = err.message
  }
  if (config) {
    let sheetData = await mapConfigSheet(workbook, config);
    for (let collection in sheetData) {
      responseData[collection] = [];
      if (skipRowNo && Array.isArray(sheetData[collection])) {
        sheetData[collection].splice(0, skipRowNo)
      }
      for (let record of sheetData[collection]) {
        const dataNghiepVu = addMetadataImport(record, fileName);
        responseData[collection].push(dataNghiepVu)
      }
    }
  }
  return responseData;
}

async function processXLSX({ xlsxBuffer, fileName }: any, configStr: string, keyConfigStr: string, skipRowNo?: number) {
  var workbook = XLSX.read(xlsxBuffer, { type: "buffer" });
  let responseData: any = {};
  var config, keyConfig;
  try {
    config = JSON.parse(configStr || "{}");
    keyConfig = JSON.parse(keyConfigStr || "{}");
  }
  catch (err: any) {
    responseData = err.message
  }
  if (config) {
    let sheetData = await mapConfigSheet(workbook, config);
    for (let collection in sheetData) {
      responseData[collection] = {
        upsertedCount: 0,
        matchedCount: 0
      }
      if (skipRowNo && Array.isArray(sheetData[collection])) {
        sheetData[collection].splice(0, skipRowNo)
      }
      for (let record of sheetData[collection]) {
        const dataToCreate = addMetadataImport(record, fileName);
        let result = await DBUtils.createOneIfNotExits(_client, {
          dbName: "CSDL_MT",
          collectionName: collection,
          filter: {
            sourceRefId: record[keyConfig?.[collection]]
          },
          insertData: dataToCreate
        })
        responseData[collection].matchedCount += result.matchedCount;
        responseData[collection].upsertedCount += result.upsertedCount;
      }
    }
  }
  return responseData;
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

function addMetadataImport(record: any, fileName: string) {
  let data = record;
  data['sourceRef'] = `ImportXlsx_${fileName}`;
  data['username'] = `ImportSevice`;
  data['openAccess'] = 0;
  data['order'] = 0;
  data['site'] = 'csdl_mt';
  data['storage'] = 'regular';
  return data;
}

export { createXLSX, getMetaDataXLSX, processXLSX, previewXLSX }
