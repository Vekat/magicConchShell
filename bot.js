/**
 *  @file Exports the Bot class
 *  @author vitor cortez
 */

var request = require('request-promise')

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
      .catch(err => console.error(err.stack))
  }

  /**
   * Sends a sound file to chat.
   * @param {string} chat_id - Chat identifier
   * @param {string|Audio} audio - Audio file or identifier of existing file
   * @param {string} [reply_id] - User identifier to address reply
   */
  sendAudio(chat_id, audio, reply_id) {
    let req = request.post(`${this.api}/sendVoice`)
    let form = req.form()

    form.append('chat_id', chat_id)
    form.append('voice', audio)

    if (reply_id)
      form.append('reply_to_message_id', reply_id)

    return req
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
        'allowed_updates': ['message', 'edited_message']
      }
    })
  }
}

module.exports = Bot
