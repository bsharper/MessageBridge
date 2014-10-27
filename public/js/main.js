var timezoneOffset = 6;
var whoami = "Me";
var contacts =[];

moment.locale('en', {
    calendar : {
        lastDay : '[Yesterday]',
        sameDay : 'LT',
        nextDay : '[Tomorrow] [at] LT',
        lastWeek : 'L',
        nextWeek : 'dddd [at] LT',
        sameElse : 'L'
    }
});
emoji.use_sheet = true;
emoji.sheet_path = "/img/sheet_64.png";


var spinner = '<div class="spinner"><div class="bounce1"></div><div class="bounce2"></div><div class="bounce3"></div></div>';

var messageList = new function () {
	var self = this;
	this.currentChat = [];
	this.chat_id = null;
	this.messageTemplate = "<div [STYLE] class='msg [CLASS]' data-message-id='[MESSAGE_ID]'>[INFO]<br>[MESSAGE]</div>";
	this.imageObjectCount = 0;
	this.imagesLoadedNum = 0;
	this.updateChatData = function (dt) {
		var self = this;
		var cid = dt.chat_id;
		var msg = dt.data;

		console.log(cid, this.chat_id);
		if (self.chat_id != cid) return;
		var txt = "";
		for (var i=0; i<msg.length; i++) {
			txt += self.renderMessage(msg[i]);
		}
		$(".msg-pending").remove();
		$(".msg").last().after(txt);
		$(".msg").last().velocity('scroll', {duration:200});
		$(".msg").linkify({target:"_blank"}); 


	}

	this.imageLoaded = function () {
		self.imagesLoadedNum++;
		if (self.imagesLoadedNum == self.imageObjectCount) self.renderDone();
	}
	this.addLightbox = function () {
		$(".attachment-image-link").addClass('fancybox.image');
		$(".attachment-image-link").fancybox({
			openEffect	: 'elastic', 
			closeEffect	: 'elastic'
		});
	}

	this.renderAttachment = function (m) {
		var msg = "";
		var mt = m.mime_type.toLowerCase();

		function renderVideo() {
			if (mt.indexOf("quicktime") > -1) mt = "video/mp4";
			return "<video controls><source src='/attachment/" + m.attachment_id + "' type='" + mt+"' ></video>";
		}
		function renderImage() {
			//return "<img onload='imageLoaded()' class='attachment-image' src='/attachment/" + m.attachment_id + "'/>";
			var imgPath = "/attachment/" + m.attachment_id;
			self.imageObjectCount++;
			return "<div class='attachment-image-wrapper'><a href='"+imgPath+"' rel='group' class='attachment-link attachment-image-link'><img onload='messageList.imageLoaded()' class='attachment-image' src='"+imgPath+"'/></a></div>";
		}

		if (mt.indexOf("video") >-1) msg = renderVideo();
		else if (mt.indexOf("image") > -1) msg = renderImage();

		msg = "<div class='msg-media'>" + msg + "</div>";
		if (m.text != null) msg += "<br><span class='msg-text'>" + m.text + "</span>";
		
		return msg;
	}

	this.renderMessage = function(m, style) {
		style = style ||"";
		var cls = "";
		var hasImage = false;
		
		if (m.is_from_me == 1) cls = 'msg-right';
		else cls = 'msg-left';

		if (m.service_name == "SMS") cls += " msg-sms";
		
		var msg = m.text.replace(/(\n|\r)/g, '<br>\n').replace(/&nbsp;/g, '');
		msg = emoji.replace_unified(msg);

		var ts = new Date(m.date*1000);
		var mmt = moment(ts).subtract(timezoneOffset, 'hours').format('MMMM Do YYYY, h:mm:ss a');
		var who_from = (m.is_from_me == 0 ? m.lookupValue : whoami);
		var info = "<span class='msg-sender'>"+ who_from + "</span> <span class='msg-timestamp'>" + mmt+ "</span>";
		
		if (m.attachment_id != null) msg = self.renderAttachment(m);
		var fullMsg = self.messageTemplate.replace('[STYLE]', style).replace('[CLASS]', cls).replace('[INFO]', info).replace('[MESSAGE]', msg).replace('[MESSAGE_ID]', m.message_id);
		return fullMsg;
	}
	this.renderDone = function () {}

	this._renderDone = function () {
		setTimeout(function () {
			$("#loading").velocity({ opacity: 0 }, {
				duration:100,
				complete: function () {
					$("#chatView").velocity({ opacity: 1 }, {duration:200});
				}
			});
			
		}, 200);
		
		setTimeout(function () {
			location.hash = "#bottom"; 
			$(".msg").linkify({target:"_blank"}); 
		}, 300);
		
		//$(".msg").last().velocity('scroll', {duration:100}).velocity('scroll', {duration:100});
		self.addLightbox();
		
	}
	this.renderMessages = function (msgs) {
		self.currentChat = msgs;
		self.imageObjectCount = 0;
		self.imagesLoadedNum = 0;
		location.hash ="";
		var hdr = $(".uChatList li.active div").html();
		$("#messageHeader").html(hdr);
		$("#loading").html(spinner).velocity({ opacity: 1 }, {duration:0});
		$("#chatView").html("").velocity({ opacity: 0 }, {duration:0});
		var txt = "";
		for (var i=0; i<msgs.length; i++) {
			var msg = msgs[i];
			txt += self.renderMessage(msg);
			
		}
		txt += "<a class='bottom-anchor' name='bottom'>";
		self.renderDone = _.once(self._renderDone);
		setTimeout(function () { self.renderDone(); }, Math.min(500,msgs.length*2));
		$("#chatView").html(txt);
		
		
	}

}

