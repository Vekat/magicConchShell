/**
 *  @file routes.js
 *  @author vitor cortez
 */

var express = require('express'),
	storage = require('node-persist');

var categorize = require('./middlewares').categorize,
	validateGroup = require('./middlewares').validateGroup,
	handlers = require('./middlewares').handlers;

exports.init = bot => {
	storage.initSync();

	var router = express.Router();

	var url = '/bot/:id/:name';

	handlers = handlers.map(handler => handler(bot));

	// handle group messages
	router.post.apply(null, [url, categorize, validateGroup].concat(handlers));

	// handle user messages
	router.post.apply(null, [url].concat(handlers));

	return router;
};
