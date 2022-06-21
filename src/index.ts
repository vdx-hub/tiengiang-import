import bodyParser from 'body-parser';
import https from 'https';
import express from 'express';

import TienGiangRouter from "@routes/dbtiengiang";

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
app.use((err: any, req: any, res: any, next: any) => {
  res.status(err.status || 500);
  res.json({
    message: err.message,
    error: err,
  });
});
app.use('/tiengiang', TienGiangRouter)
app.listen(9000, () => {
  console.log("Server is up!")
});