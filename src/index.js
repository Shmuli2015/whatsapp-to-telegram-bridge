require("dotenv").config();
const express = require("express");
const TelegramBot = require("node-telegram-bot-api");
const {
  handleStartCommand,
  handleChannelIdSetting,
  handleStopCommand,
  handleCallback,
} = require("./services/commands");

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const bot = new TelegramBot(TELEGRAM_BOT_TOKEN, { polling: true });

bot.onText(/\/start/, (msg) => {
  console.log("Received /start command");
  handleStartCommand(bot, msg);
});

bot.onText(/^\-?\d+$/, (msg) => {
  console.log("Received channel ID:", msg.text);
  handleChannelIdSetting(bot, msg);
});

bot.onText(/\/stop/, (msg) => {
  console.log("Received /stop command");
  handleStopCommand(bot, msg);
});

bot.on("callback_query", (query) => {
  console.log("Received callback query:", query.data);
  handleCallback(bot, query);
});

// Create Express server
const app = express();
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
