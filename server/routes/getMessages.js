var express = require('express');
var router = express.Router();

var messages = require('../messages')

router.get('/getmessages', (req, res) => {
  return res.status(200).send(messages);
});

module.exports = router;