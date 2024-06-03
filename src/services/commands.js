const { assignSelectedGroups, assignTelegramChannelId, initializeWhatsApp, assignUseSenderDetails } = require("./whatsapp");

const handleStartCommand = (bot, msg) => {
  try {
    const TELEGRAM_USER_IDS = process.env.TELEGRAM_USER_IDS.split(",");
    const chatId = msg.chat.id;
    const userId = String(msg.from.id);

    if (!TELEGRAM_USER_IDS.includes(userId)) {
      bot.sendMessage(chatId, "Unauthorized. Only the bot creator can use this command.");
      console.log(`Unauthorized access attempt by user: ${userId}`);
      return;
    }

    bot.sendMessage(chatId, "Welcome! Click the button below to get the QR code to scan.", {
      reply_markup: { inline_keyboard: [[{ text: "Get QR Code", callback_data: "get_qr" }]] }
    });
    console.log(`Start command received from user: ${userId}`);
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
      console.log(`Groups selected: ${selectedGroups}`);
    } else {
      bot.sendMessage(chatId, "No groups selected. Please try again.");
      console.log("No groups were selected.");
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
  console.log(`Telegram Channel ID set: ${telegramChannelId}`);
};

let selectedGroups = [];
const handleCallback = (bot, query) => {
    const chatId = query.message.chat.id;
    const data = query.data;
  
    if (data === "get_qr") {
      initializeWhatsApp(chatId, bot);
      console.log("QR code requested.");
    } else if (data.startsWith("group_")) {
      const groupId = data.replace("group_", "");
      if (selectedGroups.includes(groupId)) {
        selectedGroups = selectedGroups.filter((group) => group !== groupId);
        console.log(`Group deselected: ${groupId}`);
      } else {
        selectedGroups.push(groupId);
        console.log(`Group selected: ${groupId}`);
      }
    } else if (data === "done") {
      handleGroupSelection(bot, selectedGroups, chatId);
    } else if (data.startsWith("include_sender_")) {
      const includeSender = data === "include_sender_yes";
      assignUseSenderDetails(includeSender);
      bot.sendMessage(chatId, `Sender details will ${includeSender ? "" : "not "}be included in the forwarded message.`);
      console.log(`Include sender details: ${includeSender}`);
      bot.sendMessage(chatId, "Thank you for using our services");
    }
}

const handleStopCommand = (bot, msg) => {
  const chatId = msg.chat.id;
  bot.sendMessage(chatId, "Bot stopped.");
  console.log(`Bot stopped by user: ${msg.from.id}`);
};

module.exports = {
  handleStartCommand,
  handleGroupSelection,
  handleChannelIdSetting,
  handleCallback,
  handleStopCommand,
};