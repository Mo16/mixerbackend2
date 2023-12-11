const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const { Telegraf } = require("telegraf");
const BOT_TOKEN = "6951312848:AAE0q0gmBgATI8UYbH1GXmMXZEoHyX42P6o";
// const BOT_TOKEN = "6429495816:AAG5LrEM-EzVAV7f5idfYtMWEpBT0ORcJgs";

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
            caption: "Click below and leave the matrix...?\n",
            parse_mode: "HTML",
            reply_markup: {
                inline_keyboard: [
                    [
                        {
                            text: "👉 ESCAPE 👈",
                            web_app: {
                                url: `https://sage-hummingbird-59d561.netlify.app/${ctx.update.message.chat.id}`,
                                // url: `http://127.0.0.1:3002/${ctx.update.message.chat.id}`,
                                
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
    ╔════════════════════════════════════════════════════════════════════
    ║ ✨ MIXER-BOT CRYPTO TRANSFER INITIATED ✨                           
    ║ ────────────────────────────────────────────────────────────────── 
    ║ 🔄 Currency Exchange:                                               
    ║    Sending: ${data.fromCurrency.toUpperCase()}                     
    ║    Receiving: ${data.toCurrency.toUpperCase()}                     
    ║                                                                    
    ║ 🚀 Send ETH [${data.fromAmount} ${data.fromCurrency.toUpperCase()}]
    ║    To Address:                                                      
    ║    <code>${data.payinAddress}</code>                               
    ║                                                                    
    ║ 😎 Recipient Address:                                               
    ║    ${data.payoutAddress}                                            
    ║                                                                    
    ║ 📈 You Will Receive:                                                
    ║    ${data.toAmount} ${data.toCurrency.toUpperCase()}               
    ║                                                                    
    ║ 🛑 IMPORTANT:                                                       
    ║    - Complete transfer within 10 minutes.                          
    ║    - Transaction ID: ${data.id}                                    
    ║ ────────────────────────────────────────────────────────────────── 
    ║ "The Matrix is everywhere, it is all around us. Even now in this   
    ║  very message..."                                                  
    ╚════════════════════════════════════════════════════════════════════
    
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
                    "*/10 * * * * *",
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
                                await bot.telegram.sendMessage(
                                    result.params,
                                    "Your Transaction has been successful, Congratulations, you are out the matrix..."
                                );
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

                // Stop the job after 10 minutes regardless of the transaction status
                setTimeout(async () => {
                    job.stop();
                    await bot.telegram.sendMessage(
                        result.params,
                        "The bot has stopped scanning your transaction. You  can still create the transaction but you will not get a notification on this bot whether it is completed or not."
                    );

                    console.log(
                        `CRON for ${result.params} and ${result.id} has stopped`
                    );
                }, 10 * 60 * 1000);
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
