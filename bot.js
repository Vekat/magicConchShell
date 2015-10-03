/**
 *  @file bot.js
 *  @author vitor cortez
 */

var request = require('request-promise');

class Bot {
  constructor(url) {
    this.api = url;
  }

  init() {
    return request(`${this.api}/getMe`)
      .then(body => {
        if ('string' === typeof body) body = JSON.parse(body);

        if (body.ok) {
          this.id = body.result.id;
          this.name = body.result.first_name;
          this.username = body.result.username;
        }
      })
      .catch(err => console.error(err.stack));
  }

  sendAudio(chat_id, audio, reply_id) {
    let req = request.post(`${this.api}/sendAudio`);
    let form = req.form();

    form.append('chat_id', chat_id);
    form.append('audio', audio);

    if (reply_id)
      form.append('reply_to_message_id', reply_id);

    return req;
  }

  sendMessage(chat_id, text, reply_id) {
    return request.post({
      'url': `${this.api}/sendMessage`,
      'form': {
        'chat_id': chat_id,
        'text': text,
        'reply_to_message_id': reply_id || null
      }
    });
  }

  setWebhook(server) {
    return request.post({
      'url': `${this.api}/setWebhook`,
      'form': {
        'url': server
      }
    });
  }
}

module.exports = Bot;
