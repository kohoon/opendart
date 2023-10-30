// list/router.js
const express = require("express");
const router = express.Router();
const controller = require("./controller");

router.get("/", controller.getList); // GET 요청을 처리하는 라우트 설정

module.exports = router;
