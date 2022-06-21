import express from 'express';
const router = express.Router();
import { joinTable, queryTable } from '@ctl/tiengiang';
import { createXLSX } from '@ctl/xlsx';
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
    const result = await joinTable({
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

router.get('/getXlsx', async function (req, res) {
  let data = [
    {
      sheet: "Adults",
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
    {
      sheet: "Children",
      columns: [
        { label: "User", value: "user" }, // Top level data
        { label: "Age", value: "age", format: '# "years"' }, // Column format
        { label: "Phone", value: "user.more.phone", format: "(###) ###-####" }, // Deep props and column format
      ],
      content: [
        { user: "Manuel", age: 16, more: { phone: 9999999900 } },
        { user: "Ana", age: 17, more: { phone: 8765432135 } },
      ],
    },
  ]
  const buffer = createXLSX(data)
  if (buffer) {
    res.writeHead(200, {
      "Content-Type": "application/octet-stream",
      "Content-disposition": "attachment; filename=MySheet.xlsx",
    })
    res.end(buffer)
  }
  else {
    res.send('Something wrong!')
  }

})

export default router