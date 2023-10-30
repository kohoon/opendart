// corpcode/router.js

const express = require("express");
const router = express.Router();
const controller = require("./controller");

router.get("/update", controller.updateCorpCodes);

module.exports = router;
