import { IJsonSheet } from "json-as-xlsx"
import { config } from "@config/index";
import { join2Table, queryTable } from "@controller/tiengiang";
const errorData: IJsonSheet[] = [
  {
    sheet: "Msg",
    columns: [
      { label: "User", value: "user" }, // Top level data
      { label: "Age", value: (row: any) => row.age + " years" }, // Custom format
      { label: "Phone", value: (row: any) => (row.more ? row.more.phone || "" : "") }, // Run functions
    ],
    content: [
      { user: "Andrea", age: 20, more: { phone: "11111111" } },
      { user: "Luis", age: 21, more: { phone: "12345678" } },
    ],
  },
]
async function processData(tableName: String): Promise<IJsonSheet[]> {
  switch (tableName) {
    case "tbHSMT_DTM":
      return await tbHSMT_DTM();
    case "tbDN_DoanhNghiep":
      return await tbDN_DoanhNghiep();
    case "tbCoQuanQLMT":
      return await tbCoQuanQLMT();
    case "tbTKT_ThanhKiemTraMT":
      return await tbTKT_ThanhKiemTraMT();
    case "tbTKT_QuyetDinhKiemTra":
      return await tbTKT_QuyetDinhKiemTra();
    case "tbTKT_NoiDungLinhVucVP":
      return await tbTKT_NoiDungLinhVucVP();
    default:
      return errorData;
  }
}

async function tbHSMT_DTM() {
  const xlsxData: IJsonSheet[] = config.tbHSMT_DTM.jsonXlsx;
  // const data = await queryTable('tbHSMT_DTM', config.tbHSMT_DTM.fields);
  const data = await join2Table({
    table1Name: 'tbHSMT_DTM',
    table2Name: 'tbCoQuanQLMT',
    table1Key: 'CoQuanPheDuyet',
    table2Key: 'ID',
    table1Fields: ["ID", "SoQDPheDuyet", "NgayKyQDPheDuyet", "CoQuanPheDuyet", "TenDuAn", "FileDinhKem", "FileQDPheDuyet"],
    table2Fields: ["colTen"]
  })
  if (data?.data) {
    xlsxData[0].content = data.data
  }
  return xlsxData
}
async function tbDN_DoanhNghiep() {
  const xlsxData: IJsonSheet[] = config.tbDN_DoanhNghiep.jsonXlsx;
  const data = await queryTable('tbDN_DoanhNghiep', config.tbDN_DoanhNghiep.fields);
  if (data?.data) {
    xlsxData[0].content = data.data
  }
  return xlsxData
}
async function tbCoQuanQLMT() {
  const xlsxData: IJsonSheet[] = config.tbCoQuanQLMT.jsonXlsx;
  const data = await queryTable('tbCoQuanQLMT', config.tbCoQuanQLMT.fields);

  if (data?.data) {
    xlsxData[0].content = data.data
  }
  return xlsxData
}
async function tbTKT_ThanhKiemTraMT() {
  const xlsxData: IJsonSheet[] = config.tbTKT_ThanhKiemTraMT.jsonXlsx;
  const data = await join2Table({
    table1Name: 'tbTKT_ThanhKiemTraMT',
    table2Name: 'tbDN_DoanhNghiep',
    table1Key: 'DoanhNghiep_Id',
    table2Key: 'ID',
    table1Fields: ["ID", "DoanhNghiep_Id", "FileDinhKem"],
    table2Fields: ["TenCty"]
  })
  if (data?.data) {
    xlsxData[0].content = data.data
  }
  return xlsxData
}
async function tbTKT_NoiDungLinhVucVP() {
  const xlsxData: IJsonSheet[] = config.tbTKT_NoiDungLinhVucVP.jsonXlsx;
  const data = await join2Table({
    table1Name: 'tbTKT_NoiDungLinhVucVP',
    table2Name: 'tbTKT_LinhVucVP',
    table1Key: 'LinhVucVP_Id',
    table2Key: 'ID',
    table1Fields: ["LinhVucVP_Id", "NoiDung", "BienPhap"],
    table2Fields: ["TenLinhVuc"]
  })
  if (data?.data) {
    xlsxData[0].content = data.data
  }
  return xlsxData
}
async function tbTKT_QuyetDinhKiemTra() {
  const xlsxData: IJsonSheet[] = config.tbTKT_QuyetDinhKiemTra.jsonXlsx;
  const data = await queryTable('tbTKT_QuyetDinhKiemTra', config.tbTKT_QuyetDinhKiemTra.fields);

  if (data?.data) {
    xlsxData[0].content = data.data
  }
  return xlsxData
}
export {
  processData
}
