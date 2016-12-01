var command = {}
const child_process = require('child_process');
const response = require('./responses/response.json');
const config = require('./config/config.json');
const fs = require('fs');
const request = require('request');
const timeStamp = require('time-stamp');
var prefix = "~"
command.ping = {
  "Name":`${prefix}ping`,
  "Useage":"Test to make sure bot is alive",
  "process": function(bot, message){
    message.channel.sendMessage("Pong!")
  }
}
command.say = {
  "Name":`${prefix}say`,
  "Useage":"Echos your message",
  "process": function(bot, message){
    message.channel.sendMessage(message.content.split(" ").slice(1).join(" "));
  }
}
command.coinflip = {
  "Name":`${prefix}coinflip`,
  "Useage":"FLips a coin",
  "process": function(bot,message){
  let flipTimes = message.content.split(" ").slice(1).join(" ");
  if(isNaN(flipTimes)){message.channel.sendMessage("I need a number");return;}
  if (flipTimes > 10 || flipTimes < 1){message.channel.sendMessage("Please use a number between 1 and 10");return;}
  if(flipTimes.length == 0 || flipTimes == 1){
    let math = Math.floor((Math.random() * 10) + 1);
    if(math >= 5){message.channel.sendMessage("Heads");} else{message.channel.sendMessage("Tails");return;}
  }else if(flipTimes>=2){
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
    message.channel.sendMessage(result + `\nTotal\nHeads: ${a}\nTails: ${b}`);
    }

  }
}
command.addcomm = {
  "Name":`${prefix}addcomm`,
  "Useage":"Adds a new command",
  "process": function(bot, message){
  let command = message.content.split(" ").slice(1);
  let key = JSON.stringify(prefix+command[0]);
  let value = JSON.stringify(message.content.split(" ").slice(2).join(" "));;
  let newCommand = key.toLowerCase()+":"+value;
  let a = JSON.stringify(response)
  a = a.substring(0, a.length - 1);
  let file = fs.createWriteStream('./responses/response.json');
  file.write(a+`\n,`+newCommand+`\n}`);
  }
}
command.weather = {
  "Name":`${prefix}weather`,
  "Useage":"Used to look up the weather, ex: ~weather New York",
  "process":function(bot, message){
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
          }});}});
  }
}
command.imdb = {
  "Name":`${prefix}imdb`,
  "Useage":"Looks up movie/TV show by name",
  "process": function(bot, message){
    let media = message.content.split(" ").slice(1).join("+");
    let imbdURL = `http://www.omdbapi.com/?t=${media}&y=&plot=full&r=json`;
    request(imbdURL, function(error,response,body){
      if(!error && response.statusCode == 200){
        let obj = JSON.parse(body);
        if(obj.Title == undefined){message.channel.sendMessage("Unknown Movie or Show");return;}
        message.channel.sendMessage(`**IMDB Info**\n\n**Title:** ${obj.Title}\n**Year:** ${obj.Year}\n**Rating:** ${obj.Rated}\n**Plot:** ${obj.Plot}`);
  }});
  }
}
command.imdbsearch = {
  "Name":`${prefix}imdbsearch`,
  "useage":"Searches the imdb database",
  "process": function(bot, message){
    let media = message.content.split(" ").slice(1).join("+");
                 if (media.length === 0){message.channel.sendMessage("I need search parameters");return;}
                 let imbdURL = `http://www.omdbapi.com/?s=${media}&y=&plot=full&r=json`;
                 request(imbdURL, function(error,response,body){
                   if(!error && response.statusCode == 200){
                     let obj = JSON.parse(body);
                     let results = `**Showing top results from ${obj.totalResults} Results**\n\n`
                     let i = 1;
                     for(i in obj.Search){
                       results += `**${parseInt(i)+1}):**  ${obj.Search[i].Title} (${obj.Search[i].Year}) IMDB ID:  ${obj.Search[i].imdbID}\n`;
                       i++
                     }
                     message.channel.sendMessage(results);
                   }else{
                     message.channel.sendMessage("No results found");
                   }})
  }
}
command.clear = {
  "Name":`${prefix}clear`,
  "Useage":"Bulk deletes messages",
  "process": function(bot,message){
    if(message.author.id !== config.owner){message.reply("You do not have permissions to run this command"); return;}
    let messageCount = message.content.split(" ").slice(1);
    if (messageCount.length === 0) {message.channel.sendMessage("I need to know how many messages to delete"); return;}
    if (isNaN(messageCount)== true) {message.channel.sendMessage("I need a number"); return;}
    if (isNaN(messageCount)== false) {
      let time = timeStamp('YYYY:MM:DD:mm');
      fs.appendFile('./logs/messageDeletion.txt',`${time} Deleted ${messageCount} messages in the channel ${message.channel} by the request of ${message.author}\n`, function(err){
    if(err){
      console.log(err);
    }
  });
  messageCount++;
  message.channel.fetchMessages({limit: messageCount})
  .then(messages => message.channel.bulkDelete(messages));
  }
  }
}
command.eval = {
  "Name":`${prefix}eval`,
  "Useage":"Runs a command",
  "process": function (bot,message) {
    if (message.author.bot) return;
    if (message.author.id !== config.owner){message.reply("You do not have permissions to run this command");return;}
    if (message.author.id === config.owner){
      const evalCommand = message.content.split(' ').slice(1).join(' ');
      message.reply(`\`\`\`${eval(evalCommand)}\`\`\``);}
  }
}
command.showcommands = {
    "Name":`${prefix}showcommands`,
    "Useage":"shows all the custom added commands",
    "process": function(bot, message){
        for(i in response){
            var list;
            list += `\n${i} : ${response[i]}`;
            i++
        }
message.channel.sendMessage("```"+`${list}`+"```");
    }
}

module.exports = command
