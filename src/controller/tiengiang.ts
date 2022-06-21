import { log } from "console"
import { sql, poolPromise } from '@db/mssql'

async function queryTable(tableName: string, listField?: string[]) {
  log('queryTable', tableName);
  const pool = await poolPromise
  if (pool) {
    const field = (listField && listField.join(', ')) || '*';
    const result = await pool.request()
      .query(`select ${field} from ${tableName}`)
    return {
      data: result.recordset,
      rowsAffected: result.rowsAffected
    }
  }
  else {
    return;
  }
}
interface JoinParams {
  table1Name: string,
  table2Name: string,
  table1Key: string,
  table2Key: string,
  table1Fields: string[],
  table2Fields: string[],
}
async function joinTable({ table1Name, table2Name, table1Key, table2Key, table1Fields, table2Fields, }: JoinParams) {
  log('joinTable', table1Name, table2Name);

  const pool = await poolPromise
  if (pool) {
    const field1 = table1Fields.map(x => ('table1.' + x + ' as t1' + x)) || ['table1.*'];
    const field2 = table2Fields.map(x => ('table2.' + x + ' as t2' + x)) || ['table2.*'];
    log(field1, field2)
    const fields = [...field1, ...field2].join(',')
    const query = `SELECT ${fields}
    FROM
      dbo.${table1Name} as table1
      JOIN
      dbo.${table2Name} as table2
    ON
      table1.${table1Key} = table2.${table2Key}
    ORDER BY
      table1.${table1Key}
    OFFSET 0 ROWS
    FETCH NEXT 10 ROWS ONLY`;
    const result = await pool.request()
      .query(query)
    return {
      data: result.recordset,
      rowsAffected: result.rowsAffected
    }
  }
  else {
    return;
  }
}

export {
  queryTable, joinTable
}