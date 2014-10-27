#! /usr/bin/osascript


on run(arguments)
    set recipient to (first item of arguments) as text
    set msg to (second item of arguments) as text
    tell application "Messages"
		set theChat to chat id recipient
		send msg to theChat
	end tell
end run