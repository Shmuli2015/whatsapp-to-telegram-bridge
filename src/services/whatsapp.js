const { Client, LocalAuth } = require("whatsapp-web.js");
const TelegramBot = require('node-telegram-bot-api');
const qrcode = require("qrcode");
const fs = require("fs").promises;

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
let whatsappClient;
let whatsappSelectedGroups = [];
let telegramChannelId = null;
let useSenderDetails = true;

const deleteQRCodeImage = async (qrImagePath) => {
  try {
    await fs.unlink(qrImagePath);
    console.log("QR code image deleted successfully.");
  } catch (error) {
    console.error("Error deleting QR code image:", error);
  }
};

const initializeWhatsApp = async (chatId, bot) => {
  try {
    whatsappClient = new Client({
      authStrategy: new LocalAuth(),
      puppeteer: { headless: true, args: ["--no-sandbox"], timeout: 60000 },
      webVersionCache: {
        type: "remote",
        remotePath: "https://raw.githubusercontent.com/wppconnect-team/wa-version/main/html/2.2412.54.html"
      }
    });

    whatsappClient.on("qr", async (qr) => {
      try {
        const qrImageBuffer = await qrcode.toBuffer(qr);
        const qrImagePath = "qr.png";
        await fs.writeFile(qrImagePath, qrImageBuffer);
        bot.sendPhoto(chatId, qrImagePath, { caption: "Scan the QR code with your phone" });
        await deleteQRCodeImage(qrImagePath);
      } catch (error) {
        console.error("Error sending QR code:", error);
        bot.sendMessage(chatId, "An error occurred while sending the QR code. Please try again later.");
      }
    });

    whatsappClient.on("ready", async () => {
      try {
        bot.sendMessage(chatId, "WhatsApp client is ready!");

        const chats = await whatsappClient.getChats();
        const groupChats = chats.filter((chat) => chat.isGroup);

        if (groupChats.length > 0) {
          const inlineKeyboard = groupChats.map((chat) => [{ text: chat.name, callback_data: `group_${chat.id._serialized}` }]);
          inlineKeyboard.push([{ text: "Done", callback_data: "done" }]);

          bot.sendMessage(chatId, "Select groups to follow (multi-select):", {
            reply_markup: { inline_keyboard: inlineKeyboard }
          });
        } else {
          bot.sendMessage(chatId, "No groups found on WhatsApp.");
        }
      } catch (error) {
        console.error("Error initializing WhatsApp client:", error);
        bot.sendMessage(chatId, "An error occurred while initializing WhatsApp. Please try again later.");
      }
    });

    whatsappClient.on("message", async (message) => {
      try {
        handleWhatsAppMessage(message);
      } catch (error) {
        console.error("Error handling WhatsApp message:", error);
      }
    });

    await whatsappClient.initialize();
  } catch (error) {
    console.error("Error initializing WhatsApp client:", error);
    bot.sendMessage(chatId, "An error occurred during WhatsApp initialization. Please try again later.");
  }
};

const assignSelectedGroups = (selectedGroups) => (whatsappSelectedGroups = selectedGroups);
const assignTelegramChannelId = (channelId) => (telegramChannelId = channelId);
const assignUseSenderDetails = (useSenderDetails) => (useSenderDetails = useSenderDetails);

const handleWhatsAppMessage = async (message) => {
  try {
    const chat = await message.getChat();

    if (chat.isGroup && telegramChannelId && whatsappSelectedGroups.includes(chat.id._serialized)) {
      const contact = await message.getContact();
      const senderName = contact.pushname || contact.number;
      const text = useSenderDetails ? `${senderName}:\n${message.body}` : message.body;
      await sendToTelegram(text);
    }
  } catch (error) {
    console.error("Error handling WhatsApp message:", error);
  }
};

const bot = new TelegramBot(TELEGRAM_BOT_TOKEN, { polling: false });

const sendToTelegram = async (text) => {
  try {
    await bot.sendMessage(Number(telegramChannelId), text);
  } catch (error) {
    console.error("Error sending message to Telegram:", error);
  }
};

module.exports = {
  initializeWhatsApp,
  assignSelectedGroups,
  assignTelegramChannelId,
  assignUseSenderDetails,
  handleWhatsAppMessage,
  sendToTelegram,
};