import bodyParser from 'body-parser';
import https from 'https';
import express from 'express';

// import TienGiangRouter from "@routes/db_tien_giang";
import ImportNghiepVuRouter from "@routes/import_tien_giang";


https.globalAgent.options.rejectUnauthorized = false;

const app = express();
app.use(bodyParser.json({
  limit: "50mb"
}));
app.use(
  bodyParser.urlencoded({
    limit: "50mb",
    extended: true,
    parameterLimit: 50000,
  })
);
app.use((err: any, _req: any, res: any, _next: any) => {
  res.status(err.status || 500);
  res.json({
    message: err.message,
    error: err,
  });
});
// app.use('/tiengiang', TienGiangRouter)
app.use('/tiengiang', ImportNghiepVuRouter)
app.listen(9000, async () => {
  console.log("Server is up!");
})
