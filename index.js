const Discord = require('discord.js');
const { getRandomInt } = require('./Common/calculation_lib');
const { fetchListOfQuestions } = require('./Common/request_lib');
const credentials = require("./Asset/credentials.json");
const client = new Discord.Client();


let listOfQuestions = fetchListOfQuestions();
console.log(listOfQuestions)
client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);
});

client.on('message', msg => {
  if (msg.content.includes('!getProblem')) {
    if(msg.content.includes('!getProblem')) {
      Math.random()
    }
    msg.reply('Pong!');
  }
});



client.login(credentials.discord_token);