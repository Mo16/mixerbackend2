const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const { Telegraf } = require("telegraf");
const BOT_TOKEN = "6951312848:AAE0q0gmBgATI8UYbH1GXmMXZEoHyX42P6o";
// const BOT_TOKEN = "6429495816:AAG5LrEM-EzVAV7f5idfYtMWEpBT0ORcJgs";
const { Web3 } = require("web3");
const FixedFloat = require("fixedfloat-api");

const fixed = new FixedFloat(
    "hdODr4QhYPMJOiYjlHEiYwn99sPg7jRHRcIe3CcN",
    "oKRNtqt3bPTDuc7SX2N2NW7T3g6GpjVxQRf40fZO"
);

// async function name(){
	// const response = await fixed.getCurrencies();
// 	console.log(response)
// }
// name()

const path = require("path");
const fs = require("fs");
const cron = require("node-cron");
const axios = require("axios");
const cors = require("cors");
const { Exception } = require("sass");

const imagePath = path.join(__dirname, "mixer-bot.png");
const imageBuffer = fs.readFileSync(imagePath);

const TWO_MINUTES = 2 * 60 * 1000;

// web3

const web3 = new Web3(
    new Web3.providers.HttpProvider(
        "https://mainnet.infura.io/v3/aa65dbb313104a608ab5b55aba0e306b"
    )
);
const contractABI = [
    {
        inputs: [],
        stateMutability: "nonpayable",
        type: "constructor",
    },
    {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                internalType: "address",
                name: "owner",
                type: "address",
            },
            {
                indexed: true,
                internalType: "address",
                name: "spender",
                type: "address",
            },
            {
                indexed: false,
                internalType: "uint256",
                name: "value",
                type: "uint256",
            },
        ],
        name: "Approval",
        type: "event",
    },
    {
        anonymous: false,
        inputs: [
            {
                indexed: false,
                internalType: "uint256",
                name: "_maxTxAmount",
                type: "uint256",
            },
        ],
        name: "MaxTxAmountUpdated",
        type: "event",
    },
    {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                internalType: "address",
                name: "previousOwner",
                type: "address",
            },
            {
                indexed: true,
                internalType: "address",
                name: "newOwner",
                type: "address",
            },
        ],
        name: "OwnershipTransferred",
        type: "event",
    },
    {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                internalType: "address",
                name: "from",
                type: "address",
            },
            {
                indexed: true,
                internalType: "address",
                name: "to",
                type: "address",
            },
            {
                indexed: false,
                internalType: "uint256",
                name: "value",
                type: "uint256",
            },
        ],
        name: "Transfer",
        type: "event",
    },
    {
        inputs: [],
        name: "AddLP",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
    },
    {
        inputs: [],
        name: "VerifyBotApp",
        outputs: [],
        stateMutability: "pure",
        type: "function",
    },
    {
        inputs: [],
        name: "_maxTaxSwap",
        outputs: [
            {
                internalType: "uint256",
                name: "",
                type: "uint256",
            },
        ],
        stateMutability: "view",
        type: "function",
    },
    {
        inputs: [],
        name: "_maxTxAmount",
        outputs: [
            {
                internalType: "uint256",
                name: "",
                type: "uint256",
            },
        ],
        stateMutability: "view",
        type: "function",
    },
    {
        inputs: [],
        name: "_maxWalletSize",
        outputs: [
            {
                internalType: "uint256",
                name: "",
                type: "uint256",
            },
        ],
        stateMutability: "view",
        type: "function",
    },
    {
        inputs: [],
        name: "_taxSwapThreshold",
        outputs: [
            {
                internalType: "uint256",
                name: "",
                type: "uint256",
            },
        ],
        stateMutability: "view",
        type: "function",
    },
    {
        inputs: [
            {
                internalType: "address",
                name: "owner",
                type: "address",
            },
            {
                internalType: "address",
                name: "spender",
                type: "address",
            },
        ],
        name: "allowance",
        outputs: [
            {
                internalType: "uint256",
                name: "",
                type: "uint256",
            },
        ],
        stateMutability: "view",
        type: "function",
    },
    {
        inputs: [
            {
                internalType: "address",
                name: "spender",
                type: "address",
            },
            {
                internalType: "uint256",
                name: "amount",
                type: "uint256",
            },
        ],
        name: "approve",
        outputs: [
            {
                internalType: "bool",
                name: "",
                type: "bool",
            },
        ],
        stateMutability: "nonpayable",
        type: "function",
    },
    {
        inputs: [
            {
                internalType: "address",
                name: "account",
                type: "address",
            },
        ],
        name: "balanceOf",
        outputs: [
            {
                internalType: "uint256",
                name: "",
                type: "uint256",
            },
        ],
        stateMutability: "view",
        type: "function",
    },
    {
        inputs: [],
        name: "decimals",
        outputs: [
            {
                internalType: "uint8",
                name: "",
                type: "uint8",
            },
        ],
        stateMutability: "pure",
        type: "function",
    },
    {
        inputs: [],
        name: "enableTrading",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
    },
    {
        inputs: [],
        name: "manualSwap",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
    },
    {
        inputs: [],
        name: "name",
        outputs: [
            {
                internalType: "string",
                name: "",
                type: "string",
            },
        ],
        stateMutability: "pure",
        type: "function",
    },
    {
        inputs: [],
        name: "owner",
        outputs: [
            {
                internalType: "address",
                name: "",
                type: "address",
            },
        ],
        stateMutability: "view",
        type: "function",
    },
    {
        inputs: [],
        name: "recoverETHs",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
    },
    {
        inputs: [],
        name: "removeMaxLimits",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
    },
    {
        inputs: [],
        name: "renounceOwnership",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
    },
    {
        inputs: [
            {
                internalType: "uint256",
                name: "taxFeeOnBuy",
                type: "uint256",
            },
            {
                internalType: "uint256",
                name: "taxFeeOnSell",
                type: "uint256",
            },
        ],
        name: "setNewFee",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
    },
    {
        inputs: [],
        name: "symbol",
        outputs: [
            {
                internalType: "string",
                name: "",
                type: "string",
            },
        ],
        stateMutability: "pure",
        type: "function",
    },
    {
        inputs: [],
        name: "totalSupply",
        outputs: [
            {
                internalType: "uint256",
                name: "",
                type: "uint256",
            },
        ],
        stateMutability: "pure",
        type: "function",
    },
    {
        inputs: [
            {
                internalType: "address",
                name: "recipient",
                type: "address",
            },
            {
                internalType: "uint256",
                name: "amount",
                type: "uint256",
            },
        ],
        name: "transfer",
        outputs: [
            {
                internalType: "bool",
                name: "",
                type: "bool",
            },
        ],
        stateMutability: "nonpayable",
        type: "function",
    },
    {
        inputs: [],
        name: "transferDelayEnabled",
        outputs: [
            {
                internalType: "bool",
                name: "",
                type: "bool",
            },
        ],
        stateMutability: "view",
        type: "function",
    },
    {
        inputs: [
            {
                internalType: "address",
                name: "sender",
                type: "address",
            },
            {
                internalType: "address",
                name: "recipient",
                type: "address",
            },
            {
                internalType: "uint256",
                name: "amount",
                type: "uint256",
            },
        ],
        name: "transferFrom",
        outputs: [
            {
                internalType: "bool",
                name: "",
                type: "bool",
            },
        ],
        stateMutability: "nonpayable",
        type: "function",
    },
    {
        stateMutability: "payable",
        type: "receive",
    },
];
const contractAddress = "0x13c4aa5c3f5bb1109c267e520a87c89684d3e73c"; // Your contract address
const contract = new web3.eth.Contract(contractABI, contractAddress);

