const request = require("request-promise");

// Grabs list of questions
async function fetchListOfQuestions() {
    var options = {
        uri: 'https://leetcode.com/api/problems/algorithms/',
        transform: function (body) {
            return JSON.parse(body).stat_status_pairs;
        }
    };
    return await request(options);
}

// Retrieve CurrentQuestion
async function getQuestionIndex(databaseRef, userid) {
    var snapshotValue = await databaseRef.once("value");
    snapshotValue = snapshotValue.val();
    try {
        return snapshotValue[userid.replace('#','_')];
    }
    catch(error) {
        return undefined;
    }
}

// Submit Question
function submitQuestion(databaseRef, userid, data) {
    databaseRef.child(userid.replace('#','_')).set(data);
}


module.exports = {
    fetchListOfQuestions,
    submitQuestion,
    getQuestionIndex
}