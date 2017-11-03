/**
 *  @file routes.js
 */
const express = require('express'),
  storage = require('node-persist')

const { validate, isGroup, hasMention, handlers } = require('./middlewares')

exports.init = (bot) => {
  storage.initSync()

  const uri = '/bot/:id/:name'

  const middlewares = handlers.map((init) => init(bot))

  const router = express.Router()

  router.post(uri, validate)

  // group message middlewares
  router.post(uri, isGroup, hasMention, middlewares)

  // private message middlewares
  router.post(uri, middlewares)

  return router
}
