var allChatQuery = (function () {/*
select
	chat_id,
	guid,
	room_name,
	people,
	most_recent_msg,
	account_id
from (select
	chj.chat_id,
	c.guid,
	room_name,
	group_concat(distinct h.id) people,
	(max(m.date) + 978328800) most_recent_msg,
	c.account_id
from
	handle h
	join chat_handle_join chj on (h.rowid = chj.handle_id)
	join chat c on (c.rowid = chj.chat_id)
	join chat_message_join cmj on (c.rowid = cmj.chat_id)
	join message m on (m.rowid = cmj.message_id)
	left join message_attachment_join maj on (maj.message_id = m.rowid)
group by chj.chat_id, room_name) order by most_recent_msg desc
*/}).toString().match(/[^]*\/\*([^]*)\*\/\}$/)[1];

var chatQuery = (function () {/*
select cmj.message_id,
	(select id from handle hi where hi.rowid = m.handle_id) who_from,
	is_from_me, cmj.chat_id, m.text, maj.attachment_id, a.mime_type,
	(m.date + 978328800) date, c.guid, a.filename, a.uti, a.mime_type
from chat c
join chat_message_join cmj on (c.rowid = cmj.chat_id)
join message m on (m.rowid=cmj.message_id)
left join handle h on (m.handle_id = h.rowid)
left join message_attachment_join maj on (maj.message_id = m.rowid)
left join attachment a on (maj.attachment_id = a.rowid)
where cmj.chat_id = [CHAT_ID] [OTHER_CONST]
order by cmj.chat_id, m.date
*/}).toString().match(/[^]*\/\*([^]*)\*\/\}$/)[1];

var chatMessageCountsQuery = (function () {/*
select count(1) message_count, cmj.chat_id
from message m 
join chat_message_join cmj on (m.rowid = cmj.message_id)
group by chat_id
order by cmj.chat_id
*/}).toString().match(/[^]*\/\*([^]*)\*\/\}$/)[1];


exports.allChatQuery = allChatQuery;
exports.chatQuery = chatQuery;
exports.chatMessageCountsQuery = chatMessageCountsQuery;