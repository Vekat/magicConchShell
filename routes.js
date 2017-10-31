/**
 *  @file routes.js
 */
const express = require('express'),
  storage = require('node-persist')

const categorize = require('./middlewares').categorize,
  validateGroup = require('./middlewares').validateGroup,
  handlers = require('./middlewares').handlers

exports.init = (bot) => {
  storage.initSync()

  const router = express.Router()

  const url = '/bot/:id/:name'

  handlers = handlers.map(handle => handle(bot))

  // handle group messages
  router.post.apply(router, [url, categorize, validateGroup].concat(handlers))

  // handle user messages
  router.post.apply(router, [url].concat(handlers))

  return router
}
