import { _client } from "@db/mongodb";
import jsonxlsx, { IJsonSheet, ISettings } from "json-as-xlsx"
import XLSX from 'xlsx';
import DBUtils from '@controller/mongodb'
import { getDanhMuc } from "./danh_muc";
import { readFile } from "fs-extra";

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
async function getMetaDataXLSX(files: { [fieldname: string]: Express.Multer.File[] }) {
  let xlsxBuffer = await readFile(files.file[0].path)
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

async function previewXLSX({ xlsxBuffer, fileName, database, cacheDanhMuc, configStr, skipRowNo = 0, previewNo = 10 }: any) {
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
    let sheetData = await mapConfigSheet(workbook, config, database, cacheDanhMuc);
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

async function processXLSX({ xlsxBuffer, fileName, database, cacheDanhMuc, configStr, keyConfigStr, skipRowNo }: any) {
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
    let sheetData = await mapConfigSheet(workbook, config, database, cacheDanhMuc);
    for (let collection in sheetData) {
      responseData[collection] = {}
      if (skipRowNo && Array.isArray(sheetData[collection])) {
        sheetData[collection].splice(0, skipRowNo)
      }
      const bulkService = await DBUtils.bulkCreateOneIfNotExist(_client, {
        dbName: database,
        collectionName: collection
      })
      for (let record of sheetData[collection]) {
        const dataToCreate = addMetadataImport(record, fileName);
        await bulkService.bulkUpsertAdd({
          sourceRefId: record[keyConfig?.[collection]]
        }, dataToCreate);
      }
      responseData[collection] = await bulkService.bulk.execute();
    }
  }
  return responseData;
}

async function editCell(worksheet: XLSX.WorkSheet, cell: string, value: any) {
  await XLSX.utils.sheet_add_aoa(worksheet, [
    [value]
  ], { origin: cell });
}

// 
// mapping theo config
// 
async function mapConfigSheet(worksheet: XLSX.WorkBook, config: any, database: string, cacheDanhMuc: string = 'false') {
  let data: any = {};
  let danhMucData: any = {};
  for (let sheet of worksheet.SheetNames) {
    if (config[sheet]) {
      for (let column in config[sheet]) {
        if (config[sheet][column].DanhMuc) {
          danhMucData[config[sheet][column].DanhMuc] = await getDanhMuc(database, config[sheet][column], cacheDanhMuc);
        }
        if (config[sheet][column].Name) {
          editCell(worksheet.Sheets[sheet], column + '1', config[sheet][column].Name)
        }
      }
    }
    data[sheet] = XLSX.utils.sheet_to_json(worksheet.Sheets[sheet]);
    for (let [index,] of data[sheet].entries()) {
      for (let column in config[sheet]) {
        const danhMucKey = config[sheet][column].Name;
        const collectionDanhMuc = config[sheet][column].DanhMuc;
        const valueXlsx = data[sheet][index][danhMucKey];
        if (danhMucData[collectionDanhMuc][valueXlsx]) {
          data[sheet][index][danhMucKey] = danhMucData[collectionDanhMuc][valueXlsx]
        }
        else {
          data[sheet][index][danhMucKey] = {
            _source: {
              [config[sheet][column].KeySearch]: valueXlsx
            }
          }
        }
      }
    }
  }
  return data
}

function addMetadataImport(record: any, fileName: string) {
  let data = record;
  data['sourceRef'] = `ImportXlsx_${fileName}`;
  data['username'] = `ImportSevice`;
  data['openAccess'] = 2;
  data['order'] = 0;
  data['site'] = 'csdl_mt';
  data['storage'] = '03_import';
  data['metadata.ThoiGianTao'] = Date.now()
  data['metadata.ThoiGianCapNhat'] = Date.now()
  data['metadata.TrangThaiDuLieu'] = {
    '_source':{
      'MaMuc':'01',
      'TenMuc':'Sơ bộ',
      'type':'C_TrangThaiDuLieu'
    }
  }
  data['metadata.MaNguonDuLieu.MaNguonDuLieu'] = 'ImportSevice'
  data['metadata.MaNguonDuLieu.LoDuLieu'] = `${fileName}`
  data["accessRoles"] = [
    {
      "shortName": "admin",
      "permission": "2"
    },
    {
      "shortName": "AdminData",
      "permission": "2"
    }
  ]
  console.log('data', data)
  return data;
}

export { createXLSX, getMetaDataXLSX, processXLSX, previewXLSX }
