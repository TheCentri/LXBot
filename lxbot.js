const config =  require('./config/config.json');
const response = require('./responses/response.json');
const commands = require('./commands/commands.js');
const fs = require('fs');
const request = require('request');
const timeStamp = require('time-stamp');
const Discord = require('discord.js');
const bot = new Discord.Client();


bot.on('ready',() =>{
console.log("Ready");
});

bot.on('message', message => {
  if(message.author.bot)return;
  var prefix = "~";
  var input = message.content.toLowerCase();
  var command = message.content.split(" ");
  command = command[0];
  let cmd = commands[command];

  if(cmd){
    cmd.process(bot, message, command);
  }

});



























  /*if(response[input]){message.channel.sendMessage(response[input])}
  if(message.content.startsWith(prefix+"say")){message.channel.sendMessage(message.content.split(" ").slice(1).join(" "));}

  if(command.toLowerCase() == (prefix + "voice")){
    let voiceChannel = message.member.voiceChannel;
    voiceChannel.join();

  }

  if(command.toLowerCase == (prefix+"alias")){
    let command = message.content.split(" ").slice(1);
    let key = JSON.stringify(prefix+command[0]);
    let value = JSON.stringify(message.content.split(" ").slice(2).join(" "));;
    let newCommand = key.toLowerCase()+":"+value;
    let a = JSON.stringify(response)
    a = a.substring(0, a.length - 1);
    let file = fs.createWriteStream('./responses/response.json');
    file.write(a+","+newCommand+`\n}`);
}

if(command.toLowerCase() == (prefix+"coinflip")){
  let flipTimes = message.content.split(" ").slice(1).join(" ");
  if(isNaN(flipTimes)){message.channel.sendMessage( "I need a number");return;}
  if (flipTimes > 10 || flipTimes < 1){message.channel.sendMessage( "Please use a number between 1 and 10");return;}
  if(flipTimes.length == 0){
    let math = Math.floor((Math.random() * 10) + 1);
    if(math >= 5){message.channel.sendMessage( "Heads");} else{message.channel.sendMessage("Tails");return;}
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
    message.channel.sendMessage( result + `\nTotal\nHeads: ${a}\nTails: ${b}`);
    }
  }

  if(command.toLowerCase() == (prefix+"weather")){
    let address = message.content.split(" ").slice(1).join("+");
    let geocodeURL= `https://maps.googleapis.com/maps/api/geocode/json?address=${address}&key=${config.geocodeToken}`
    request(geocodeURL, function(error,response,body){
      if(!error && response.statusCode == 200){
         let arg = JSON.parse(body);
         if(arg.status == "ZERO_RESULTS" ){message.channel.sendMessage("I could not find the location you entered");return;}
         let lat = arg.results[0].geometry.location.lat;
         let lon = arg.results[0].geometry.location.lng;
         let weatherURL = `https://api.darksky.net/forecast/${config.forecastIO}/${lat},${lon}`
         request(weatherURL, function(error,response,body) {
           if(!error && response.statusCode == 200){
             let forecast = JSON.parse(body);
             message.channel.sendMessage(
               `**Weather for today in  ${arg.results[0].address_components[1].long_name}:** ${forecast.hourly.data[0].summary}\n\n`+
               `Tempature: ${forecast.hourly.data[0].apparentTemperature} F\n`+
               `Humidity: ${forecast.hourly.data[0].humidity}\n`+
               `Wind Speed: ${forecast.hourly.data[0].windSpeed} Mph\n`+
               `Visibility: ${forecast.hourly.data[0].visibility} Miles`)
    }});}})};
  if(command.toLowerCase() == (prefix + "imdb")){
    let media = message.content.split(" ").slice(1).join("+");
    let imbdURL = `http://www.omdbapi.com/?t=${media}&y=&plot=full&r=json`;
    request(imbdURL, function(error,response,body){
        if(!error && response.statusCode == 200){
          let obj = JSON.parse(body);
          if(obj.Title == undefined){message.channel.sendMessage("Unknown Movie or Show");return;}
          message.channel.sendMessage(`**IMDB Info**\n\n**Title:** ${obj.Title}\n**Year:** ${obj.Year}\n**Rating:** ${obj.Rated}\n**Plot:** ${obj.Plot}`);
        }});}


  if(command.toLowerCase() == (prefix + "searchimdb")){
    let media = message.content.split(" ").slice(1).join("+");
    if (media.length === 0){message.channel.sendMessage("I need search parameters");return;}
    let imbdURL = `http://www.omdbapi.com/?s=${media}&y=&plot=full&r=json`;
    request(imbdURL, function(error,response,body){
      if(!error && response.statusCode == 200){
        let obj = JSON.parse(body);
        let results = `**Showing top results from ${obj.totalResults} Results**\n\n`
        let i = 1;
        for(i in obj.Search){
          results += `**${parseInt(i)+1}):**  ${obj.Search[i].Title} *(${obj.Search[i].Year}) IMDB ID:  ${obj.Search[i].imdbID}*\n`;
          i++
        }
        message.channel.sendMessage(results);
        }else{message.channel.sendMessage("No results found :(");
        }
      });
}*/
//});



bot.login(config.token);
