#!/bin/env node

/**
 * @file Creates a Bot object and starts the server.
 */

const express = require('express'),
  logger = require('morgan'),
  parser = require('body-parser')

const Bot = require('./bot'),
  routes = require('./routes')

const app = express()

app.set('port', process.env.PORT || 5000)

const botURL = `${process.env.HOST}/bot`
const token = process.env.TELEGRAM_API_TOKEN
const apiURL = `${process.env.TELEGRAM_API_URL}/bot${token}`

const bot = new Bot(apiURL)

app.use(logger('dev'))

app.get('/', (req, res) => res.status(200).send('bot is up and running'))

app.use(parser.json())

// attach bot middlewares
app.use(routes.init(bot))

// handle errors
app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(err.status || 500).send(err.message)
})

// initialize bot and start server
bot.init().then(() => {
  app.listen(app.get('port'), () => {
    console.info(`listening on port ${app.get('port')}`)

    bot.setWebhook(`${botURL}/${bot.id}/${bot.username}`)
      .then(() => { console.info('webhook done') })
      .catch(err => { console.error('webhook error', err.message) })
  })
})
