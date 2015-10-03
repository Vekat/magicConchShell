#!/bin/env node

var express = require('express'),
  logger = require('morgan'),
  parser = require('body-parser');

var Bot = require('./bot'),
  routes = require('./routes');

var app = express();

app.set('port', process.env.OPENSHIFT_NODEJS_PORT);
app.set('host', process.env.OPENSHIFT_NODEJS_IP);

const token = process.env.TELEGRAM_API_TOKEN;
const botURL = `${process.env.OPENSHIFT_APP_DNS}/bot`;
const apiURL = `${process.env.TELEGRAM_BOT_DNS}/bot${token}`;

var bot = new Bot(apiURL);

if (process.env.NODE_ENV == 'debug')
  app.use(logger('dev'));

app.get('/', (req, res) => {
  return res.status(200).send('Bot is up and running!');
});

app.use(parser.json());

// attach bot middlewares
app.use(routes.init(bot));

// handle errors
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).send(err.message);
});

// init bot and start server
bot.init().then(() => {
  app.listen(app.get('port'), app.get('host'), function() {
    console.info(`Online: http://${app.get('host')}:${app.get('port')}`);

    bot.setWebhook(`${botURL}/${bot.id}/${bot.username}`)
      .then(() => {
        console.log('webhook set');
      })
      .catch(err => {
        console.error('webhook error', err.message);
      });
  });
});
