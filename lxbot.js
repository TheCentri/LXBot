"use strict";
const config = require('./config/config.json');
const commands = require('./commands.js');
const response = require('./responses/response.json');
const Discord = require('discord.js');
const timeStamp = require('time-stamp');
const ytdl = require('ytdl-core');


const mysql = require('mysql');

var con = mysql.createConnection({
  host : "192.168.0.160",
  user : "lxbot",
  password : config.lxbot
});

var pool      =    mysql.createPool({
  connectionLimit : 100, //important
  host     : '192.168.0.160',
  user     : 'lxbot',
  password : config.lxbot,
  database : 'LXBot',
  debug    :  false
});


function handle_database(req,res) {
  
  pool.getConnection(function(err,connection){
      if (err) {
        res.json({"code" : 100, "status" : "Error in connection database"});
        return;
      }   

      console.log('connected as id ' + connection.threadId);
      
      connection.query("select * from user",function(err,rows){
          connection.release();
          if(!err) {
              res.json(rows);
          }           
      });

      connection.on('error', function(err) {      
            res.json({"code" : 100, "status" : "Error in connection database"});
            return;     
      });
});
}

const bot = new Discord.Client();
var prefix = "~";

bot.on('ready', () => {
  console.log(timeStamp('YYYY:MM:DD:mm') + " Ready");
});
bot.on('message', message => {
  if (message.author.bot) return;
  if (!message.content.startsWith('~')) return;
  let input = message.content.split(" ");
  let command = message.content.slice(1).split(" ");
  command = command[0].toLowerCase();
  if (response[input]) {
    message.channel.send(response[input]);
    return;
  }
  let cmd = commands[command];
  try {
    cmd.Name;
  } catch (e) {
    return;
  }
  if (cmd.Name) {
    cmd.process(bot, message, command);
  } else {
    return;
  }
});


bot.login(config.token);