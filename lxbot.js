const config =  require('./config/config.json');
const response = require('./responses/response.json');
const fs = require('fs');
const timeStamp = require('time-stamp');
const eris = require('eris');


var bot = new eris(config.token);

bot.on('ready',() =>{
console.log("Ready");
});

bot.on('messageCreate', (message) =>{
if(message.author.bot)return;
let prefix = "~";
let input = message.content.toLowerCase();
if(response[input]){bot.createMessage(message.channel.id, response[input]);}
if(message.content.startsWith(prefix+"say")){bot.createMessage(message.channel.id, message.content.split(" ").slice(1).join(" "));}

if(message.content.startsWith(prefix+"coinFlip")){
  let flipTimes = message.content.split(" ").slice(1).join(" ");
  if (flipTimes > 10){bot.createMessage(message.channel.id, "Please use a number less than or equal to 10");return;}
  if(flipTimes.length == 0){
    let math = Math.floor((Math.random() * 10) + 1);
    if(math >= 5){bot.createMessage(message.channel.id, "Heads");} else{bot.createMessage(message.channel.id,"Tails");return;}
  }else{
    let i = 1;
    let result = `Results of the ${flipTimes} coin flips\n\n`;
    for(i;i<=flipTimes;i++){
      let math = Math.floor((Math.random() * 10) + 1);
      if (math >= 5){
        var coinResult = "Heads";
        }
        else
        {var coinResult = "Tails";}
        result += `${i}) ${coinResult}\n`
      }
    bot.createMessage(message.channel.id, result);
    }
  }
});

bot.connect();
