import xlsx, { IJsonSheet, ISettings } from "json-as-xlsx"

const defaultSetting: ISettings = {
  fileName: "MySpreadsheet", // Name of the resulting spreadsheet
  extraLength: 3, // A bigger number means that columns will be wider
  writeOptions: {
    type: "buffer",
    bookType: "xlsx",
  },// Style options from https://github.com/SheetJS/sheetjs#writing-options
}

function createXLSX(data: IJsonSheet[], settings = defaultSetting) {
  return xlsx(data, settings);
}

export { createXLSX }