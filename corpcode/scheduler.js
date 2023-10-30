// corpcode/scheduler.js

const schedule = require("node-schedule");
const controller = require("./controller");

// 매일 오전 8시와 오후 8시에 데이터 수집
schedule.scheduleJob("0 8,20 * * *", controller.updateCorpCodes);
