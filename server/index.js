const express = require('express');
const app = express();
const http = require('http');
// const debug = require('debug')()
const helmet = require('helmet');
const clc = require("cli-color");
const mongoose = require('mongoose');
const server = http.Server(app);
const socketIO = require('socket.io');
const io = socketIO(server);
const bodyParser = require("body-parser");
const env = require('./readenv');
const Ddos = require('ddos');
const ddos = new Ddos({ burst: parseInt(env.ddos_burst), limit: parseInt(env.ddos_limit) });
const port = env.port || 3000;
const path = require('path');
const client = require('./elastic-client')

if (env.node_env !== "production") {
  app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers",
      "Origin, X-Requested-With, Content-Type, Accept");
    next();
  });
  app.use(require('express-request-response-logger')());
}

app.use(ddos.express)
app.use(require('sanitize').middleware);
app.use(helmet())
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '50mb' }));
app.use(express.static(path.join(__dirname, 'dist/node_modules')));
app.use(express.static(path.join(__dirname, 'dist')));
console.log(path.join(__dirname, 'dist'));

// connect db
mongoose.connect(env.dbUrl, { useNewUrlParser: true, useUnifiedTopology: true })
mongoose.connection.once('open', function () {
  console.log(clc.bgGreen("the database is connected!"))
}).on('error', function () {
  console.log(clc.bgRed.blue("DB connection error!"));
});

// ping to elastic server
client.ping({
  requestTimeout: 30000,
}, function(error) {
  if (error) {
      console.error('elasticsearch cluster is down!', error);
  } else {
      console.log(clc.cyan('connected to elastic server'));
  }
});

// routes:
const getMessages = require('./routes/getMessages');
const hendleQuestion = require('./routes/hendleQuestion');
const hendleAnswer = require('./routes/hendleAnswer')


app.use(getMessages);
app.use(hendleQuestion);
app.use(hendleAnswer);

// start server
server.listen(port, () => {
  console.log('started on port: ' + clc.cyan.bold(port));
});

