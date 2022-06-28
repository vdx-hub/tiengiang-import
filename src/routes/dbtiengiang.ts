import express from 'express';
const router = express.Router();
import { join2Table, queryTable } from '@controller/tiengiang';
import { createXLSX } from '@controller/xlsx';
import { processData } from '@mapping/index';
import { configLoad } from '@config/index';
import { IJsonSheet } from 'json-as-xlsx';
import { log } from 'console';

router.get('/', async function (req, res) {
  res.status(200).json({
    abc: '200ok'
  })
});

router.post('/getData/:tableName', async function (req, res) {
  try {
    const result = await queryTable(req.params.tableName, req.body.fields);
    res.status(200)
    res.send(result)
  } catch (err: any) {
    res.status(500)
    res.send(err.message)
  }
});

router.post('/joinData', async function (req, res) {
  try {
    const result = await join2Table({
      table1Name: req.body.tableName1,
      table2Name: req.body.tableName2,
      table1Key: req.body.table1Key,
      table2Key: req.body.table2Key,
      table1Fields: req.body.table1Fields,
      table2Fields: req.body.table2Fields,
    });
    res.status(200)
    res.send(result)
  } catch (err: any) {
    res.status(500)
    res.send(err.message)
  }
});

router.get('/getXlsx/:tableName', async function (req, res) {
  const data = await processData(req.params.tableName);
  const buffer = createXLSX(data, {
    fileName: 'abc',
    extraLength: req.body.extraLength
  });
  if (buffer) {
    res.writeHead(200, {
      "Content-Type": "application/octet-stream",
      "Content-disposition": `attachment; filename=${req.params.tableName}.xlsx`,
    })
    res.end(buffer)
  }
  else {
    res.send('Something wrong!')
  }
})

router.post('/getXlsx/:tableName1/:tableName2', async function (req, res) {
  try {
    const xlsxData: IJsonSheet[] = configLoad(req.body.sheetName, req.body.fieldMapping);
    const data = await join2Table({
      table1Name: req.params.tableName1,
      table2Name: req.params.tableName2,
      table1Key: req.body.table1Key,
      table2Key: req.body.table2Key,
      table1Fields: req.body.table1Fields,
      table2Fields: req.body.table2Fields,
    });
    if (data?.data) {
      xlsxData[0].content = data.data
    }
    const buffer = createXLSX(xlsxData, {
      fileName: 'abc',
      extraLength: req.body.extraLength
    });
    if (buffer) {
      res.writeHead(200, {
        "Content-Type": "application/octet-stream",
        "Content-disposition": `attachment; filename=${req.params.tableName1}_${req.params.tableName2}.xlsx`,
      })
      res.end(buffer)
    }
    else {
      res.send('Something wrong!')
    }

  } catch (err: any) {
    res.status(500)
    res.send(err.message)
  }
});
router.post('/getXlsx/:tableName', async function (req, res) {
  try {
    const xlsxData: IJsonSheet[] = configLoad(req.body.sheetName, req.body.fieldMapping);
    const data = await queryTable(req.params.tableName, req.body.fields);
    if (data?.data) {
      xlsxData[0].content = data.data
    }
    const buffer = createXLSX(xlsxData, {
      fileName: 'abc',
      extraLength: req.body.extraLength || 3
    });
    if (buffer) {
      res.writeHead(200, {
        "Content-Type": "application/octet-stream",
        "Content-disposition": `attachment; filename=${req.params.tableName}.xlsx`,
      })
      res.end(buffer)
    }
    else {
      res.send('Something wrong!')
    }

  } catch (err: any) {
    res.status(500)
    res.send(err.message)
  }
})

export default router