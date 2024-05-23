const { assignSelectedGroups, assignTelegramChannelId } = require("./whatsapp");

const handleStartCommand = (bot, msg) => {
  try {
    const TELEGRAM_USER_IDS = process.env.TELEGRAM_USER_IDS.split(",");
    const chatId = msg.chat.id;
    const userId = String(msg.from.id);

    if (!TELEGRAM_USER_IDS.includes(userId)) {
      bot.sendMessage(chatId, "Unauthorized. Only the bot creator can use this command.");
      return;
    }

    bot.sendMessage(chatId, "Welcome! Click the button below to get the QR code to scan.", {
      reply_markup: { inline_keyboard: [[{ text: "Get QR Code", callback_data: "get_qr" }]] }
    });
  } catch (error) {
    console.error("Error handling start command:", error);
    bot.sendMessage(msg.chat.id, "An error occurred. Please try again later.");
  }
};

const handleGroupSelection = (bot, selectedGroups, chatId) => {
  try {
    if (selectedGroups.length > 0) {
      bot.sendMessage(chatId, `You have selected ${selectedGroups.length} groups.\nPlease provide the Telegram Channel ID to send updates to:`);
      assignSelectedGroups(selectedGroups);
    } else {
      bot.sendMessage(chatId, "No groups selected. Please try again.");
    }
  } catch (error) {
    console.error("Error handling group selection:", error);
    bot.sendMessage(chatId, "An error occurred. Please try again later.");
  }
};

const handleChannelIdSetting = (bot, msg) => {
  const chatId = msg.chat.id;
  const telegramChannelId = msg.text;

  bot.sendMessage(chatId, `Telegram Channel ID set to: ${telegramChannelId}`);
  bot.sendMessage(chatId, "Do you want to include sender details in the forwarded message?", {
    reply_markup: {
      inline_keyboard: [
        [{ text: "Yes", callback_data: "include_sender_yes" }, { text: "No", callback_data: "include_sender_no" }]
      ]
    }
  });
  assignTelegramChannelId(telegramChannelId);
};

const handleStopCommand = (bot, msg) => {
  const chatId = msg.chat.id;
  bot.sendMessage(chatId, "Bot stopped.");
};

module.exports = {
  handleStartCommand,
  handleGroupSelection,
  handleChannelIdSetting,
  handleStopCommand,
};