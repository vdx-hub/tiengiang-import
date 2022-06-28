const fieldsMapping: any = {
  tbHSMT_DTM: {
    t1ID: 'MaDinhDanh',
    t1SoQDPheDuyet: 'SoHieuVanBan',
    t1NgayKyQDPheDuyet: 'NgayBanHanh',
    // t1CoQuanPheDuyet: 'CoQuanBanHanh._source.MaDinhDanh',
    t2colTen: 'CoQuanBanHanh._source.TenGoi',
    t1TenDuAn: 'MoiTruongDuAn._source.TenGoi',
    t1FileDinhKem: 'FileDinhKem',
    t1FileQDPheDuyet: 'FileQDPheDuyet',
  },
  tbDN_DoanhNghiep: {
    ID: 'MaDinhDanh',
    TenCty: 'TenGoi',
    DiaChi: 'DiaChi.SoNhaChiTiet',
    // t1CoQuanPheDuyet: 'CoQuanBanHanh._source.MaDinhDanh',
    NguoiDaiDienPL: 'ChuDauTu._source.TenGoi',
    NganhNgheHoatDong: 'LoaiNganhNgheKinhTe._source.TenMuc',
    NamHoatDong: 'NamVanHanh',
    NguyenLieu: 'NguyenLieuSuDung ',
    NhienLieu: 'NhienLieuSuDung ',
    NguonCapNuoc: 'NguonNuocSuDung ',
  },
  tbCoQuanQLMT: {
    ID: 'MaDinhDanh',
    colTen: 'TenGoi'
  },
  tbTKT_ThanhKiemTraMT: {
    t1ID: 'MaDinhDanh',
    t1DoanhNghiep_Id: 'DuAnCoSo._source.MaDinhDanh',
    t1FileDinhKem: 'FileDinhKem',
    t2TenCty: 'DuAnCoSo._source.TenGoi',
  },
  tbTKT_QuyetDinhKiemTra: {
    ID: 'MaDinhDanh',
    NgayBanHanh: 'NgayBanHanh',
    SoQD: 'SoHieuVanBan',
    FileDinhKem: 'FileDinhKem',
  },
  tbTKT_NoiDungLinhVucVP: {
    t1NoiDung: 'NoiDungVPHC.MoTaHanhViVPHC',
    t1LinhVucVP_Id: 'NoiDungVPHC.NhomHanhViVPHC._source.MaMuc',
    t2TenLinhVuc: 'NoiDungVPHC.NhomHanhViVPHC._source.TenMuc',
    t1BienPhap: 'BienPhapKhacPhuc',
  }
}
const tableMapping: any = {
  tbHSMT_DTM: 'T_VanBanDTM',
  tbDN_DoanhNghiep: 'T_MoiTruongCoSo',
  tbCoQuanQLMT: 'T_CoQuanDonVi',
  tbTKT_ThanhKiemTraMT: 'T_DoanThanhTraKiemTra',
  tbTKT_QuyetDinhKiemTra: 'T_KetLuanThanhTraKiemTra',
  tbTKT_NoiDungLinhVucVP: 'T_XuPhatVPHC',
}

const config = {
  tbHSMT_DTM: configGenerate('tbHSMT_DTM'),
  tbDN_DoanhNghiep: configGenerate('tbDN_DoanhNghiep'),
  tbCoQuanQLMT: configGenerate('tbCoQuanQLMT'),
  tbTKT_ThanhKiemTraMT: configGenerate('tbTKT_ThanhKiemTraMT'),
  tbTKT_QuyetDinhKiemTra: configGenerate('tbTKT_QuyetDinhKiemTra'),
  tbTKT_NoiDungLinhVucVP: configGenerate('tbTKT_NoiDungLinhVucVP'),
}

function columnConfigGenerate(obj: any, listFields: string[]) {
  const jsonLst = [];
  for (let field of listFields) {
    jsonLst.push({ label: obj[field], value: (row: any) => row[field] })
  }
  return jsonLst;
}

function configGenerate(tableName: string) {
  return {
    fields: Object.keys(fieldsMapping[tableName]),
    jsonXlsx: [
      {
        sheet: tableMapping[tableName],
        columns: columnConfigGenerate(fieldsMapping[tableName], Object.keys(fieldsMapping[tableName])),
        content: [],
      },
    ]
  }
}

function configLoad(sheetName: string, fieldMapping: any) {
  return [
    {
      sheet: sheetName,
      columns: columnConfigGenerate(fieldMapping, Object.keys(fieldMapping)),
      content: [],
    },
  ]
}

export {
  config, configLoad
}

// const example = [
//   {
//     sheet: "Msg",
//     columns: [
//       { label: "User", value: "user" }, // Top level data
//       { label: "Age", value: (row: any) => row.age + " years" }, // Custom format
//       { label: "Phone", value: (row: any) => (row.more ? row.more.phone || "" : "") }, // Run functions
//     ],
//     content: [
//       { user: "Andrea", age: 20, more: { phone: "11111111" } },
//       { user: "Luis", age: 21, more: { phone: "12345678" } },
//     ],
//   },
// ]