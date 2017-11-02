#!/bin/env node

/**
 * @file Creates a Bot object and starts the server.
 */
const express = require('express'),
  morgan = require('morgan'),
  parser = require('body-parser')

const logger = require('./logger')

const Bot = require('./bot'),
  routes = require('./routes')

const debugLogger = require('./middlewares').debugLogger,
  exceptionBuilder = require('./middlewares').exceptionBuilder,
  errorHandler = require('./middlewares').errorHandler

const app = express()

app.set('port', process.env.PORT || 5000)

const botURL = `${process.env.HOST}/bot`
const token = process.env.TELEGRAM_API_TOKEN
const apiURL = `${process.env.TELEGRAM_API_URL}/bot${token}`

const bot = new Bot(apiURL)

// only add debug logs in 'development' mode
if (process.env.NODE_ENV == 'development') {
  app.use(morgan('dev', {
    skip: (req, res) => (res.statusCode < 400),
    stream: process.stderr
  }))

  app.use(morgan('dev', {
    skip: (req, res) => (res.statusCode >= 400),
    stream: process.stdout
  }))
}

app.get('/', (req, res) => res.status(200).send('bot is up and running'))

app.use(parser.json())

// attach bot middlewares
app.use(routes.init(bot))

// handle errors
app.use(exceptionBuilder)
app.use(debugLogger)
app.use(errorHandler)

// initialize bot and start server
bot.init().then(() => {
  app.listen(app.get('port'), () => {
    logger.info(`listening on port ${app.get('port')}`)

    bot.setWebhook(`${botURL}/${bot.id}/${bot.username}`)
      .then(() => { logger.info('webhook set') })
      .catch((err) => { logger.error(`webhook fail: ${err.message}`) })
  })
})
