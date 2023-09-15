require('dotenv').config();
const { Telegraf, Markup, Scenes, session} = require('telegraf');
const bot = new Telegraf(process.env.TELEGRAM_BOT_API_TOKEN);
const axios = require('axios');
const commands = require('./commands')

bot.telegram.setMyCommands(commands)
bot.use(session());
 
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

const capitalWizard = new Scenes.WizardScene('capital_wizard',
(ctx)=>{
  ctx.reply('Enter the country')
  ctx.wizard.next()
},
async (ctx)=> {
  const country = ctx.message.text;
  await getCapitalCity(country).then((capital)=>{

    ctx.reply(`The capital city of ${country} is: ${capital}`.toUpperCase());
    setTimeout(()=>{
      ctx.reply('Do you want another one?',Markup.inlineKeyboard([
        Markup.button.callback('Yes', 'try_again'),
        Markup.button.callback('No', 'cancel_process')
      ]))

    },2000)
    ctx.wizard.next()
  }).catch((error)=> {
  ctx.reply('error occurred while fetching the data. Do you want to try again?',Markup.inlineKeyboard([
    Markup.button.callback('Yes', 'try_again'),
    Markup.button.callback('No', 'cancel_process')
  ]))
  ctx.wizard.next()
}
  )},
(ctx)=>{
  if(ctx.update.callback_query){
    const userResponse = ctx.update.callback_query.data
    if(userResponse == 'try_again'){
      ctx.reply('please enter another one')
      ctx.answerCbQuery()
      return ctx.wizard.back()
    }else if(userResponse == 'cancel_process'){
      ctx.reply('cancelled process')
      ctx.answerCbQuery()
      ctx.scene.leave()
    }
  }else
  {
    ctx.reply('invalid response use /capital ')
    ctx.scene.leave()
  }
}
)
const stage = new Scenes.Stage([capitalWizard]);
bot.use(stage.middleware());

bot.command('start' , (ctx)=>{
  ctx.reply(`Welcome ${ctx.chat.username} to the bot! Use /capital look for capital cities.`)
})
bot.command('capital' , (ctx)=>{
  ctx.scene.enter('capital_wizard')
})

bot.command('help', (ctx) => {
  ctx.reply('using this bot you can get capital cities of any country in the world by using /capital command');
});
bot.on('text' , (ctx)=>{
  ctx.reply(`here are available commands\n /capital \n /help`);
})
bot.launch();

console.log('Bot is running...');