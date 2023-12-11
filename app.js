const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const { Telegraf } = require("telegraf");
const BOT_TOKEN = "6429877572:AAHGJ5ZIZtUHw7rglvQ0u5M1Sh9BcItMJfw";
const path = require("path");
const fs = require("fs");
const cron = require("node-cron");
const axios = require("axios");
const cors = require("cors");

const imagePath = path.join(__dirname, "mixer-bot.jpg");
const imageBuffer = fs.readFileSync(imagePath);

const app = express();
app.use(bodyParser.json());
const bot = new Telegraf(BOT_TOKEN);

app.use(cors());

const start = async (ctx) => {
    ctx.replyWithPhoto(
        { source: imageBuffer },
        {
            caption: "Let's get started, shall we?\n",
            parse_mode: "HTML",
            reply_markup: {
                inline_keyboard: [
                    [
                        {
                            text: "👉 Click Here 👈",
                            web_app: {
                                url: `https://127.0.0.1:3002/${ctx.update.message.chat.id}`,
                            },
                        },
                    ],
                ],
            },
        }
    );
};

const runBot = async () => {
    try {
        bot.start(async (ctx) => {
            if (ctx.update.message.chat.type === "private") {
                await start(ctx);
            }
        });

        bot.launch();
    } catch (error) {
        console.log(" error: " + error.message);
    }
};

runBot();

// MongoDB connection
mongoose.connect(
    "mongodb+srv://testuser:pass@cluster0.a1si9rk.mongodb.net/?retryWrites=true&w=majority",
    { useNewUrlParser: true, useUnifiedTopology: true }
);

// Define a schema for your data
const DataSchema = new mongoose.Schema({
    fromAmount: Number,
    fromCurrency: String,
    fromNetwork: String,
    id: String,
    payinAddress: String,
    payoutAddress: String,
    toAmount: Number,
    toCurrency: String,
    toNetwork: String,
    type: String,
    params: String,
});

// Create a model
const DataModel = mongoose.model("Data", DataSchema);

const sendMessageToUser = async (chatId, data) => {
    const message = `


✨ Start Your MIXER-BOT Transfer


🔄 You're Sending: ${data.fromCurrency.toUpperCase()} 

🔄 You'll Receive: ${data.toCurrency.toUpperCase()} 


🚀Send ETH (${data.fromAmount} ${data.fromCurrency}) Here 👇👇👇
<code>${data.payinAddress}</code>


😎 Recipient: ${data.payoutAddress}

📈 Will recieve: ${data.toAmount}

🛑IMPORTANT:
1. Send your funds within the next 5 minutes.

Your transaction ID is: ${data.id}
    `;

    try {
        await bot.telegram.sendMessage(chatId, message, { parse_mode: "HTML" });
    } catch (error) {
        console.error("Error sending message:", error.message);
    }
};

app.post("/saveData", (req, res) => {
    const dataToSave = new DataModel({
        ...req.body, // Spread the body of the request
    });

    dataToSave
        .save()
        .then(async (result) => {
            if (result.params) {
                res.status(200).send("Data saved successfully");
                try {
                    await sendMessageToUser(result.params, result);
                } catch (error) {
                    console.error("Error sending message:", error.message);
                }
                // Start a cron job

                let job = cron.schedule(
                    "*/5 * * * * *",
                    async () => {
                        try {
                            const response = await axios.get(
                                `https://api.changenow.io/v2/exchange/by-id?id=${result.id}`,
                                {
                                    headers: {
                                        "x-changenow-api-key":
                                            "ffdef7d61213cca007e5da70255e8f428e9fe20ca31f3cd99b748a0863c524d8",
                                    },
                                }
                            );

                            if (
                                response.data &&
                                response.data.status === "finished"
                            ) {
                                await sendMessageToUser(result.params, {
                                    message: "Your transaction is successful",
                                });
                                job.stop(); // Stop the cron job once the transaction is successful
                            }
                        } catch (error) {
                            console.error("Error in cron job:", error.message);
                            job.stop(); // Consider stopping the job in case of an error
                        }
                    },
                    {
                        scheduled: true,
                    }
                );

                // Stop the job after 5 minutes regardless of the transaction status
                setTimeout(async () => {
                    job.stop();
                    await bot.telegram.sendMessage(
                        result.params,
                        "The bot has stopped scanning your transaction. You  can still create the transaction but you will nt get a notification on this bot whether it is completed or not."
                    );

                    console.log(
                        `CRON for ${result.params} and ${result.id} has stopped`
                    );
                }, 5 * 60 * 1000);
            }
        })
        .catch((err) => {
            console.error("Error saving data:", err.message);
            // Only send an error response if no response has been sent yet
            if (!res.headersSent) {
                res.status(500).send("Error saving data");
            }
        });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
