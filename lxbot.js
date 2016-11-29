const config =  require('./config/config.json');
const response = require('./responses/response.json');
const fs = require('fs');
const request = require('request');
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
    }
  }

  if(message.content.startsWith(prefix+"weather")){
    let address = message.content.split(" ").slice(1).join("+");
    let geocodeURL= `https://maps.googleapis.com/maps/api/geocode/json?address=${address}&key=${config.geocodeToken}`
    request(geocodeURL, function(error,response,body){
      if(!error && response.statusCode == 200){
         let arg = JSON.parse(body);
         if(arg.status == "ZERO_RESULTS" ){bot.createMessage(message.channel.id,"I could not find the location you entered");return;}
         let lat = arg.results[0].geometry.location.lat;
         let lon = arg.results[0].geometry.location.lng;
         let weatherURL = `https://api.darksky.net/forecast/${config.forecastIO}/${lat},${lon}`
         request(weatherURL, function(error,response,body) {
           if(!error && response.statusCode == 200){
             let forecast = JSON.parse(body);
             bot.createMessage(message.channel.id,
               `**Weather for today in  ${arg.results[0].address_components[1].long_name}:** ${forecast.hourly.data[0].summary}\n\n`+
               `Tempature: ${forecast.hourly.data[0].apparentTemperature} F\n`+
               `Humidity: ${forecast.hourly.data[0].humidity}\n`+
               `Wind Speed: ${forecast.hourly.data[0].windSpeed} MPH\n`+
               `Visibility: ${forecast.hourly.data[0].visibility} Miles`)
    }});}})};

});

bot.connect();
