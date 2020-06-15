import React, { Component } from "react";
import io from "socket.io-client";
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import 'react-tabs/style/react-tabs.css';
//import TabVisibility from 'react-tab-visibility';
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
      msg: "",
      chat: [],
      nickname: "anon",
      newMessages: 0,
      tabIndex: 0,
      // isTabVisible: true,
      intervalId: null,
      lightTheme: true,
      clock12h: true,
      ctrlSubmit: false
    };
  }

  componentDidMount() {
    document.addEventListener("visibilitychange", this.onTabVisibilityChange);
    // const hiddenProp = this.getHiddenProp();
    // if (hiddenProp) {
    //   const visEventName = hiddenProp.replace(/[H|h]idden/,'') + 'visibilitychange';
    //   document.addEventListener(visEventName, this.visChange());
    // }
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

  onTabVisibilityChange = () => {
    if (document.visibilityState === "visible" && this.state.intervalId) {
      clearInterval(this.state.intervalId);
      document.title = "chatr";
      if (this.state.tabIndex === 0) {
        this.setState({ newMessages: 0 });
      }
    }
  }

  toggleTitle = () => {
    if (document.title === "chatr") {
      document.title = this.state.newMessages +
        (this.state.newMessages === 1 ? " new message!" : " new messages!");
    } else {
      document.title = "chatr";
    }
  }

  newMessages() {
    const newCount = this.state.newMessages;
    if (newCount !== 0) {
      return " (" + newCount + ")";
    } else {
      return "";
    }
  }

  resetSettings = () => {
    this.setState(defaultSettings);
    document.body.className = "light";
  }

  onTextChange = e => {
    this.setState({ [e.target.name]: e.target.value });
  }

  onRadioChange = e => {
    this.setState({ [e.target.name]: e.target.value === "true" });
  }

  onThemeChange = e => {
    const lightTheme = e.target.value === "true";
    this.setState({ lightTheme });
    document.body.className = (lightTheme ? "light" : "dark");
  }

  onSwitchTabs = tabIndex => {
    if (tabIndex === 0) {
      this.setState({ newMessages: 0 });
    }
    this.setState({ tabIndex });
  }

  onSubmit = e => {
    e.preventDefault();
    this.submitMessage();
  }

  onKeyDown = e => {
    if (this.state.ctrlSubmit && e.keyCode === 13 && e.ctrlKey) {
      this.submitMessage();
    }
  }

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

  renderChat() {
    const { chat } = this.state;
    return chat.map(({ nickname, msg, time }, idx) => (
      <div key={idx} className={"d-flex mb-4 justify-content-" + (nickname === self ? "end" : "start")}>
        <div>
          <div className={"msg-container " + (nickname === self ? "sent" : "received")}>{msg}</div>
          <div className={"msg-details " + (nickname === self ? "sent" : "received")}>{nickname === self ? "" : (nickname + ", ")}{this.convertTime(time)}</div>
        </div>
      </div>
    ));
  }

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
            <form action="" onKeyDown={this.onKeyDown} onSubmit={this.onSubmit}>
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
