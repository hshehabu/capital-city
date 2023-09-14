require('dotenv').config();
const TelegramBot = require('node-telegram-bot-api');
const bot = new TelegramBot(process.env.TELEGRAM_BOT_API_TOKEN, { polling: true });
const axios = require('axios');
const commands = require('./commands')

bot.setMyCommands(commands)

 
async function getCapitalCity(country) {
  try {
    const response = await axios.get(`https://restcountries.com/v3.1/name/${country}`);
    const data = response.data[0];

    if (data && data.capital) {
      const capitalCity = data.capital[0]; 
      return capitalCity;
    } else {
      return 'Capital city information not found for this country.';
    }
  } catch (error) {
    console.error('Error fetching data:', error.message);
    throw error;
  }
}

bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;
  bot.sendMessage(chatId, 'Welcome to the bot! Use /capital look for capital.');
});

bot.onText(/\/capital/, (msg) => {
  const chatId = msg.chat.id;
  bot.sendMessage(chatId, 'Enter the country').then(() => {
    bot.on('text', async (msg) => {
      const country = msg.text;
      try {
          const capitalCity = await getCapitalCity(country);
          bot.sendMessage(chatId, `The capital city of ${country} is: ${capitalCity}`);
          bot.sendMessage(chatId, "whose else use /capital");
      } catch (error) {
      
        bot.sendMessage(chatId, 'Error fetching data : '+ error.message);
      }
    });
  });
});

bot.on('polling_error', (error) => {
  console.error('Polling error:', error);
});

console.log('Bot is running and listening for messages.');
