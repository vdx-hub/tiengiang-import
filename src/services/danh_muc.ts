import { _client } from "@db/mongodb";
import { log } from "console";
import fs from "fs-extra"
interface ImportConfig {
  "Name": string,
  "DanhMuc": string,
  "KeySearch": string,
  "Fields": [string]
}

async function getDanhMuc(db: string, config: ImportConfig, renewDanhMuc: string) {
  let danhMuc: any = {};
  try {
    danhMuc = await fs.readJSON(`tmp/${db}___${config.DanhMuc}.json`)
  }
  catch (err) {
    log(err)
  }
  if (Object.entries(danhMuc).length > 0 && renewDanhMuc == 'false') return danhMuc;
  // query
  if (renewDanhMuc == 'true') {
    danhMuc = {}
    let projectFields: any = {
      [config.KeySearch]: 1
    }
    if (config.Fields) {
      for (let key of config.Fields) {
        projectFields[key] = 1
      }
    }
    log(projectFields)
    let cursor = await _client.db(db).collection(config.DanhMuc).find().project(projectFields);
    while (await cursor.hasNext()) {
      let doc: any = await cursor.next();
      const { _id, ...key } = doc;
      danhMuc[doc[config.KeySearch]] = {
        source: key,
        _id: _id
      };
    }
    try {
      await fs.outputJson(`tmp/${db}___${config.DanhMuc}.json`, danhMuc)
    }
    catch (err) {
      log(err)
    }
    return danhMuc;
  }


}
export { getDanhMuc }