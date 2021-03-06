"use strict";
var command = {};
const config = require('./config/config.json');
const response = require('./responses/response.json');
const fs = require('fs');
const request = require('request');
const timeStamp = require('time-stamp');
const ytdl = require('ytdl-core');
const os = require('os');
var prefix = "~";
var queue = [];
command.ping = {
  "Name": `${prefix}ping`,
  "Useage": "Test to make sure bot is alive",
  "process": function(bot, message) {
    message.channel.send("Pong!");
  }
};
command.say = {
  "Name": `${prefix}say`,
  "Useage": "Bot will repeat your message",
  "process": function(bot, message) {
    message.channel.send(message.content.split(" ").slice(1).join(" "));
  }
};
command.coinflip = {
  "Name": `${prefix}coinflip`,
  "Useage": "Flips a coin up to 10 times",
  "process": function(bot, message) {
    let flipTimes = message.content.split(" ").slice(1).join(" ");
    if (isNaN(flipTimes)) {
      message.channel.send("I need a number");
      return;
    }
    if (flipTimes > 10 || flipTimes < 1) {
      message.channel.send("Please use a number between 1 and 10");
      return;
    }
    if (flipTimes.length === 0 || flipTimes == 1) {
      let math = Math.floor((Math.random() * 10) + 1);
      if (math >= 5) {
        message.channel.send("Heads");
      } else {
        message.channel.send("Tails");
        return;
      }
    } else if (flipTimes >= 2) {
      let i = 1;
      let result = `Results of the ${flipTimes} coin flips\n\n`;
      let a = 0;
      let b = 0;
      for (i; i <= flipTimes; i++) {
        let math = Math.floor((Math.random() * 10) + 1);
        if (math >= 5) {
          var coinResult = "Heads";
          a++;
        } else {
          var coinResult = "Tails";
          b++;
        }

        result += `${i}) ${coinResult}\n`;
      }
      message.channel.send(result + `\nTotal\nHeads: ${a}\nTails: ${b}`);
    }

  }
};
command.addcomm = {
  "Name": `${prefix}addcomm`,
  "Useage": "Adds a new command",
  "process": function(bot, message) {
    let command = message.content.split(" ").slice(1);
    let key = JSON.stringify(prefix+command[0]);
    let value = JSON.stringify(message.content.split(" ").slice(2).join(" "));
    let newCommand = key.toLowerCase() + ":" + value;
    console.log(newCommand);
    let a = JSON.stringify(response);
    a = a.substring(0, a.length - 1);
    let file = fs.createWriteStream('./responses/response.json');
    file.write(a + `\n,` + newCommand + `\n}`);
  }
};
command.weather = {
  "Name": `${prefix}weather`,
  "Useage": "Weather lookup",
  "process": function(bot, message) {
    let address = message.content.split(" ").slice(1).join("+");
    let geocodeURL = `https://maps.googleapis.com/maps/api/geocode/json?address=${address}&key=${config.geocodeToken}`;
    request(geocodeURL, function(error, response, body) {
      if (!error && response.statusCode == 200) {
        let arg = JSON.parse(body);
        if (arg.status == "ZERO_RESULTS") {
          message.channel.send("I could not find the location you entered");
          return;
        }
        let lat = arg.results[0].geometry.location.lat;
        let lon = arg.results[0].geometry.location.lng;
        let weatherURL = `https://api.darksky.net/forecast/${config.forecastIO}/${lat},${lon}`;
        request(weatherURL, function(error, response, body) {
          if (!error && response.statusCode == 200) {
            let forecast = JSON.parse(body);
            message.channel.send(
              `**Weather for today in  ${arg.results[0].address_components[1].long_name}:** ${forecast.hourly.data[0].summary}\n\n` +
              `Tempature: ${forecast.hourly.data[0].apparentTemperature} F\n` +
              `Humidity: ${forecast.hourly.data[0].humidity}\n` +
              `Wind Speed: ${forecast.hourly.data[0].windSpeed} Mph\n` +
              `Visibility: ${forecast.hourly.data[0].visibility} Miles`);
          }
        });
      }
    });
  }
};
command.imdb = {
  "Name": `${prefix}imdb`,
  "Useage": "Looks up Movie or TV show by name",
  "process": function(bot, message) {
    var args = message.content.toLowerCase().split(" ").splice(1);
    if (args[0] !== "search") {
      let media = args.join("+");
      let imbdURL = `http://www.omdbapi.com/?t=${media}&y=&plot=full&r=json`;
      request(imbdURL, function(error, response, body) {
        if (!error && response.statusCode == 200) {
          let obj = JSON.parse(body);
          if (obj.Response == "False") {
            message.channel.send("Unknown Movie or Show");
            return;
          }
          message.channel.send(`**IMDB Info**\n\n**Title:** ${obj.Title}\n**Year:** ${obj.Year}\n**Rating:** ${obj.Rated}\n**Plot:** ${obj.Plot}`);
        }
      });
    } else if (args[0] == 'search') {
      let media = message.content.split(" ").slice(2).join("+");
      if (media.length === 0) {
        message.channel.send("I need search parameters");
        return;
      }
      let imbdURL = `http://www.omdbapi.com/?s=${media}&y=&plot=full&r=json`;
      request(imbdURL, function(error, response, body) {
        if (!error && response.statusCode == 200) {
          let obj = JSON.parse(body);
          if (obj.Response == "False") {
            message.channel.send("Unknown Movie or Show");
            return;
          }
          let results = `**Showing top results from ${obj.totalResults} Results**\n\n`;
          let i = 1;
          for (i in obj.Search) {
            results += `**${parseInt(i)+1}):**  ${obj.Search[i].Title} (${obj.Search[i].Year}) IMDB ID:  ${obj.Search[i].imdbID}\n`;
            i++;
          }
          message.channel.send(results);
        } else {
          message.channel.send("No results found");
        }
      });
    }

  }
};
command.clear = {
  "Name": `${prefix}clear`,
  "Useage": "Deletes multiple messages",
  "process": function(bot, message) {
    if (message.author.id !== config.owner) {
      message.reply("You do not have permissions to run this command");
      return;
    }
    let messageCount = message.content.split(" ").slice(1);
    if (messageCount.length === 0) {
      message.channel.send("I need to know how many messages to delete");
      return;
    }
    if (isNaN(messageCount) === true) {
      message.channel.send("I need a number");
      return;
    }
    if (isNaN(messageCount) === false) {
      let time = timeStamp('YYYY:MM:DD:mm');
      fs.appendFile('./logs/messageDeletion.txt',
        `${time} Deleted ${messageCount} messages in the channel ${message.channel}` +
        `by the request of ${message.author}\n`,
        function(err) {
          if (err) {
            console.log(err);
          }
          messageCount++;
          message.channel.fetchMessages({
              limit: messageCount
            })
            .then(messages => message.channel.bulkDelete(messages));
        });
    }
  }
};
command.eval = {
  "Name": `${prefix}eval`,
  "Useage": "Runs a command",
  "process": function(bot, message) {
    if (message.author.bot) return;
    if (message.author.id !== config.owner) {
      message.reply("You do not have permissions to run this command");
      return;
    }
    if (message.author.id === config.owner) {
      const evalCommand = message.content.split(' ').slice(1).join(' ');
      message.reply(`\`\`\`${eval(evalCommand)}\`\`\``);
    }
  }
};
command.showcommands = {
  "Name": `${prefix}showcommands`,
  "Useage": "shows all the custom added commands",
  "process": function(bot, message) {
    let i;
    for (i in response) {
      var list;
      list += `\n${i} : ${response[i]}`;
      i++;
    }
    message.channel.send("```" + `${list}` + "```");
  }
};
command.music = {
  "Name": `${prefix}music`,
  "Useage": "Joics bot to voice channel",
  "process": function(bot, message) {
    var args = message.content.split(" ");
    var voice = message.member.voiceChannel;
    if (args[1] == 'join') {
      if (!voice) {
        message.reply("You need to be in a voice channel first");
        return;
      } else if (message.guild.voiceConnection) {
        message.channel.send("I'm already in a voice channel");
      } else {
        voice.join()
      }
    } else if (args[1] == 'leave') {
      voice.leave();
    } else if (args[1] == 'play') {
      if (!voice) {
        message.reply("You need to be in a voice channel first");
        return;
      }
      if (!message.guild.voiceConnection) {
        voice.join().then(connection => {
          let streamOptions = {
            seek: 0,
            volume: 1
          };
          let link = message.content.split(" ").slice(1);
          let stream = ytdl(`${link}`, {
            filter: 'audioonly'
          });
          let player = connection.playStream(stream, streamOptions);
          player.on('end', () => {
            message.member.voiceChannel.leave();
          });
        })
      } else {
        let streamOptions = {
          seek: 0,
          volume: 1
        };
        let link = message.content.split(" ").slice(1);
        let stream = ytdl(`${link}`, {
          filter: 'audioonly'
        });
        let player = message.guild.voiceConnection.playStream(stream, streamOptions);
        player.on('end', () => {
          message.member.voiceChannel.leave();
        });
      }

    } else if (args[1] == 'queue') {
      let i = 1;
      var currentQueue = "";
      for (i in queue) {
        currentQueue += `\n${i} )${queue[i]}`;
        i++;
      }
      message.channel.send(`Current Queue ${currentQueue}\n`);
    } else if (args[1] == "help" || args[1] === undefined) {
      message.channel.send(`**Music commands**:\n\n` +
        `${prefix}music join : Joins the bot to the same voice channel the user is in\n` +
        `${prefix}music play : Plays the requested YouTube link, ` +
        `if a song is already playing it will add it to the queue\n` +
        `${prefix}music queue : Shows the current queue\n` +
        `${prefix}music leave : Makes the bot leave the voice channel`);
    }
  }
};
command.system = {
  "Name": `${prefix}sytem`,
  "Useage": "Gets stats about the system the bot is running on",
  "process": function(bot, message) {
    if (message.author.id !== config.owner) {
      message.channel.send("You are not authorized to run this command");
      return;
    }
    let args = message.content.split(" ");
    if (args[1] == 'uptime') {
      message.channel.send(os.uptime());
    } else if (args[1] == 'hostname') {
      message.channel.send(os.hostname());
    } else if (args[1] == 'loadavg') {
      message.channel.send(os.loadavg());
    }
  }
};
command.urban = {
  "Name": `${prefix}urban`,
  "Useage": "Used this to search urban dictonary",
  "process": function(bot, message) {
    let word = message.content.split(" ").slice(1).join('+');
    request(`http://api.urbandictionary.com/v0/define?term=${word}`, function(error, response, body) {
      let result = JSON.parse(body);
      if (result.result_type == "no_results") {
        message.channel.send(`No results for "${word}"`);
        return
      }
      let reply = `Top definitions in Urban Dictonary for "${message.content.split(" ").slice(1).join(" ")}":\n\n`;
      let i;
      for (i in result.list) {
        reply += `\n${parseInt(i)+1}) ${result.list[i].definition}\n`;
        i++;
        if (i >= 3) {
          message.channel.send(reply);
          return
        }
      }
      message.channel.send(reply);
    });
  }
};
command.ronquote = {
  "Name":`${prefix}ronquote`,
  "Useage":"Grabs a Ron Swanson quote",
  "process": function(bot,message){
    request('http://ron-swanson-quotes.herokuapp.com/v2/quotes', function(error, response, body) {
      if(error){console.log(error);}
      if(!error && response.statusCode == 200){
      let quote = JSON.parse(body);
      message.channel.send(quote+" - Ron Swanson");
      }
    });
  }
};
command.xkcd = {
  "Name":`${prefix}xkcd`,
  "Useage":"Grabs todays xkcd comic, if you know the comic number add it after the xkcd command",
  "process": function(bot,message){
    let args = message.content.split(" ").slice(1);
    if(args.length === 0){
      message.channel.send(`**XKCD Commands**\n\n${prefix}xkcd today - Shows todays XKCD comic\n${prefix}xkcd random - Gets a random XKCD comic\n${prefix}xkcd comic comic_number - Gets the comic that you specify, replace "comic_number" with your comic number`);
    }else if(args[0] == "random"){
      let randomNumber = Math.floor(Math.random() * (1773 - 1 + 1)) + 1;
      request(`http://xkcd.com/${randomNumber}/info.0.json`, function(error,response,body){
        if(error){console.log(error);}
        if(!error && response.statusCode == 200){
          let comic = JSON.parse(body);
          message.channel.send(`Random Comic\n\n**Title**: ${comic.title}\n${comic.img}`);
        }
      });
    }else if (args[0] == "today"){
      request(`http://xkcd.com/info.0.json`, function(error, response, body) {
        if(error){console.log(error);}
        if(!error && response.statusCode == 200){
         let comic = JSON.parse(body);
         message.channel.send(`Random Comic\n\n**Title**: ${comic.title}\n${comic.img}`);
        }
      });
    }else if(isNaN(args[1]) == false){
      let comicNum = args[1];
        request(`http://xkcd.com/${comicNum}/info.0.json`, function(error,response,body){
        if(error){console.log(error);}
        if(response.statusCode == 404){message.channel.send("I was unable to find that comic");}
        if(!error && response.statusCode == 200){
          let comic = JSON.parse(body);
          message.channel.send(`Random Comic\n\n**Title**: ${comic.title}\n${comic.img}`);
        }
      });
    }
  }
};
module.exports = command;
