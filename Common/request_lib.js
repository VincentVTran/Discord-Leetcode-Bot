const https = require('https');

// Grabs list of questions
function fetchListOfQuestions() {
    let listOfQuestions = '';
    https.get('https://leetcode.com/api/problems/algorithms/', (resp) => {
        // A chunk of data has been recieved.
        resp.on('data', (chunk) => {
        listOfQuestions += chunk;
        });
    
        // The whole response has been received. Print out the result.
        resp.on('end', () => {
            listOfQuestions = JSON.parse(listOfQuestions).stat_status_pairs;
            return listOfQuestions;
        });
    }).on("error", (err) => {
      console.log("Error: " + err.message);
    });
}

module.exports = {
    fetchListOfQuestions
}