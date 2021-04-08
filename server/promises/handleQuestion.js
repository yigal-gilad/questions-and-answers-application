var messages = require('../messages');
const client = require('../elastic-client');
const question = require('../models/question');

function handleQuestion(q) {
    return new Promise((resolve, reject) => {
        if (!q) return resolve();
        if (messages.length > 20) {
            messages.splice(-1, 1);
        }
        messages.unshift({
            type: "user_question", payload: {
                question: q
            }
        });

        client.search({
            index: 'questions',
            type: 'question',
            body: {
                query: {
                    match: { "question": q }
                },
            }
        }, function (error, response, status) {
            if (error) {
                console.log("search error: " + error)
                return resolve();
            }
            else {
                if (!response.hits.hits.length) return resolve();
                question.findOne({ question: response.hits.hits[0]._source.question }).
                    then((doc) => {
                        if (doc) {
                            if (messages.length > 20) {
                                messages.splice(-1, 1);
                            }
                            messages.unshift({
                                type: "bot_answer", payload: {
                                    question: doc.question,
                                    answer: doc.answer
                                }
                            });
                        }
                        return resolve();
                    })
            }
        });
    });
}
module.exports = handleQuestion;