const express = require('express');
const app = express();
const router = express.Router();
var messages = require('../messages');
const client = require('../elastic-client');
const question = require('../models/question')
const { celebrate, Joi, errors, Segments } = require('celebrate');
app.use(errors());

// hendle user question:
router.post('/hendlequestion', celebrate({
    [Segments.BODY]: Joi.object().keys({
        question: Joi.string().required(),
    })
}), (req, res) => {
    if (messages.length > 20) {
        messages.splice(-1, 1);
    }
    messages.unshift({
        type: "user_question", payload: {
            question: req.body.question
        }
    });

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
            res.status(500).send({ isok: false })
        }
        else {
            if (!response.hits.hits.length) return res.status(200).send({ isok: true })
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
                    return res.status(200).send({ isok: true })
                })
        }
    });
});

module.exports = router;