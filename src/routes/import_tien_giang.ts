import { processXLSX, getMetaDataXLSX, previewXLSX } from '@services/xlsx';
import express from 'express';
import multer from 'multer';
var upload = multer();

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

router.post('/importXlsx/getMetadata', upload.single('file'), async function (req, res) {
  if (req.file) {
    const metadata = await getMetaDataXLSX(req.file?.buffer)
    res.status(200).send(metadata)
  }
  else {
    res.status(400).send('File not found');
  }
})
export default router