function columnConfigGenerate(obj: any, listFields: string[]) {
  const jsonLst = [];
  for (let field of listFields) {
    jsonLst.push({ label: obj[field], value: (row: any) => row[field] })
  }
  return jsonLst;
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
  configLoad
}