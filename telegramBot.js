// telegramBot.js

// node-telegram-bot-api 패키지를 불러옵니다.
const TelegramBot = require("node-telegram-bot-api");

// 환경 변수에서 텔레그램 봇 토큰을 불러옵니다.
const botToken = process.env.TELEGRAM_BOT_TOKEN;

// replace 'your-telegram-bot-token-here' with the actual token
const bot = new TelegramBot(botToken, {polling: true});

/**
 * 메시지를 보내는 함수
 * @param {string} chatId - 메시지를 보낼 텔레그램 채팅 ID
 * @param {string} message - 보낼 메시지 내용
 */

const sendMessage = (chatId, message) => {
    bot.sendMessage(chatId, message);
};

module.exports = {
    bot,
    sendMessage,
};
