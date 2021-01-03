// Dependencies
const Discord = require('discord.js');
var admin = require("firebase-admin");

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
let easyQuestions = [];
let mediumQuestions = [];
let hardQuestions = [];

// ############ Bot Configuration ############
client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);
});

client.on('message', async msg => {
  await LeetcodeProblemRetrievalHandler(msg)

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
        easyQuestions.push(listOfQuestions[i]);
      }
      if(listOfQuestions[i].difficulty.level === 2) {
        mediumQuestions.push(listOfQuestions[i]);
      }
      if(listOfQuestions[i].difficulty.level === 3) {
        hardQuestions.push(listOfQuestions[i]);
      }
    }
  }
}

async function LeetcodeProblemRetrievalHandler(msg) {
  let resultString = msg.content;
  // Get Problem Command
  if (resultString.includes("!getProblem")) {
    var questionIndex = await getQuestionIndex(databaseRef, msg.member.user.tag);
  
    // Processing status if none exists
    if(questionIndex === undefined) {
      questionIndex = {};
      questionIndex['easyIndex'] = 0;
      questionIndex['mediumIndex'] = 0;
      questionIndex['hardIndex'] = 0;
      submitQuestion(databaseRef, msg.member.user.tag.toString(), questionIndex)
    }

    if(resultString.includes("-difficulty")) {
      if(resultString.includes('easy')) {
        msg.reply(problemLink + easyQuestions[questionIndex['easyIndex']].stat.question__title_slug);
      }
      else if(resultString.includes('medium')) {
        msg.reply(problemLink + mediumQuestions[questionIndex['mediumIndex']].stat.question__title_slug);
      }
      else if(resultString.includes('hard')) {
        console.log(questionIndex['hardIndex']);
        msg.reply(problemLink + hardQuestions[questionIndex['hardIndex']].stat.question__title_slug);
      }
    }
  }
}