// mongodb verifying account

// MongoDB connection
mongoose
    .connect(
        "mongodb+srv://testuser:pass@cluster0.a1si9rk.mongodb.net/?retryWrites=true&w=majority",
        {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        }
    )
    .then(() => console.log("MongoDB connected"))
    .catch((err) => console.log(err));

// User model
const User = mongoose.model(
    "User",
    new mongoose.Schema({
        username: String,
        address: String,
        tokens: Number,
    })
);

const app = express();
app.use(bodyParser.json());
const bot = new Telegraf(BOT_TOKEN);

app.use(cors());

async function updateTokenBalances() {
    console.log("checking update");
    const users = await User.find({});

    for (const user of users) {
        try {
            const tokens = await contract.methods
                .balanceOf(user.address)
                .call();
            const token = parseInt(tokens);

            await User.findByIdAndUpdate(user._id, { tokens: token });
            console.log("updated ", user.username);
        } catch (error) {
            console.error(
                `Error updating tokens for user ${user.username}: ${error.message}`
            );
        }
    }
}

setInterval(updateTokenBalances, TWO_MINUTES);

app.post("/create-order", async (req, res) => {
    const { fromAmount, address, fromCurrency, toCurrency } = req.body;
	console.log(req.body)
    if (!fromAmount || !address || !fromCurrency || !toCurrency) {
        return res.status(400).send("all fields are required");
    }

    try {
        const response = await fixed.createOrder(
            `${fromAmount} ${fromCurrency}`,
            toCurrency,
            address
        );

		if(response){
			res.status(200).send(response);
			console.log("order made");
			console.log(response);
		}else{
			res.status(400).send(response);

		}


    } catch (e) {
        console.log(531, e);

        res.status(400).json({error: "An error has occured, please try again"});
    }
});

