import { blindProcessXLSX } from '@services/import';
import { processXLSX, getMetaDataXLSX, previewXLSX } from '@services/xlsx';
import express from 'express';
import multer from 'multer';
import path from 'path';
var upload = multer({
  storage: multer.diskStorage({
    destination: function (_req, file, cb) {
      if (file.fieldname === "file") {
        cb(null, './uploads/xlsx/')
      }
      else if (file.fieldname === "tepdinhkem") {
        cb(null, './uploads/tepdinhkem/');
      }
    },
    filename: function (_req, file, cb) {
      cb(null, `${path.basename(file.originalname)}`);
    },
  }),
});

const router = express.Router();
router.post('/importXlsx/:database/preview', upload.single('file'), async function (req, res) {
  if (req.file) {
    const metadata = await previewXLSX({
      xlsxBuffer: req.file?.buffer,
      fileName: req.file.originalname,
      database: req.params.database,
      cacheDanhMuc: req.body.cacheDanhMuc,
      configStr: req.body.config,
      skipRowNo: req.body.skipRowNo,
      previewNo: req.body.previewNo
    })
    res.status(200).send(metadata)
  }
  else {
    res.status(400).send('File not found');
  }
})

router.post('/importXlsx/:database/confirmed', upload.single('file'), async function (req, res) {
  if (req.file) {
    const metadata = await processXLSX({
      xlsxBuffer: req.file?.buffer,
      fileName: req.file.originalname,
      database: req.params.database,
      cacheDanhMuc: req.body.cacheDanhMuc,
      configStr: req.body.config,
      keyConfigStr: req.body.key,
      skipRowNo: req.body.skipRowNo
    })
    res.status(200).send(metadata)
  }
  else {
    res.status(400).send('File not found');
  }
})

router.post('/importXlsx/getMetadata', upload.fields([{
  name: 'file', maxCount: 1
}, {
  name: 'tepdinhkem', maxCount: 100
}]), async function (req, res) {
  if (req.files) {
    const files = req.files as { [fieldname: string]: Express.Multer.File[] };
    const metadata = await getMetaDataXLSX(files)
    res.status(200).send(metadata)
  }
  else {
    res.status(400).send('File not found');
  }
})
router.post('/importXlsx/v2/:database/confirm', upload.fields([{
  name: 'file', maxCount: 1
}, {
  name: 'tepdinhkem', maxCount: 100
}]), async function (req, res) {
  if (req.files) {
    const files = req.files as { [fieldname: string]: Express.Multer.File[] };
    const metadata = await blindProcessXLSX(files, req.body.cacheDanhMuc, req.params.database);
    res.status(200).send(metadata)
  }
  else {
    res.status(400).send('File not found');
  }
})
export default router