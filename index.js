const axios = require("axios");

const TOKEN = "";
const TELEGRAM_API = `https://api.telegram.org/bot${TOKEN}`;

let offset = 0;

// loop lấy message
setInterval(async () => {
    try {
        const res = await axios.get(`${TELEGRAM_API}/getUpdates`, {
            params: { offset: offset, timeout: 100 }
        });

        const updates = res.data.result;

        for (let update of updates) {
            offset = update.update_id + 1;

            const message = update.message;
            if (!message) continue;

            const chatId = message.chat.id;
            const text = message.text;

            let reply = "Không hiểu 🤔";

            if (text === "/start") {
                reply = "Bot chạy local OK 🚀";
            } else if (text === "hi") {
                reply = "Hello từ local 👋";
            }

            await axios.post(`${TELEGRAM_API}/sendMessage`, {
                chat_id: chatId,
                text: reply
            });
        }
    } catch (err) {
        console.error(err.message);
    }
}, 2000);

console.log("Bot đang chạy local...");
