import * as React from 'react';
import * as ReactDOM from 'react-dom';
import registerServiceWorker from './registerServiceWorker';

import App from './App';
import State, { Data } from './State';

import './index.css';

let client: WebSocket;

var state: State = new State();

var app = ReactDOM.render(
  <App />,
  document.getElementById('root')) as React.Component;

app.setState(state);

registerServiceWorker();

SetupClient();

function SetupClient() {
  client = new WebSocket('ws:localhost:3020');
  state.client = client;

  client.addEventListener('open', OnConnected);
  client.addEventListener('close', OnClose);
  client.addEventListener('message', OnMessage);
}

function OnConnected(socket: Event) {
  state.connected = true;
  app.setState(state);
}

function OnClose(socket: Event) {
  state.connected = false;
  app.setState(state);
}

function OnMessage(data: MessageEvent) {
  let d = new Data();
  d.data = data.data;

  state.data.push(d);
  app.setState(state);
}