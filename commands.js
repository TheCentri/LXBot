var command = {};
const response = require('./responses/response.json');
const config = require('./config/config.json');
const fs = require('fs');
const request = require('request');
const timeStamp = require('time-stamp');
const ytdl = require('ytdl-core');
const os = require('os');
var prefix = "~";
var queue = [];
command.ping = {
  "Name":`${prefix}ping`,
  "Useage":"Test to make sure bot is alive",
  "process": function(bot, message){
    message.channel.sendMessage("Pong!");
  }
};
command.say = {
  "Name":`${prefix}say`,
  "Useage":"Echos your message",
  "process": function(bot, message){
    message.channel.sendMessage(message.content.split(" ").slice(1).join(" "));
  }
};
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

        result += `${i}) ${coinResult}\n`;
      }
    message.channel.sendMessage(result + `\nTotal\nHeads: ${a}\nTails: ${b}`);
    }

  }
};
command.addcomm = {
  "Name":`${prefix}addcomm`,
  "Useage":"Adds a new command",
  "process": function(bot, message){
  let command = message.content.split(" ").slice(1);
  let key = JSON.stringify(prefix+command[0]);
  let value = JSON.stringify(message.content.split(" ").slice(2).join(" "));
  let newCommand = key.toLowerCase()+":"+value;
  let a = JSON.stringify(response);
  a = a.substring(0, a.length - 1);
  let file = fs.createWriteStream('./responses/response.json');
  file.write(a+`\n,`+newCommand+`\n}`);
  }
};
command.weather = {
  "Name":`${prefix}weather`,
  "Useage":"Used to look up the weather, ex: ~weather New York",
  "process":function(bot, message){
    let address = message.content.split(" ").slice(1).join("+");
    let geocodeURL= `https://maps.googleapis.com/maps/api/geocode/json?address=${address}&key=${config.geocodeToken}`;
    request(geocodeURL, function(error,response,body){
      if(!error && response.statusCode == 200){
      let arg = JSON.parse(body);
      if(arg.status == "ZERO_RESULTS" ){message.channel.sendMessage("I could not find the location you entered");return;}
      let lat = arg.results[0].geometry.location.lat;
      let lon = arg.results[0].geometry.location.lng;
      let weatherURL = `https://api.darksky.net/forecast/${config.forecastIO}/${lat},${lon}`;
      request(weatherURL, function(error,response,body) {
       if(!error && response.statusCode == 200){
         let forecast = JSON.parse(body);
         message.channel.sendMessage(
           `**Weather for today in  ${arg.results[0].address_components[1].long_name}:** ${forecast.hourly.data[0].summary}\n\n`+
           `Tempature: ${forecast.hourly.data[0].apparentTemperature} F\n`+
           `Humidity: ${forecast.hourly.data[0].humidity}\n`+
           `Wind Speed: ${forecast.hourly.data[0].windSpeed} Mph\n`+
           `Visibility: ${forecast.hourly.data[0].visibility} Miles`);
          }});}});
  }
};
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
};
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
        let results = `**Showing top results from ${obj.totalResults} Results**\n\n`;
        let i = 1;
        for(i in obj.Search){
          results += `**${parseInt(i)+1}):**  ${obj.Search[i].Title} (${obj.Search[i].Year}) IMDB ID:  ${obj.Search[i].imdbID}\n`;
          i++;
        }
        message.channel.sendMessage(results);
        }else{message.channel.sendMessage("No results found");
        }
      });
  }
};
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
      fs.appendFile('./logs/messageDeletion.txt',
      `${time} Deleted ${messageCount} messages in the channel ${message.channel}`+
      `by the request of ${message.author}\n`, function(err){
    if(err){
      console.log(err);
    }
        messageCount++;
        message.channel.fetchMessages({limit: messageCount})
        .then(messages => message.channel.bulkDelete(messages));
      });
    }
  }
};
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
};
command.showcommands = {
    "Name":`${prefix}showcommands`,
    "Useage":"shows all the custom added commands",
    "process": function(bot, message){
      let i;
        for(i in response){
            var list;
            list += `\n${i} : ${response[i]}`;
            i++;
        }
        message.channel.sendMessage("```"+`${list}`+"```");
    }
};
command.music = {
  "Name":`${prefix}music`,
  "Useage":"Joics bot to voice channel",
  "process": function(bot,message){
    var args = message.content.split(" ");
    if(args[1] == 'join'){
      var voice = message.member.voiceChannel;
      if(voice == undefined){message.reply("You need to be in a voice channel first");
        }else if(message.guild.voiceConnection){message.channel.sendMessage("I'm already in a voice channel");
        }else {message.member.voiceChannel.join()}
        }else if (args[1] == 'leave'){
          message.member.voiceChannel.leave();
        }
        else if(args[1] == 'play'){
          if(message.guild.voiceConnection == null){message.reply("Join me to a voice channel first");return;}
          queue.push(args[2]);
          message.channel.sendMessage("Added to queue :ok_hand:");
          let streamOptions = { seek: 0, volume: 1 };
          let link = message.content.split(" ").slice(1);
          let stream = ytdl(`${link}`, {filter:'audioonly'});
          var player = message.guild.voiceConnection.playStream(stream, streamOptions);
          player.on('end', () =>{
            message.member.voiceChannel.leave();
          });
        }
        else if (args[1] == 'queue') {
          let i = 1;
          var currentQueue = "";
          for(i in queue){
            currentQueue += `\n${i} )${queue[i]}`;
            i++;
          }
          message.channel.sendMessage(`Current Queue ${currentQueue}\n`);
      }
        else if (args[1] == "help" || args[1] == undefined) {
         message.channel.sendMessage(`**Music commands**:\n\n`+
         `${prefix}music join : Joins the bot to the same voice channel the user is in\n`+
         `${prefix}music play : Plays the requested YouTube link, `+
         `if a song is already playing it will add it to the queue\n`+
         `${prefix}music queue : Shows the current queue\n`+
         `${prefix}music leave : Makes the bot leave the voice channel`);
      }
  }
};
command.system = {
  "Name":`${prefix}sytem`,
  "Useage":"Gets stats about the system the bot is running on",
  "process": function(bot, message){
    if(message.author.id !== config.owner){message.channel.sendMessage("You are not authorized to run this command");return;}
    let args = message.content.split(" ");
    if(args[1] == 'ip'){
      let ip = os.networkInterfaces();
      message.channel.sendMessage(ip.eth0[0].address);
    }else if(args[1] == 'uptime'){
      message.channel.sendMessage(os.uptime());
    }else if(args[1] == 'hostname'){
      message.channel.sendMessage(os.hostname());
    }else if(args[1] == 'loadavg'){
      message.channel.sendMessage(os.loadavg());
    }
  }
};
command.urban = {
  "Name":`${prefix}urban`,
  "Useage":"Used this to search urban dictonary",
  "process":function(bot, message){
      let word = message.content.split(" ").slice(1).join('+');
      request(`http://api.urbandictionary.com/v0/define?term=${word}`,function(error, response, body) {
         let result = JSON.parse(body);
         if(result.result_type == "no_results"){message.channel.sendMessage(`No results for "${word}"`);return}
         let reply = `Top definitions in Urban Dictonary for "${message.content.split(" ").slice(1).join(" ")}":\n\n`;
          let i;
         for(i in result.list){
           reply += `\n${parseInt(i)+1}) ${result.list[i].definition}\n`;
           i++;
           if(i >= 3){message.channel.sendMessage(reply);return}
         }
         message.channel.sendMessage(reply);
      });
  }
};

module.exports = command;
