// corpcode/model.js

const mysql = require("mysql2/promise");

async function insertOrUpdateCorpCode(connection, corpCode, corpName, stockCode, modifyDate) {
    try {
        // 데이터를 삽입하거나 업데이트하는 SQL 쿼리를 작성합니다.
        const query = `
            INSERT INTO corpcode (corp_code, corp_name, stock_code, modify_date)
            VALUES (?, ?, ?, ?)
            ON DUPLICATE KEY UPDATE
            corp_name = VALUES(corp_name),
            stock_code = VALUES(stock_code),
            modify_date = VALUES(modify_date)
        `;

        // SQL 쿼리 실행
        await connection.execute(query, [corpCode, corpName, stockCode, modifyDate]);
    } catch (error) {
        // 데이터베이스 작업 중 오류가 발생한 경우 예외를 던집니다.
        throw error;
    }
}

module.exports = {
    insertOrUpdateCorpCode,
};
