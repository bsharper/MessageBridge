var expandHomeDir = require('expand-home-dir');
var sqlite3 = require('sqlite3');
var fs = require('fs');
var _ = require('underscore')._;
var queries = require('./queries');
var addressbook = require('./addressbook');
var lookupName = addressbook.lookupName;

var chat = new function () {
  this.messageCount = 0;
  this.chatMessageCounts = {};
  this.attachmentInfo = {};
  this.chatMessageIds = {};
  this.dbPath = expandHomeDir('~/Library/Messages/chat.db');
  this.lookupName = lookupName;
  this.debug = false;
  this.testChatUpdate = true;
  this.testMessageCounts = true;
  this.pollMessageCounts = true;
  this.pollInterval = 2000;
  this.pollCountInterval = null;
  this.addressbookData = addressbook.addressbookData;
  this.contactValues = [];

  this.chatUpdateTrigger = function (chat_ids) {}

  this.getContactValues = function () {
    var self = this;

    if (self.contactValues.length > 0) return self.contactValues;
    var ar =[];
    Object.keys(self.addressbookData).forEach(function (k) {
      ar = ar.concat(self.addressbookData[k]);
    });
    self.contactValues = ar;
    return ar;
  }
	this.getAttachmentPath = function (attachment_id, cb) {
    var self = this;
    var fl = self.attachmentInfo[attachment_id];
    
    fl.path = expandHomeDir(fl.filename);
    cb(_.pick(fl, "path", "filename", "uti", "mime_type"));

	}
  this.parseMessageRow = function (row) {
    var self = this;
    var rr = _.pick(row, "message_id", "who_from", "is_from_me", "chat_id", "text", "attachment_id", "date", "guid", "lookupValue", "mime_type");
    var fi = _.pick(row, "attachment_id", "filename", "chat_id", "mime_type", "uti");
    self.attachmentInfo[fi.attachment_id] = _.pick(fi, "filename", "chat_id", "mime_type", "uti");

    return rr;
  }

	this.getChat = function (chat_id, cb) {	
		var self = this;
		var ar = [];
    var mids = [];
		var query = queries.chatQuery.replace('[CHAT_ID]', chat_id).replace('[OTHER_CONST]', '');
		this.db.each(query, function(err, row) {
			row.lookupValue = self.lookupName(row.who_from).lookupValue;
      var rr = self.parseMessageRow.apply(self, [row]);
      mids.push(row.message_id);
			ar.push(rr);
		}, function (e) {
      if (self.testChatUpdate) {
        self.testChatUpdate = false;
        mids.pop();
        ar.pop();
      }
      self.chatMessageIds[chat_id] = mids;
			if (cb) cb.apply(self, [ar]);
		});
	}
  this.checkChatUpdates = function (chat_id, cb) {
    var self = this;
    var ar = [];
    if (! _.has(self.chatMessageIds, chat_id)) return;
    var mids = self.chatMessageIds[chat_id];
    var query = queries.chatQuery.replace('[CHAT_ID]', chat_id).replace('[OTHER_CONST]', 'and cmj.message_id not in (' + mids.join(', ') + ')');
    this.db.each(query, function(err, row) {
      row.who_from = self.lookupName(row.who_from);
      var rr = self.parseMessageRow.apply(self, [row]);
      mids.push(row.message_id);
      ar.push(row);
    }, function (err) { 
      self.chatMessageIds[chat_id] = mids;
      if (cb) cb.apply(self, [chat_id, ar]); 
    });
  }
	this.getAllChats = function (cb) {
		var self = this;

		var ar = [];
		var allData = [];

		this.db.each(queries.allChatQuery, function(err, row) {
			if (row.people.indexOf(',') > -1) {
				var els = row.people.split(',');
				var na = [];
				for (var i=0; i<els.length; i++) na.push(self.lookupName(els[i]));
				row.people = na;
			} else {
				row.people = [self.lookupName(row.people)];
			}
			
			ar.push({chat_id: row.chat_id, people: row.people, lastUpdate: row.most_recent_msg, guid:row.guid});
			allData.push(row);
		}, function (err) { 
			if (err) console.log(err);
			if (cb) cb.apply(self, [ar, allData]);
		});

	}
  this.getChatMessageCounts = function (cb) {
    var self = this;
    var chatMessageCounts = {};
    self.db.each(queries.chatMessageCountsQuery, function(err, row) {
      chatMessageCounts[row.chat_id] = row.message_count;
    }, function (err) {
      if (self.testMessageCounts) {
        self.testMessageCounts = false;
        chatMessageCounts[60]--;
      }
      if (cb) cb.apply(self, [chatMessageCounts, self.chatMessageCounts]);
      self.chatMessageCounts = chatMessageCounts;
    });
  }
  this.checkUpdated = function (cb) {
    var self = this;
    self.getChatMessageCounts(function (newMC, oldMC) {
      //console.log(newMC, oldMC);
      if (Object.keys(oldMC).length == 0) return;
      var diffs = [];
      Object.keys(oldMC).forEach(function (k) {
        if (! _.has(newMC, k)) return;
        if (oldMC[k] != newMC[k]) diffs.push(k);
      });
        
      if (diffs.length > 0) self.chatUpdateTrigger(diffs);
    });
  }

	this.getMessageCount = function (cb) {
		var self = this;
		var oldCount = self.messageCount;
		var msgCount = 0;
		this.db.each("select count(1) c from message", function (err, row) {
			msgCount = row.c;
			self.messageCount = msgCount;
		}, function (err) {
			if (err) console.log(err);
			else if (cb) cb.apply(self, [oldCount, msgCount]);
		});
	}
  this.enableMessageCountPoll = function (cb) {
    var self = this;
    self.pollCountInterval = setInterval(function () { self.checkUpdated.apply(self) }, self.pollInterval);
  }
	this.openChatDatabase = function (cb) {
		var self = this;
		//fs.watch(this.dbPath, function(a,b) { self.watchTrigger(a,b,self) });
		this.db = new sqlite3.Database(this.dbPath, sqlite3.OPEN_READONLY, function (e) {
      if (self.pollMessageCounts) self.enableMessageCountPoll();
      if (self.debug) self.db.on('profile', function (e, t) { console.log(e, t) });
      if (cb) cb.apply(self, [self.dbPath, e] ); 
    });
	}
}
exports.chat = chat;