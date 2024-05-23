require("dotenv").config();
const TelegramBot = require("node-telegram-bot-api");
const {
  handleStartCommand,
  handleGroupSelection,
  handleChannelIdSetting,
  handleStopCommand,
} = require("./services/commands");
const {
  initializeWhatsApp,
  assignUseSenderDetails,
} = require("./services/whatsapp");

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const bot = new TelegramBot(TELEGRAM_BOT_TOKEN, { polling: true });
let selectedGroups = [];

bot.onText(/\/start/, (msg) => handleStartCommand(bot, msg));
bot.onText(/^\-?\d+$/, (msg) => handleChannelIdSetting(bot, msg));
bot.onText(/\/stop/, (msg) => handleStopCommand(bot, msg));

bot.on("callback_query", (query) => {
  const chatId = query.message.chat.id;
  const data = query.data;

  if (data === "get_qr") {
    initializeWhatsApp(chatId, bot);
  } else if (data.startsWith("group_")) {
    const groupId = data.replace("group_", "");
    if (selectedGroups.includes(groupId)) {
      selectedGroups = selectedGroups.filter((group) => group !== groupId);
    } else {
      selectedGroups.push(groupId);
    }
  } else if (data === "done") {
    handleGroupSelection(bot, selectedGroups, chatId);
  } else if (data.startsWith("include_sender_")) {
    assignUseSenderDetails(data === "include_sender_yes");
    bot.sendMessage(chatId, "Thank you for using our services");
  }
});