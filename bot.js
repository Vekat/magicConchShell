/**
 *  @file api.js
 *  @author vitor cortez
 */

var request = require('request-promise');

function Bot(apiURL) {
	this.api = apiURL;
}

Bot.prototype.init = function() {
	return request(`${this.api}/getMe`)
		.then(body => {
			if ('string' === typeof body)
				body = JSON.parse(body);

			if (body.ok) {
				this.id = body.result.id;
				this.name = body.result.first_name;
				this.username = body.result.username;
			}
		})
		.catch(err => console.error(err.stack));
};

Bot.prototype.sendAudio = function(chat_id, audio, reply_id) {
	var req = request.post(`${this.api}/sendAudio`);
	var form = req.form();

	form.append('chat_id', chat_id);
	form.append('audio', audio);
	if (reply_id)
		form.append('reply_to_message_id', reply_id);

	return req;
};

Bot.prototype.sendMessage = function(chat_id, text, reply_id) {
	return request.post({
		'url': `${this.api}/sendMessage`,
		'form': {
			'chat_id': chat_id,
			'text': text,
			'reply_to_message_id': reply_id || null
		}
	});
};

Bot.prototype.setWebhook = function(server) {
	return request.post({
		'url': `${this.api}/setWebhook`,
		'form': {
			'url': server
		}
	});
};

module.exports = Bot;
