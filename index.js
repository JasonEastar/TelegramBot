const express = require("express");
const fs = require("fs");
const app = express();
const TelegramBot = require("node-telegram-bot-api");
require("dotenv").config();

const BOT_TOKEN = process.env.BOT_TOKEN;
const MESSAGE_SEND = process.env.MESSAGE_SEND;
const YOUR_USER_ID = process.env.YOUR_USER_ID; //1792199242

const bot = new TelegramBot(BOT_TOKEN, { polling: true });

let registeredUsers = [];

// Load danh sách người dùng đã đăng ký từ tệp
try {
  const data = fs.readFileSync("registeredUsers.json", "utf8");
  registeredUsers = JSON.parse(data);
  console.log("Danh sách người dùng đã đăng ký:", registeredUsers);
} catch (err) {
  console.error("Không thể đọc tệp registeredUsers.json:", err);
}

// Lắng nghe sự kiện nhận tin nhắn từ người dùng
bot.on("message", (msg) => {
  const chatId = msg.chat.id;

  // Nếu người gửi chưa đăng ký, thêm ID của họ vào mảng và lưu vào tệp
  if (registeredUsers.indexOf(chatId) === -1) {
    registeredUsers.push(chatId);
    fs.writeFileSync(
      "registeredUsers.json",
      JSON.stringify(registeredUsers),
      "utf8"
    );
    bot.sendMessage(chatId, "Bạn đã đăng ký thành công!");
  }

  // Kiểm tra xem người gửi có phải là bạn không
  if (String(msg.from.id) === String(YOUR_USER_ID) && msg.text) {
    // Gửi tin nhắn đến tất cả người dùng đã đăng ký khi bạn là người gửi
    const message = `<strong>${MESSAGE_SEND}</strong>\n${msg.text}`;
    sendBroadcastMessage(`${message}`);
  } else {
    console.log("Người gửi không phải là bạn:", msg.from.id);
  }
});
// Hàm gửi tin nhắn đến tất cả người dùng đã đăng ký
function sendBroadcastMessage(message) {
  registeredUsers.forEach((userId) => {
    // Kiểm tra xem người dùng có phải là bạn không
    if (String(userId) !== String(YOUR_USER_ID)) {
      bot
        .sendMessage(userId, message, { parse_mode: "HTML" })
        .then(() =>
          console.log(
            "Đã gửi tin nhắn thành công đến người dùng có ID:",
            userId
          )
        )
        .catch((error) =>
          console.error("Lỗi khi gửi tin nhắn đến người dùng có ID:", userId)
        );
    } else {
      console.log("Bỏ qua việc gửi tin nhắn đến ID của bạn:", userId);
    }
  });
}

console.log("Bot is running...");
