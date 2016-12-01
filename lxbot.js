const config =  require('./config/config.json');
const commands = require('./commands.js');
const response = require('./responses/response.json');
const Discord = require('discord.js');
const timeStamp = require('time-stamp');
const bot = new Discord.Client();


bot.on('ready',() =>{
console.log(timeStamp('YYYY:MM:DD:mm')+" Ready");
});
bot.on('message', message => {
  if(message.author.bot)return;
  if(!message.content.startsWith('~')){return;}
  var input = message.content.split(" ")
  var command = message.content.slice(1).split(" ");
  command = command[0];
  let cmd = commands[command];
  if(response[input]){message.channel.sendMessage(response[input]);return;}
  if(cmd.Name){cmd.process(bot, message, command);}else{return;}
});

bot.login(config.token);
