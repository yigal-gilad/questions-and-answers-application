const express = require('express');
const app = express();
const router = express.Router();
var messages = require('../messages');
const client = require('../elastic-client');
const { celebrate, Joi, errors, Segments } = require('celebrate');
var question = require('../models/question')
app.use(errors());

// client.indices.create({
//     index: 'questions'
// }, function (err, resp, status) {
//     if (err) {
//         console.log(err);
//     }
//     else {
//         console.log("create", resp);
//     }
// });

client.count({ index: 'questions', type: 'question' }, function (err, resp, status) {
    console.log("questions:", resp);
});

// hendle user answer:
router.post('/hendleanswer', celebrate({
    [Segments.BODY]: Joi.object().keys({
        question: Joi.string().required(),
        answer: Joi.string().required()
    })
}), (req, res) => {
    if (messages.length > 20) {
        messages.splice(-1, 1);
    }
    messages.unshift(
        {
            type: "user_answer",
            payload: { question: req.body.question, answer: req.body.answer }
        }
    );
    question.findOne({ question: req.body.question }).
        then((doc) => {
            if (doc) {
                doc.answer = req.body.answer;
                doc.save().then(function () {
                    client.search({
                        index: 'questions',
                        type: 'question',
                        body: {
                            query: {
                                match: { "question": req.body.question }
                            },
                        }
                    }, function (error, response, status) {
                        if (error) {
                            console.log("search error: " + error)
                            return res.status(500).send({ isok: false })
                        }
                        else {
                            if (!response.hits.hits.length ||
                                response.hits.hits[0] !== req.body.question) {
                                client.index({
                                    index: 'questions',
                                    id: '1',
                                    type: 'question',
                                    body: {
                                        question: req.body.question,
                                    }
                                }, function (err, resp, status) {
                                    if (err) return res.status(500).send({ isok: false });
                                    return res.status(200).send({ isok: false });
                                });
                            } else {
                                return res.status(200).send({ isok: true });
                            }
                        }
                    });
                });
            } else {
                var Question = new question({
                    createdAt: new Date,
                    question: req.body.question,
                    answer: req.body.answer
                });
                Question.save().then(function () {
                    client.index({
                        index: 'questions',
                        id: '1',
                        type: 'question',
                        body: {
                            question: req.body.question,
                        }
                    }, function (err, resp, status) {
                        if (err) return res.status(500).send({ isok: false });
                        return res.status(200).send({ isok: true });
                    });
                });
            }
        });
});

module.exports = router;