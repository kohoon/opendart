// app.js

require("dotenv").config();
require("./corpcode/scheduler");

const express = require("express");
const app = express();

const listRouter = require("./list/router");
// const companyRouter = require("./company/router");
// const documentRouter = require("./document/router");
const corpcodeRouter = require("./corpcode/router");

// 환경 변수에 접근
const apiKey = process.env.OPENDART_API_KEY;
// console.log(apiKey); // your-api-key-here 출력

app.use("/list", listRouter);
// app.use("/company", companyRouter);
// app.use("/document", documentRouter);
app.use("/corpcode", corpcodeRouter);

app.listen(3000, () => {
    console.log("Server is running on port 3000");
});
