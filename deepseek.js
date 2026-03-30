require("dotenv").config();
const axios = require("axios");

const TELEGRAM_TOKEN = process.env.BOT_TOKEN;
const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY;

const TELEGRAM_API = `https://api.telegram.org/bot${TELEGRAM_TOKEN}`;

let offset = 0;

async function askDeepSeek(message) {
    try {
        const res = await axios.post(
            "https://api.deepseek.com/v1/chat/completions",
            {
                model: "deepseek-chat",
                messages: [
                    { role: "system", content: "Bạn là trợ lý AI thân thiện." },
                    { role: "user", content: message }
                ]
            },
            {
                headers: {
                    "Authorization": `Bearer ${DEEPSEEK_API_KEY}`,
                    "Content-Type": "application/json"
                }
            }
        );

        return res.data.choices[0].message.content;
    } catch (err) {
        console.error(err.response?.data || err.message);
        return "Lỗi khi gọi AI 😢";
    }
}

async function startBot() {
    console.log("Bot đang chạy với DeepSeek...");

    setInterval(async () => {
        try {
            const res = await axios.get(`${TELEGRAM_API}/getUpdates`, {
                params: { offset }
            });

            const updates = res.data.result;

            for (let update of updates) {
                offset = update.update_id + 1;

                const msg = update.message;
                if (!msg || !msg.text) continue;

                const chatId = msg.chat.id;
                const text = msg.text;

                // gửi trạng thái "đang typing"
                await axios.post(`${TELEGRAM_API}/sendChatAction`, {
                    chat_id: chatId,
                    action: "typing"
                });

                const reply = await askDeepSeek(text);

                await axios.post(`${TELEGRAM_API}/sendMessage`, {
                    chat_id: chatId,
                    text: reply
                });
            }
        } catch (err) {
            console.error(err.message);
        }
    }, 2000);
}

startBot();