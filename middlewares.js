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
      "To question the Magic Conch Shell, do not forget to type a question mark `?` in your message. The /ask command is not required in private chats.\n",
      "Inside group chats, the Magic Conch will not see any messages by default. So, you will need to type `/ask@magicConchShellBot` in your messages.\n",
      "However, if the Magic Conch has **admin** rights, she will see all messages and only respond to those mentioning her @magicConchShellBot.\n",
      "If you do not want the Magic Conch to see all your group messages, remove her **admin** status.\n",
      "To get updates about the Magic Conch, visit the official updates channel: telegram.me/magicconch\n",
      "The answers only make sense if you send a `Yes` or `No` type of question.\n",
      "To rate or review this bot, use the storebot link:",
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
  return function(req, res, next) {
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
      from: m.from.username || m.from.first_name
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
