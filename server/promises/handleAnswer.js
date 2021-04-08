var messages = require('../messages');
const client = require('../elastic-client');
const question = require('../models/question');

function handleAnswer(q, a) {
    return new Promise((resolve, reject) => {
        if (!q || !a) return resolve();
        if (messages.length > 20) {
            messages.splice(-1, 1);
        }
        messages.unshift(
            {
                type: "user_answer",
                payload: { question: q, answer: a }
            }
        );
        question.findOne({ question: q }).
            then((doc) => {
                if (doc) {
                    doc.answer = a;
                    doc.save().then(function () {
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
                                if (!response.hits.hits.length ||
                                    response.hits.hits[0] !== q) {
                                    client.index({
                                        index: 'questions',
                                        id: '1',
                                        type: 'question',
                                        body: {
                                            question: q,
                                        }
                                    }, function (err, resp, status) {
                                        if (err) return resolve();
                                        return resolve();
                                    });
                                } else {
                                    return resolve();
                                }
                            }
                        });
                    });
                } else {
                    var Question = new question({
                        createdAt: new Date,
                        question: q,
                        answer: a
                    });
                    Question.save().then(function () {
                        client.index({
                            index: 'questions',
                            id: '1',
                            type: 'question',
                            body: {
                                question: q,
                            }
                        }, function (err, resp, status) {
                            if (err) return resolve();
                            return resolve();
                        });
                    });
                }
            });
    });
}

module.exports = handleAnswer;