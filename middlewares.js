/**
 *  @file middlewares.js
 */
const fs = require('fs'),
  path = require('path')

const storage = require('node-persist')

const randomInt = require('./helpers').randomInt
const logger = require('./logger')

const answers = ['no', 'yes', 'maybe', 'again', 'dont']

const getAnswer = () => answers[randomInt(0, answers.length)]

exports.categorize = (req, res, next) => {
  if (!req.body.message) {
    return next(':message')
  } else if (!req.body.message.text) {
    return next(':text')
  } else if (req.body.message.chat.type == 'private') {
    return next('route')
  }

  next()
}

exports.validateGroup = (req, res, next) => {
  let name = `@${req.params.name.toLowerCase()}`
  let message = req.body.message.text.toLowerCase()

  if (message.indexOf(name) === -1) {
    return next(':mention')
  }

  next()
}

const handleStart = (bot) => {
  return function(req, res, next) {
    let m = req.body.message

    if (m.text.indexOf('/start') === -1) {
      return next()
    }

    let answer, audio, upload

    let chatId = m.chat.id, messageId = m.message_id

    answer = 'greetings'
    audio = storage.getItemSync(answer)

    if (audio == void 0) {
      upload = true
      audio = fs.createReadStream(
        path.join(__dirname, './media', `${answer}.ogg`)
      )
    }

    bot.sendAudio(chatId, audio, messageId, answer)
      .then(body => {
        if (upload) {
          body = JSON.parse(body)
          if (body.result.voice.file_id != void 0)
            storage.setItemSync(answer, body.result.voice.file_id)
        }
        return next(answer)
      }).catch(next)
  }
}

const handleHelp = (bot) => {
  return function(req, res, next) {
    let m = req.body.message

    if (m.text.indexOf('/help') === -1) {
      return next()
    }

    let message = [
      "To send a question to the Magic Conch Shell, use a question mark '?' in your message.\n",
      "If you are in a group, use '@magicConchShellBot' in your messages.\n",
      "The answers only make sense if you send a Yes/No question.\n",
      "Want to rate or review this bot? You can do it here:",
      "telegram.me/storebot?start=magicconchshellbot"
    ].join('\n')

    let chatId = m.chat.id,
      text = m.text

    bot.sendMessage(chatId, message)
      .then((_) => next('help'))
      .catch(next)
  }
}

const handleQuestion = (bot) => {
  return function(req, res, next) {
    let m = req.body.message

    if (m.text.indexOf('?') === -1) {
      return next()
    }

    let answer, audio, upload

    let chatId = m.chat.id, messageId = m.message_id

    answer = getAnswer()
    audio = storage.getItemSync(answer)

    if (audio == void 0) {
      upload = true
      audio = fs.createReadStream(
        path.join(__dirname, './media', `${answer}.ogg`)
      )
    }

    bot.sendAudio(chatId, audio, messageId, answer)
      .then(body => {
        if (upload) {
          body = JSON.parse(body)
          if (body.result.voice.file_id != void 0)
            storage.setItemSync(answer, body.result.voice.file_id)
        }
        return next(answer)
      }).catch(next)
  }
}

const handleDefault = (bot) => {
  return function(req, res) {
    let m = req.body.message
    let answer = 'question', upload, audio

    let chatId = m.chat.id, messageId = m.message_id

    audio = storage.getItemSync(answer)

    if (audio == void 0) {
      upload = true
      audio = fs.createReadStream(
        path.join(__dirname, './media', `${answer}.ogg`)
      )
    }

    bot.sendAudio(chatId, audio, messageId)
      .then(body => {
        if (upload) {
          body = JSON.parse(body)
          if (body.result.voice.file_id != void 0)
            storage.setItemSync(answer, body.result.voice.file_id)
        }
        return next(answer)
      }).catch(next)
  }
}

exports.debugLogger = function(err, req, res, next) {
  if (typeof err == 'string') {
    const m = req.body.message

    const meta = {
      question: m.text,
      answer: err,
      type: m.chat.type,
      by: m.chat.username || m.chat.first_name
    }

    if (m.chat.type != 'private') meta['title'] = m.chat.title

    const msg = Object.entries(meta).map(([k, v]) => `[${k}:${v}]`).join(' ')

    logger.debug(msg)

    res.status(200).send(err)
  } else {
    next(err)
  }
}

exports.handlers = [handleStart, handleHelp, handleQuestion, handleDefault]
