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
var prefix = "~";
var input = message.content.toLowerCase();
if(response[input]){bot.createMessage(message.channel.id, response[input])}
if(message.content.startsWith(prefix+"say")){bot.createMessage(message.channel.id, message.content.split(" ").slice(1).join(" "));}

if(message.content.startsWith(prefix+"addcomm")){
  let command = message.content.split(" ").slice(1);
  let key = JSON.stringify(prefix+command[0]);
  let value = JSON.stringify(message.content.split(" ").slice(2).join(" "));
  let newCommand = key+":"+value;
  let a = JSON.stringify(response)
  a = a.substring(0, a.length - 1);
  let file = fs.createWriteStream('./responses/response.json');
  file.write(a+","+newCommand+`\n}`);
}

if(input == (prefix+"coinflip")){
  let flipTimes = message.content.split(" ").slice(1).join(" ");
  if(isNaN(flipTimes)){bot.createMessage(message.channel.id, "I need a number");return;}
  if (flipTimes > 10 || flipTimes < 1){bot.createMessage(message.channel.id, "Please use a number between 1 and 10");return;}
  if(flipTimes.length == 0){
    let math = Math.floor((Math.random() * 10) + 1);
    if(math >= 5){bot.createMessage(message.channel.id, "Heads");} else{bot.createMessage(message.channel.id,"Tails");return;}
  }else{
    let i = 1;
    let result = `Results of the ${flipTimes} coin flips\n\n`;
    let a = 0;
    let b = 0;
    for(i;i<=flipTimes;i++){
      let math = Math.floor((Math.random() * 10) + 1);
      if (math >= 5){
          var coinResult = "Heads";
          a++;
        }else{
          var coinResult = "Tails";
          b++;
        }

        result += `${i}) ${coinResult}\n`
      }
    bot.createMessage(message.channel.id, result + `\nTotal\nHeads: ${a}\nTails: ${b}`);
    }}
});

bot.connect();
