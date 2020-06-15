# chatr
Chatr is a React app for chatting with friends.

You and anyone else connected to the app can send chat messages back and forth with
custom nicknames for identification. These messages aren't stored anywhere, so once
you're done your chat history will be totally inaccessible - hooray for privacy!

The app has several customizable settings to improve your experience:

* A dark mode for easier viewing at night
* The option to display time as a 24-hour clock instead of 12
* The ability to send messages using ctrl+enter

## Setup
From the top-level directory:

```console
$ cd client && npm install && cd ../server && npm install
```

## Running the app
From the top-level directory:

```console
$ cd server && npm start
```

And in a different console:

```console
$ cd client && npm start
```

## Feature checklist
### Socket.io chat functionality
- [x] sent/received messages float right/left
- [x] messages display the time they were sent (12hr or 24hr based on settings)
- [x] messages display the name of the user that sent them (if not the local user)
- [x] if the browser window is on another tab when a message is received, the tab will blink until the user returns

### Settings
- [x] user can change their displayed name
- [x] user can toggle between light and dark mode
- [x] user can toggle between 12 and 24hr clock display
- [x] user can choose to submit message on ctrl+enter

### Requirements
- [x] Built in React
- [x] CSS preprocessing with Sass
- [ ] Written in Typescript
- [ ] Responsive design
- [x] Cross-browser compatibility
- [ ] Do not use create-react-app
- [ ] Test coverage
- [x] Working code
- [x] README file