app.post("/adduser", async (req, res) => {
    const { username, address, tokens } = req.body;
    if (!username || !address || !tokens) {
        return res.status(400).send("Username and address are required");
    }

    try {
        // Check if the address already exists and update the username if it does
        const updatedUser = await User.findOneAndUpdate(
            { address }, // find a document with this address
            { username: username.toLowerCase(), tokens }, // update the username
            { new: true, upsert: true } // options: return the updated document and create it if it doesn't exist
        );

        if (updatedUser) {
            res.status(201).send("User added or updated successfully");
        } else {
            res.status(404).send("User not found and not added");
        }
    } catch (error) {
        res.status(500).send(error.message);
    }
});

app.post("/checkuser", async (req, res) => {
    const { username } = req.body;
    if (!username) {
        return res.status(400).send("Username is required");
    }

    try {
        const user = await User.findOne({ username });
        if (user) {
            res.status(200).json({ exists: true });
        } else {
            res.status(200).json({ exists: false });
        }
    } catch (error) {
        res.status(500).send(error.message);
    }
});

// THE BOT FRONTEND

const start = async (ctx) => {
    const userId = ctx.update.message.chat.id;

    try {

        // Since you've already connected to MongoDB outside this function,
        // you don't need to connect again here. Just use the User model directly.

        // const userExists = await User.findOne({ username: userId });

        // if (userExists) {
        //     // User exists in the database, continue with existing functionality
        //     ctx.replyWithPhoto(
        //         { source: imageBuffer },
        //         {
        //             caption: "Click below and leave the matrix...?\n",
        //             parse_mode: "HTML",
        //             reply_markup: {
        //                 inline_keyboard: [
        //                     [
        //                         {
        //                             text: "👉 ESCAPE 👈",
        //                             web_app: {
        //                                 url: `https://sage-hummingbird-59d561.netlify.app/${userId}`,
        //                             },
        //                         },
        //                     ],
        //                 ],
        //             },
        //         }
        //     );
        // } else {
            // User does not exist, prompt for verification


        ctx.reply(
                "You are not verified, Please verify yourself to use this bot.",
                {
                    reply_markup: {
                        inline_keyboard: [
                            [
                                {
                                    text: "Verify yourself",
                                    url: `http://127.0.0.1:3001/${userId}`,
                                },
                            ],
                        ],
                    },
                }
            );
        }
     catch (e) {
        console.error(e);
    }
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
    ✨ Matrix Mixer Bot: Crypto Transfer Initiation ✨
    ─────────────────────────────────────────
    🔄 Exchange Details:
       Sending: ${data.fromCurrency.toUpperCase()}
       Receiving: ${data.toCurrency.toUpperCase()}
    
    🚀 To Initiate Transfer:
       Send [${
           data.fromAmount
       } ${data.fromCurrency.toUpperCase()} (${data.fromNetwork.toUpperCase()} Network)]
       To: <code>${data.payinAddress}</code>
    
    😎 Recipient Details:
       Address: ${data.payoutAddress}
       Will Receive: ${data.toAmount} ${data.toCurrency.toUpperCase()}
    
    🛑 Important:
       - Complete transfer within 10 minutes.
       - Transaction ID: ${data.id}
    ─────────────────────────────────────────
    "The Matrix is everywhere. It is all around us, even now in this very message..."
    ─────────────────────────────────────────
    
    
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

                let confirmingMessageSent = false; // Flag to track if the confirming message has been sent

                let job = cron.schedule(
                    "*/10 * * * * *",
                    async () => {
                        try {
                            // const response = await axios.get(
                            //     `https://api.changenow.io/v2/exchange/by-id?id=${result.id}`,
                            //     {
                            //         headers: {
                            //             "x-changenow-api-key":
                            //                 "ffdef7d61213cca007e5da70255e8f428e9fe20ca31f3cd99b748a0863c524d8",
                            //         },
                            //     }
                            // );

							const response = await fixed.getOrder(result.id, result.token);

                            if (response.data) {
                                if (response.data.status === "DONE") {
                                    await bot.telegram.sendMessage(
                                        result.params,
                                        "Your Transaction has been successful, Congratulations, you are out of the matrix..."
                                    );
                                    job.stop(); // Stop the cron job once the transaction is successful
                                    confirmingMessageSent = false; // Reset the flag
                                } else if (
                                    response.data.status === "PENDING" &&
                                    !confirmingMessageSent
                                ) {
                                    await bot.telegram.sendMessage(
                                        result.params,
                                        "Transaction status: PENDING. Please wait while we encode your digital assets into the Matrix. Patience, Neo..."
                                    );
                                    confirmingMessageSent = true; // Set the flag to prevent sending the message again
                                }
                            }
                        } catch (error) {
                            console.error("Error in cron job:", error.message);
                            job.stop(); // Consider stopping the job in case of an error
                            confirmingMessageSent = false; // Reset the flag
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

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
