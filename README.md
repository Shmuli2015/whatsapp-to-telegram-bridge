# Telegram Bot for WhatsApp Integration

This project is a Node.js application that integrates Telegram with WhatsApp using the `node-telegram-bot-api` and `whatsapp-web.js` libraries. The bot allows authorized users to connect their WhatsApp account, select WhatsApp groups, and forward messages from these groups to a specified Telegram channel.

- **Start Command**: Initializes the WhatsApp client and provides a QR code for authentication.
- **Group Selection**: Allows users to select WhatsApp groups for message forwarding.
- **Channel ID Setting**: Sets the Telegram channel ID for forwarding messages.
- **Stop Command**: Stops the bot.
- **Callback Queries**: Handles various callback queries for group selection and additional settings.

## Prerequisites
- Node.js (version 14 or higher)
- npm
- A Telegram bot token from BotFather
- WhatsApp account

## Installation
1. Clone the repository:
    ```bash
    git clone https://github.com/Shmuli2015/whatsapp-to-telegram-bridge.git
    cd whatsapp-to-telegram-bridge
    ```

2. Install the dependencies:
    ```bash
    npm install
    ```

3. Create a `.env` file in the root directory and add the following environment variables:
    ```plaintext
    TELEGRAM_BOT_TOKEN=your_telegram_bot_token
    TELEGRAM_USER_IDS=comma_separated_user_ids
    PORT=your_preferred_port
    ```

4. Start the application:
    ```bash
    npm start
    ```
    
## Usage

1. **Start the Bot**: Send `/start` command in Telegram to initialize the WhatsApp client and get the QR code for authentication.
2. **Select WhatsApp Groups**: After scanning the QR code, select the WhatsApp groups you want to follow.
3. **Set Telegram Channel ID**: Send the Telegram channel ID where you want the messages to be forwarded.
4. **Include Sender Details**: Choose whether to include sender details in the forwarded messages.
5. **Stop the Bot**: Send `/stop` command to stop the bot.

## Commands

- `/start`: Initialize the WhatsApp client and get the QR code.
- `/stop`: Stop the bot.

## Callback Queries

- `get_qr`: Get the QR code for WhatsApp authentication.
- `group_<id>`: Select or deselect a WhatsApp group.
- `done`: Finalize group selection.
- `include_sender_yes`: Include sender details in forwarded messages.
- `include_sender_no`: Do not include sender details.

## Contributing

Contributions are welcome! Please open an issue or submit a pull request for any improvements or bug fixes.

## Acknowledgements

- [node-telegram-bot-api](https://github.com/yagop/node-telegram-bot-api)
- [whatsapp-web.js](https://github.com/pedroslopez/whatsapp-web.js)
- [qrcode](https://github.com/soldair/node-qrcode)

---
