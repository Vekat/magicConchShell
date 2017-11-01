/**
 *  @file Exports the Bot class
 */
const request = require('request-promise')

const logger = require('./logger')

const caption = {
  "yes": "Yes",
  "no": "No",
  "again": "Try asking again",
  "dont": "I don't think so",
  "maybe": "Maybe someday",
  "greetings": "Greetings"
}

/**
 * The Bot object interacts with the Telegram API.
 * @class
 * @requires module:request/request-promise
 */
class Bot {
  /**
   * Creates an instance of Bot.
   * @param {string} url - The API address to which this Bot will send requests
   */
  constructor(url) {
    this.api = url
  }

  /**
   * Requests additional data about this Bot.
   * @returns {Promise}
   */
  init() {
    return request(`${this.api}/getMe`)
      .then(body => {
        if ('string' === typeof body) body = JSON.parse(body)

        if (body.ok) {
          this.id = body.result.id
          this.name = body.result.first_name
          this.username = body.result.username
        }
      })
      .catch(err => logger.error(err.stack))
  }

  /**
   * Sends a sound file to chat.
   * @param {string} chat_id - Chat identifier
   * @param {string|Audio} audio - Audio file or identifier of existing file
   * @param {string} [reply_id] - User identifier to address reply
   * @param {string} [type] - Answer type for captioning
   */
  sendAudio(chat_id, audio, reply_id, type) {
    const formType = (typeof audio == 'string') ? 'form' : 'formData'

    let options = {
      'url': `${this.api}/sendVoice`,
      [formType]: {
        'chat_id': chat_id,
        'disable_notification': true,
        'voice': audio
      }
    }

    if (reply_id) {
      options[formType] = Object.assign(options[formType], {'reply_to_message_id': reply_id})
    }

    if (type && caption[type]) {
      options[formType] = Object.assign(options[formType], {'caption': caption[type]})
    }

    return request.post(options)
  }

  /**
   * Sends a text message to chat.
   * @param {string} chat_id - Chat identifier
   * @param {string} text - Message to send
   * @param {string} [reply_id] - User identifier to address reply
   */
  sendMessage(chat_id, text, reply_id) {
    return request.post({
      'url': `${this.api}/sendMessage`,
      'form': {
        'chat_id': chat_id,
        'text': text,
        'parse_mode': 'Markdown',
        'reply_to_message_id': reply_id || null
      }
    })
  }

  /**
   * Sets an HTTP address to receive messages addressed to this Bot.
   * @param {string} server - HTTP address of the Bot
   */
  setWebhook(server) {
    return request.post({
      'url': `${this.api}/setWebhook`,
      'form': {
        'url': server,
        'allowed_updates': ['message']
      }
    })
  }
}

module.exports = Bot