var chatList = new function () {
	var self = this;

	this.renderChatListItem = function (m, obj) {
		if (m.people.length > 2 && obj.lookupValue.indexOf(" ") > -1) obj.lookupValue = obj.lookupValue.split(' ')[0]; 
		var people = "<span class='chat-person' data-original-value='"+obj.value+"'>"+obj.lookupValue+"</span>";
		return people;
	}
	this.renderTimestamp = function (m) {
		var ts = new Date(m.lastUpdate*1000);
		var mmt = moment(ts).subtract(timezoneOffset, 'hours').calendar();
		var timestamp = "<span class='chat-timestamp'>" + mmt + "</span>";
		return timestamp;
	}
	this.addChatListHanders = function () {
		var lis = $(".uChatList li");
		lis.click(function () {
			$(".uChatList li.active").removeClass('active');
			$(this).addClass('active');
			var chat_id = $(this).find('[data-chat-id]').data('chat-id');
			messageList.chat_id = chat_id;
			socket.emit('getChat', chat_id, messageList.renderMessages)
		})
	}
	this.renderChatList = function (ar) {
		$(".uChatList").html("");
		var chats = [];
		for (var i=0;i<ar.length; i++) {
			var m = ar[i];
			var people = m.people.sort(function (a,b) { 
				return  a.lookupValue.localeCompare(b.lookupValue);
			});
	
			var chat = people.map(function(obj) { return self.renderChatListItem(m, obj) } ).join(", ");
			var txt = "<div data-guid='"+m.guid+"'data-chat-id='"+m.chat_id + "' class='chat-list-item'>" + chat + self.renderTimestamp(m) + "</div>";
			
			chats.push(txt);
		}
		var txt = "<li>" + chats.join("</li>\n<li>") + "</li>";
		$(".uChatList").html(txt);
		self.addChatListHanders();
		$("#uChatList li:first").click();
	}
	this.update = function () {
		messenger.getAllChat(self.renderChatList);
	}
}


var messenger = new function () {
	var self = this;
	this.allChatDataFull = [];
	this.allChatData = [];
	this.messageCount = 0;
	this.getMessageCount = function () {
		socket.emit('getMessageCount', function (o, n) { self.messageCount = n; });		
	}
	this.getAllChat = function (cb) {
		var self = this;
		socket.emit('getAllChat', function (ar, all) {
			self.allChatData = ar;
			self.allChatDataFull = all;
			if (cb) cb.apply(self, [ar, all]);
		});
	}
	this.sendMessage = function (txt, guid) {
		console.log(txt, guid);
		socket.emit('sendMessage', {text: txt, guid: guid});

		$(".msg").last().after('<div class="msg msg-right msg-pending"><span class="sender">'+whoami+'</span> <span class="msg-timestamp">Pending...</span><br>'+txt+'</div>');
		$(".msg").last().velocity('scroll', {duration:100}).velocity('scroll', {duration:100});
	}
	this.inputWatch = function (e) {
		if (e.which==13) {
			self.sendMessage($(this).val(), $(".active div").data('guid'));
			$(this).val('') 
			return false;
		}
		return true;
	}
}

function windowResize() {
	$(".chatInput").css({'position':'absolute', 'left':0});
	var l = $(".chatInput").offset().left;
	$(".chatInput").css({'position':'fixed', 'left':l});
}
function addTypeahead() {
	$('.contactSearch').typeahead({
	  minLength: 3,
	  highlight: true,
	},
	{
	  name: 'contacts',
	  source: simpleSearch
	});
}
function loadContactValues() {
	socket.emit('getContactValues', function (dt) { contacts = dt; addTypeahead(); })
}
function simpleSearch(query, cb) {
	
	var search = contacts.filter(function (item) { return item.toLowerCase().indexOf(query) > -1 });
	var results = search.map(function (item) { return {value: item} });
	cb(results);
}

var socket = io.connect();
socket.on('updateChatData', function (dt) { messageList.updateChatData.apply(messageList, [dt])});

$(window).resize(windowResize);

$(function () {
	loadContactValues();
	$("#myMessage").keypress(messenger.inputWatch);
	windowResize();
	chatList.update();
});
