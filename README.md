MessageBridge
=============

![Alt text](https://raw.githubusercontent.com/bsharper/MessageBridge/master/screenshot.jpg "MessageBridge in action")
MessageBridge is a web-based front-end for Messages. It correctly renders most pictures and video attachments and auto-updates when new message is received. 

#Quickstart

This is if you already have Xcode installed.

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

#Installation
You'll need to install Node (http://nodejs.org/download/) and Xcode (https://itunes.apple.com/us/app/xcode/id497799835?mt=12). Once those are both installed go through the steps below.

1. Open Terminal (Spotlight search for it or look under Applications/Utilities)
2. Type "xcode-select --install" and press enter. It may ask you to agree to something, I can't remember. Complete the Xcode command-line installation.
3. Change to the directory where you want these files to be. If you don't know/care, just type "cd Desktop" and press enter. 
4. Type "git clone https://github.com/bsharper/MessageBridge.git" and press enter. 
5. Type "cd MessageBridge" and press enter.
6. Type "npm install" and press enter.
7. Type "cd tools" and press enter.
8. Type "python address_export.py" and press enter. Type "ls" and enter and make sure "address_book.js" and "address_book_raw.js" have been generated (if you see an errors or they aren't there, let me know)
9. Type "cd .." and press enter.
10. Type "node app.js" and press enter. The application should now be running (it should print "Database opened...")
11. Go to a browser (Chrome, Safari or Firefox should work). In the address bar type "localhost:3000" and press enter.
12. 
To start the program again, you just need steps 1, 3, 5 and 10. If you updated your address book rerun 7, 8 and 9.


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
