MessageBridge
=============

MessageBridge is a web-based front-end for Messages. Correctly renders most pictures and video attachments. Auto-updates when new message is received. 

#Quickstart
You should just be able to run 
```
npm install
```
And then
```
node app.js
```
Then go to localhost:3000 in your browser. To add contact lookup, go to the tools directory and run
```
python address_export.py
```
This will create two files address_book.js and address_book_raw.js. Run node app.js again and it will use the contacts from those two files when it renders the conversations.

#Behind the scenes
The messages are retrieved from the '~/Library/Messages/chat.db' sqlite database that Messages uses to store the messages. The queries that retrieve this information are (hackishly) stored in queries.js. When you send a message, send_message.applescript is called to actually send the message.

#What doesn't work
###Starting a new chat
Starting a new chat currently isn't implemented. When you click on the New button, the dialog that will eventually be used to send messages is shown. I still have to get typeahead.js fully working with the address book data.

###Probably lots of other stuff
The majority of the code was written on one very long night, so lots of things could break on other browsers or systems. This has been tested on the latest version of Yosemite and mostly with Chrome. Currently, there is no image manipulation to create thumbnails, so very large images are loaded in place. Also on chats with a lot of attachments, it's very difficult to determine when everything has stopped rendering so you may see the chat jump around a little bit.

#Why?
I use this to remote in to my Mac over SSH and forward port 3000 to my local machine so I can type text messages. Eventually it would be great if this could evolve to easily access Messages remotely, since iCloud doesn't have a Messages interface.

#What's next?
Starting new chats, handling location attachment, possibly sending pictures or videos through the interface.
