// corpcode/controller.js

const axios = require("axios");
const fs = require("fs");
const extract = require("extract-zip");
const xml2js = require("xml2js");
const model = require("./model");
const path = require("path");
const dbConfig = require("../config/dbConfig");
const mysql = require("mysql2/promise");
const telegramBot = require("../telegramBot");

// 새로운 메시지 시작 함수
const startNewMessage = () => {
    return `corpcode 데이터 업데이트 결과:\n`;
};

// 메시지를 여러 개로 나눠서 보내는 함수
const sendMessages = async (chatId, messages) => {
    for (const message of messages) {
        await telegramBot.sendMessage(chatId, message);
    }
};

exports.updateCorpCodes = async (req, res) => {
    let connection;
    try {
        const chatId = process.env.TELEGRAM_CHAT_ID;
        // OpenDART API에서 데이터 가져오기
        console.log("Fetching data from OpenDART API...");
        const apiKey = process.env.OPENDART_API_KEY;
        const response = await axios.get(`https://opendart.fss.or.kr/api/corpCode.xml?crtfc_key=${apiKey}`, {responseType: "arraybuffer"});
        const zipBuffer = response.data;

        // 현재 날짜와 시간을 가져와 파일 이름에 포함시킵니다.
        const now = new Date();
        now.setHours(now.getHours() + 9); // UTC 시간을 한국 시간으로 변환합니다.
        const yyyy = now.getFullYear();
        const mm = String(now.getMonth() + 1).padStart(2, "0");
        const dd = String(now.getDate()).padStart(2, "0");
        const timestamp = now
            .toISOString()
            .replace(/[:\-T]/g, "")
            .split(".")[0];
        const todayDate = `${yyyy}-${mm}-${dd}`;

        // 디렉토리와 파일 경로를 구성합니다.
        const dirPath = path.join(__dirname, "data");
        const zipPath = path.join(dirPath, `corpcode_${timestamp}.zip`);
        const xmlPath = path.join(dirPath, `corpcode_${timestamp}.xml`);

        // data 디렉토리가 없으면 생성합니다.
        if (!fs.existsSync(dirPath)) {
            fs.mkdirSync(dirPath, {recursive: true});
        }

        // ZIP 파일 저장
        console.log("Saving ZIP file...");
        fs.writeFileSync(zipPath, zipBuffer);

        // extract-zip 모듈을 사용하여 압축 해제
        console.log("Unzipping file...");
        const onEntry = (entry, zipfile) => {
            const fileName = entry.fileName.split("/").pop(); // 파일명 추출
            entry.fileName = `corpcode_${timestamp}.xml`; // 새 파일명 설정
            return entry;
        };
        await extract(zipPath, {dir: dirPath, onEntry});

        // XML 파일 파싱
        console.log("Parsing XML file...");
        const xmlData = fs.readFileSync(xmlPath, "utf-8");
        const jsonData = await xml2js.parseStringPromise(xmlData);

        // 'list' 배열에서 각각의 아이템을 가져오기
        console.log("Extracting data from XML...");
        const itemList = jsonData.result.list;

        // 데이터베이스 연결
        console.log("Connecting to the database...");
        connection = await mysql.createConnection(dbConfig);

        // 트랜잭션 시작
        console.log("Starting transaction...");
        await connection.beginTransaction();

        // corpcode 데이터 삽입 또는 업데이트
        console.log("Inserting or updating corpcode data...");
        const totalItems = itemList.length;
        const maxItemsPerMessage = 10; // 한 번에 보낼 아이템 수
        let messages = `corpcode 데이터 ${totalItems}개가 업데이트 되었습니다\n`;

        for (let i = 0; i < totalItems; i++) {
            const item = itemList[i];
            const corpCode = item.corp_code[0];
            const corpName = item.corp_name[0];
            const stockCode = item.stock_code[0];
            const modifyDate = item.modify_date[0];

            messages += `${corpCode}, ${corpName}, ${stockCode}, ${modifyDate}\n`;

            if ((i + 1) % maxItemsPerMessage === 0 || i === totalItems - 1) {
                // maxItemsPerMessage 개수에 도달하거나 마지막 아이템인 경우 메시지 보내기
                telegramBot.sendMessages(chatId, [messages]);
                messages = ""; // 메시지 초기화
            }

            await model.insertOrUpdateCorpCode(connection, corpCode, corpName, stockCode, modifyDate);
        }

        // 트랜잭션 커밋
        console.log("Committing transaction...");
        await connection.commit();

        console.log("Update completed.");
        res.status(200).send("Update completed");
    } catch (error) {
        console.error("Error occurred:", error);

        // 트랜잭션 롤백 (에러 발생 시)
        connection && (await connection.rollback());

        res.status(500).send("Internal Server Error");
    } finally {
        // 데이터베이스 연결 종료
        console.log("Closing database connection...");
        connection && (await connection.end());
    }
};
