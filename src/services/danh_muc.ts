import { _client } from "@db/mongodb";
import { log } from "console";
import fs from "fs-extra"
interface ImportConfig {
  "DanhMuc": string,
  "KeySearch": string,
  "Fields": string[]
}

async function getDanhMuc(db: string, config: ImportConfig, cacheDanhMuc: string) {
  let danhMuc: any = {};
  if (config.DanhMuc.startsWith("C_")) {
    try {
      danhMuc = await fs.readJSON(`tmp/${db}___${config.DanhMuc}.json`)
    }
    catch (err) {
    }
    if (Object.entries(danhMuc).length > 0 && cacheDanhMuc == 'true') return danhMuc;
  }

  // query
  if (cacheDanhMuc == 'false' || Object.entries(danhMuc).length == 0) {
    danhMuc = {}
    let projectFields: any = {
      [config.KeySearch]: 1
    }
    if (config.Fields) {
      for (let key of config.Fields) {
        if (key) {
          projectFields[key] = 1
        }
      }
    }
    let cursor = await _client.db(db).collection(config.DanhMuc).find().project(projectFields);
    while (await cursor.hasNext()) {
      let doc: any = await cursor.next();
      const { _id, ...key } = doc;
      danhMuc[doc[config.KeySearch]] = {
        _source: {
          ...key,
          type: config.DanhMuc
        },
        _id: String(_id)
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