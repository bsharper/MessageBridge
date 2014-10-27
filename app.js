var express = require('express');
var app = express();
var port = 3000;
var io = require('socket.io').listen(app.listen(port));
var chat = require('./chatReader').chat;
var sendMessage = require('./chatSender').sendMessage;

app.use(express.static(__dirname + '/public'));

app.get('/', function (req, res) {
  res.sendFile(__dirname + '/public/index.html');
});

app.get('/attachment/:id', function (req, res) {
	chat.getAttachmentPath(req.params.id, function (dt) {
		res.sendFile(dt.path);
	});
});

function chatUpdateTrigger(chat_ids) {
	var chats = {};
	console.log('chatUpdate');
	for (var i=0; i<chat_ids.length; i++) {
		chat.checkChatUpdates(chat_ids[i], function (chat_id, msgs) {
			io.sockets.emit('updateChatData', {chat_id: chat_id, data: msgs});
		});
	}
}
chat.chatUpdateTrigger = chatUpdateTrigger;
chat.openChatDatabase(function (dbPath, e) {
	console.log('Database opened: ' + dbPath);
});



io.sockets.on('connection', function (socket) {
	var current_chat_id = 0;
	socket.on('getChatId', function (fn) {
		console.log(current_chat_id);
		fn(current_chat_id);
	});
	socket.on('getMessageCount', function (fn) {
		chat.getMessageCount(fn);
	});
	socket.on('getChatMessageCounts', function (fn) {
		chat.getChatMessageCounts(fn);
	});

	socket.on('getAllChat', function (fn) {
		chat.getAllChats(fn);
	});
	socket.on('getChat', function (chat_id, fn) {
		current_chat_id = chat_id;
		chat.getChat(chat_id, fn);
	});
	socket.on('getContactValues', function (fn) {
		fn(chat.getContactValues.apply(chat));
	});
	
	socket.on('getChatUpdates', function (chat_id, fn) {
		if (arguments.length == 1) {
			fn = chat_id;
			chat_id = current_chat_id;
			console.log(chat_id);
		}
		chat.checkChatUpdates(chat_id, fn);
	});
	socket.on('sendMessage', function (data) {
		sendMessage(data.text, data.guid);
	});

});