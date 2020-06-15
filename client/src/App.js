import React, { Component } from "react";
import io from "socket.io-client";
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import 'react-tabs/style/react-tabs.css';
import DualRadioSetting from './DualRadioSetting';

const socket = io.connect("http://localhost:5000");
const self = "__self__";
const defaultSettings = {
  lightTheme: true,
  clock12h: true,
  ctrlSubmit: false
}

class App extends Component {
  constructor() {
    super();
    this.state = {
      msg: "", // What is currently in the chat box waiting to send
      chat: [], // The history of chat messages for this session
      nickname: "anon", // The user's chosen nickname
      newMessages: 0, // How many messages the user has received while tabbed away
      tabIndex: 0, // The currently-selected tab: 0 for chat, 1 for settings
      intervalId: null, // The id returned from setInterval, used to stop the
                        // tab from flashing when the user returns to the tab
      lightTheme: true, // Boolean toggle between Light and Dark theme
      clock12h: true, // Boolean toggle between 12 and 24hr clock
      ctrlSubmit: false // Boolean toggle to allow ctrl+enter submit
    };
  }

  componentDidMount() {
    document.addEventListener("visibilitychange", this.onTabVisibilityChange);

    // When the user receives a message, add it to the chat history. If the app's
    // tab isn't open in the browser, flash a notification that there are new messages.
    socket.on("incoming chat message", ({ nickname, msg, time }) => {
      this.setState({ chat: [...this.state.chat, { nickname, msg, time }] });
      if (this.state.tabIndex === 1 || document.visibilityState === "hidden") {
        this.setState({ newMessages: this.state.newMessages + 1 });
      }
      if (document.visibilityState === "hidden" && !this.state.intervalId) {
        const intervalId = setInterval(this.toggleTitle, 1500);
        this.setState({ intervalId });
      }
    });
  }

  // When the user comes back to the app's browser tab after being away,
  // stop notifications from flashing and reset the newMessage count.
  onTabVisibilityChange = () => {
    if (document.visibilityState === "visible" && this.state.intervalId) {
      clearInterval(this.state.intervalId);
      document.title = "chatr";
      if (this.state.tabIndex === 0) {
        this.setState({ newMessages: 0 });
      }
    }
  }

  // Toggle the app's title between "chatr" and "X new message(s)!"
  toggleTitle = () => {
    if (document.title === "chatr") {
      document.title = this.state.newMessages +
        (this.state.newMessages === 1 ? " new message!" : " new messages!");
    } else {
      document.title = "chatr";
    }
  }

  // Return a string of how many messages the user has missed. Used to display
  // on the Chat tab when the user is on the Settings tab.
  newMessages() {
    const newCount = this.state.newMessages;
    if (newCount !== 0) {
      return " (" + newCount + ")";
    } else {
      return "";
    }
  }

  // Reset the customizable settings (except nickname).
  resetSettings = () => {
    this.setState(defaultSettings);
    document.body.className = "light";
  }

  // Keep track of what's in the chat box and the nickname field.
  onTextChange = e => {
    this.setState({ [e.target.name]: e.target.value });
  }

  // Keep track of which radio button is selected in settings.
  onRadioChange = e => {
    this.setState({ [e.target.name]: e.target.value === "true" });
  }

  // Change between light and dark theme when the setting is changed.
  onThemeChange = e => {
    const lightTheme = e.target.value === "true";
    this.setState({ lightTheme });
    document.body.className = (lightTheme ? "light" : "dark");
  }

  // Keep track of which tab is selected, and reset newMessages when returning
  // to the chat tab.
  onSwitchTabs = tabIndex => {
    if (tabIndex === 0) {
      this.setState({ newMessages: 0 });
    }
    this.setState({ tabIndex });
  }

  // Determine whether the chat message should be sent, depending on the ctrl+enter setting
  onKeyDown = e => {
    if (e.keyCode === 13) {
      e.preventDefault();
      if (this.state.ctrlSubmit === e.ctrlKey) {
        this.submitMessage();
      }
    }
  }

  // Handle submitting the chat message. Include the user's nickname, message,
  // and time the message was sent. Locally, replace the user's nickname with
  // "__self__" so we know to display it on the right side of the page.
  submitMessage() {
    const { nickname, msg } = this.state;
    if (msg) {
      const now = new Date();
      const time = now.toLocaleString("en-GB", { hour: "numeric", minute: "numeric", hourCycle: "h23" });
      socket.emit("outgoing chat message", { nickname, msg, time });
      this.setState({
        msg: "",
        chat: [...this.state.chat, { nickname: self, msg, time }]
      });
    }
  }

  // Return the passed time, converted to 12hr clock if the setting is enabled.
  convertTime(time) {
    if (this.state.clock12h) {
      const h23 = parseInt(time.substr(0,2));
      const h12 = h23 % 12 || 12;
      const ampm = h23 < 12 ? " am" : " pm"
      return h12 + time.substr(2, 3) + ampm;
    } else {
      return time;
    }
  }

  // jsx for the chat messages. For messages with the nickname "__self__", display
  // on the right-hand side of the page with a different color and no username.
  renderChat() {
    const { chat } = this.state;
    return chat.map(({ nickname, msg, time }, idx) => (
      <div key={idx} className={"d-flex mb-4 justify-content-" + (nickname === self ? "end" : "start")}>
        <div>
          <div className={"msg-container " + (nickname === self ? "sent" : "received")}>
            {msg}
          </div>
          <div className={"msg-details " + (nickname === self ? "sent" : "received")}>
            {nickname === self ? "" : (nickname + ", ")}{this.convertTime(time)}
          </div>
        </div>
      </div>
    ));
  }

  // jsx for the app.
  render() {
    return (
      <Tabs selectedIndex={this.state.tabIndex} onSelect={this.onSwitchTabs}>
        <TabList>
          <Tab>{"Chat" + this.newMessages()}</Tab>
          <Tab>Settings</Tab>
        </TabList>

        <TabPanel>
          <div>
            <div className="chat">{this.renderChat()}</div>
            <form action="" onKeyDown={this.onKeyDown}>
              <input
                name="msg"
                autoComplete="off"
                onChange={this.onTextChange}
                value={this.state.msg}
              />
              <button>Send</button>
            </form>
          </div>
        </TabPanel>
        <TabPanel>
          <div className="settings">
            <div>Nickname</div>
            <input
              name="nickname"
              onChange={this.onTextChange}
              value={this.state.nickname}
            />
            <div>Interface color</div>
            <DualRadioSetting
              name="lightTheme"
              isOptionEnabled={this.state.lightTheme}
              onChange={this.onThemeChange}
              trueOptionText="Light"
              falseOptionText="Dark"
            />
            <div>Clock display</div>
            <DualRadioSetting
              name="clock12h"
              isOptionEnabled={this.state.clock12h}
              onChange={this.onRadioChange}
              trueOptionText="12 Hours"
              falseOptionText="24 Hours"
            />
            <div>Send messages on CTRL+ENTER</div>
            <DualRadioSetting
              name="ctrlSubmit"
              isOptionEnabled={this.state.ctrlSubmit}
              onChange={this.onRadioChange}
              trueOptionText="On"
              falseOptionText="Off"
            />
            <button id="resetSettings" onClick={this.resetSettings}>Reset to defaults</button>
          </div>
        </TabPanel>
      </Tabs>
    );
  }
}

export default App;
