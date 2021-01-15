// Dependencies
const Discord = require('discord.js');
var admin = require("firebase-admin");
var cron = require('cron');;

// External Library Imports
const { getRandomInt } = require('./Common/calculation_lib');
const { fetchListOfQuestions, submitQuestion, getQuestionIndex } = require('./Common/request_lib');
const credentials = require("./Asset/credentials.json");

// Discord Objects
const client = new Discord.Client();

// Firebase Objects
var databaseRef;

// Leetcode Questions
const problemLink = 'https://leetcode.com/problems/';
let listOfQuestions = [];
let freeQuestions = [];
let easyQuestions = [];
let mediumQuestions = [];
let hardQuestions = [];

var cronJob;

// ############ Bot Configuration ############
client.on('ready', async () => {
  console.log(`Logged in as ${client.user.tag}!`);
  await setDailyLeetcode();
});

client.on('message', async msg => {
  // await LeetcodeProblemRetrievalHandler(msg)
  // await LeetcodeSubmittion(msg);
  // Submit problem
});

launchBot();
client.login(credentials['discord-credentials'].token);
function launchBot() {
  // Initializing firebase
  admin.initializeApp({
    credential: admin.credential.cert(credentials['firebase-credentials']),
    databaseURL: "https://leetcode-bot-2ef27-default-rtdb.firebaseio.com/"
  });

  var db = admin.database();
  databaseRef = db.ref("leetcodeBot");

  fetchListOfQuestions().then( result => {
    listOfQuestions = result;
    sortQuestions();
  });
}

function sortQuestions() {
  // Sorting questions
  for(var i = 0;i<listOfQuestions.length;i++) {
    if(listOfQuestions[i].paid_only === false) {
      if(listOfQuestions[i].difficulty.level === 1) {
        easyQuestions.unshift(listOfQuestions[i]);
      }
      if(listOfQuestions[i].difficulty.level === 2) {
        mediumQuestions.unshift(listOfQuestions[i]);
      }
      if(listOfQuestions[i].difficulty.level === 3) {
        hardQuestions.unshift(listOfQuestions[i]);
      }
      freeQuestions.unshift(listOfQuestions[i]);
    }
  }
}


// ######################### Discord Bot Event Handler #########################
async function setDailyLeetcode() {
  var leetcodeChannel;

  client.channels.cache.forEach(channel => {
    if(channel.name === "leetcode") {
      leetcodeChannel = channel;
    }
  });

  cronJob = cron.job("13 15 * * *", async function(){
    var questionIndex = await getQuestionIndex(databaseRef, client.user.tag);
    // Processing status if none exists
    if(questionIndex === undefined) {
      questionIndex = {};
      questionIndex['currentIndex'] = 0;
      questionIndex['channelID'] = 0;
    }

    leetcodeChannel.send("Here is your daily leetcode problem: " + problemLink + freeQuestions[questionIndex['currentIndex']].stat.question__title_slug);
    questionIndex['currentIndex'] = questionIndex['currentIndex']+1;
    if(questionIndex['currentIndex'] >= freeQuestions.length) {
      questionIndex['currentIndex'] = 0;
    }
    submitQuestion(databaseRef, client.user.tag, questionIndex);
  }, undefined, true, "America/Chicago");

  cronJob.start();
  leetcodeChannel.send("Leetcode Bot will send a daily challenge problem every day at 10:00 A.M. CST");
}

async function LeetcodeProblemRetrievalHandler(msg) {
  let resultString = msg.content;

  if (resultString.includes("!getProblem")) {
    var questionIndex = await getQuestionIndex(databaseRef, msg.member.user.tag);
  
    // Processing status if none exists
    if(questionIndex === undefined) {
      questionIndex = {};
      questionIndex['easyIndex'] = 0;
      questionIndex['mediumIndex'] = 0;
      questionIndex['hardIndex'] = 0;
      questionIndex['lastAskedDifficulty'] = 0;
    }

    if(resultString.includes("-difficulty")) {
      if(resultString.includes('easy')) {
        questionIndex['lastAskedDifficulty'] = 0;
        msg.reply("Here is your leetcode hard problem. Once you have completed it, use the command !submit '''[paste code here]''': " + problemLink + easyQuestions[questionIndex['easyIndex']].stat.question__title_slug);
      }
      else if(resultString.includes('medium')) {
        questionIndex['lastAskedDifficulty'] = 1;
        msg.reply("Here is your leetcode hard problem. Once you have completed it, use the command !submit '''[paste code here]''': " + problemLink + mediumQuestions[questionIndex['mediumIndex']].stat.question__title_slug);
      }
      else if(resultString.includes('hard')) {
        questionIndex['lastAskedDifficulty'] = 2;
        msg.reply("Here is your leetcode hard problem. Once you have completed it, use the command !submit '''[paste code here]''': " + problemLink + hardQuestions[questionIndex['hardIndex']].stat.question__title_slug);
      }
    }
    submitQuestion(databaseRef, msg.member.user.tag.toString(), questionIndex)
  }
}

async function LeetcodeSubmittion(msg) {
  let resultString = msg.content.toString();
  if (resultString.substring(0,7) == "!submit") {
    msg.delete();
    var questionIndex = await getQuestionIndex(databaseRef, msg.member.user.tag);
    if(questionIndex === undefined) {
      msg.reply("You have not asked for a question yet");
      return;
    }
    const code = resultString.substring("8", resultString.length);
    const formattedCode = resultString.substring("8", resultString.length).replace(/`/g," ");
    var lastQuestion = {};
    switch(questionIndex['lastAskedDifficulty']) {
      case 0: {
        lastQuestion = easyQuestions[questionIndex['easyIndex']];
        break;
      }
      case 1: {
        lastQuestion = mediumQuestions[questionIndex['mediumIndex']];
        break;
      }
      case 2: {
        lastQuestion = hardQuestions[questionIndex['hardIndex']];
        break;
      }
    }

    msg.reply("Submitted code to leetcode problem " + problemLink + lastQuestion.stat.question__title_slug + ": " + code);
  }
}
