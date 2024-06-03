const { Client, LocalAuth } = require("whatsapp-web.js");
const qrcode = require("qrcode");
const fs = require("fs");
const fsPromises = fs.promises;

let whatsappClient;
let whatsappSelectedGroups = [];
let telegramChannelId = null;
let useSenderDetails = true;

const deleteQRCodeImage = async (qrImagePath) => {
  try {
    await fsPromises.unlink(qrImagePath);
    console.log("QR code image deleted successfully.");
  } catch (error) {
    console.error("Error deleting QR code image:", error);
  }
};

const initializeWhatsApp = async (chatId, bot) => {
  console.log("Initializing WhatsApp client...");
  try {
    whatsappClient = new Client({
      authStrategy: new LocalAuth(),
      puppeteer: { headless: true, args: ["--no-sandbox"], timeout: 60000 },
      webVersionCache: {
        type: "remote",
        remotePath:
          "https://raw.githubusercontent.com/wppconnect-team/wa-version/main/html/2.2412.54.html",
      },
    });

    whatsappClient.on("qr", async (qr) => {
      console.log("QR code received, generating image...");
      try {
        const qrImageBuffer = await qrcode.toBuffer(qr);
        const qrImagePath = "qr.png";
        await fsPromises.writeFile(qrImagePath, qrImageBuffer);
        const qrImageStream = fs.createReadStream(qrImagePath);
        const options = {
          caption: "Scan the QR code with your phone",
          filename: qrImagePath,
          contentType: "image/png",
        };

        await bot.sendPhoto(chatId, qrImageStream, options);
        console.log("QR code image sent to Telegram.");
        await deleteQRCodeImage(qrImagePath);
      } catch (error) {
        console.error("Error sending QR code:", error);
        bot.sendMessage(
          chatId,
          "An error occurred while sending the QR code. Please try again later."
        );
      }
    });

    whatsappClient.on("ready", async () => {
      console.log("WhatsApp client is ready.");
      try {
        bot.sendMessage(chatId, "WhatsApp client is ready!");

        const chats = await whatsappClient.getChats();
        const groupChats = chats.filter((chat) => chat.isGroup);
        console.log(`Found ${groupChats.length} group(s) on WhatsApp.`);

        if (groupChats.length > 0) {
          const inlineKeyboard = groupChats.map((chat) => [
            { text: chat.name, callback_data: `group_${chat.id._serialized}` },
          ]);
          inlineKeyboard.push([{ text: "Done", callback_data: "done" }]);

          bot.sendMessage(chatId, "Select groups to follow (multi-select):", {
            reply_markup: { inline_keyboard: inlineKeyboard },
          });
          console.log("Sent group selection message to Telegram.");
        } else {
          bot.sendMessage(chatId, "No groups found on WhatsApp.");
          console.log("No groups found on WhatsApp.");
        }
      } catch (error) {
        console.error("Error initializing WhatsApp client:", error);
        bot.sendMessage(
          chatId,
          "An error occurred while initializing WhatsApp. Please try again later."
        );
      }
    });

    whatsappClient.on("message", async (message) => {
      try {
        handleWhatsAppMessage(bot, message);
      } catch (error) {
        console.error("Error handling WhatsApp message:", error);
      }
    });

    await whatsappClient.initialize();
    console.log("WhatsApp client initialized.");
  } catch (error) {
    console.error("Error initializing WhatsApp client:", error);
    bot.sendMessage(
      chatId,
      "An error occurred during WhatsApp initialization. Please try again later."
    );
  }
};

const assignSelectedGroups = (selectedGroups) => {
  console.log("Assigning selected WhatsApp groups:", selectedGroups);
  whatsappSelectedGroups = selectedGroups;
};

const assignTelegramChannelId = (channelId) => {
  console.log("Assigning Telegram channel ID:", channelId);
  telegramChannelId = channelId;
};

const assignUseSenderDetails = (useSenderDetailsValue) => {
  console.log("Assigning useSenderDetails:", useSenderDetailsValue);
  useSenderDetails = useSenderDetailsValue;
};

const handleWhatsAppMessage = async (bot, message) => {
  console.log("Handling WhatsApp message...");
  try {
    const chat = await message.getChat();

    if (
      chat.isGroup &&
      telegramChannelId &&
      whatsappSelectedGroups.includes(chat.id._serialized)
    ) {
      const contact = await message.getContact();
      const senderName = contact.pushname || contact.number;
      const text = useSenderDetails
        ? `${senderName}:\n${message.body}`
        : message.body;
      console.log("Sending message to Telegram:", text);
      await sendToTelegram(bot, text);
    } else {
      console.log(
        "Message ignored (not from a selected group or Telegram channel not set)."
      );
    }
  } catch (error) {
    console.error("Error handling WhatsApp message:", error);
  }
};

const sendToTelegram = async (bot, text) => {
  try {
    console.log("Sending message to Telegram...");
    await bot.sendMessage(Number(telegramChannelId), text);
    console.log("Message sent to Telegram.");
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
