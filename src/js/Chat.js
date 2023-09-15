export default class Chat {
  constructor() {
    this.URL = 'http://localhost:7071/';
    this.users = document.querySelector('.users');
    this.userName = undefined;

    this.deleteUser = this.deleteUser.bind(this);
  }

  async init() {
    const request = fetch(`${this.URL}userlist/`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const result = await request;

    if (!result.ok) {
      console.error('Ошибка');
    }

    const userList = await result.json();
    await userList.forEach((user) => {
      // this.users.appendChild(document.createTextNode(`${user}\n`))
      this.renderUser(user);
    });

    this.activateSSEforUserList();
    this.activateWS();
    window.addEventListener('unload', this.deleteUser);
  }

  renderUser(name) {
    let newUserName = name;
    const newUser = document.createElement('div');
    newUser.dataset.name = name;
    // console.log('name', name);
    // console.log('Username', this.userName);
    if (name === this.userName) {
      newUserName = 'You';
      newUser.classList.add('you-red');
    }
    newUser.innerText = newUserName;
    this.users.appendChild(newUser);
  }

  activateSSEforUserList() {
    const URL = `${this.URL}sse/`;
    const eventSource = new EventSource(URL);

    eventSource.addEventListener('message', (e) => {
      console.log(e);
      const name = JSON.parse(e.data);
      this.renderUser(name);

      //   this.users.appendChild(document.createTextNode(`${name}\n`));

      console.log('sse message');
    });

    eventSource.addEventListener('userLogOut', (e) => {
      console.log(e);
      const name = JSON.parse(e.data);
      console.log(name);

      console.log('sse userLogOut', `user ${name} logged out`);
      this.users.querySelector(`[data-name="${name}"]`).remove();
    });
  }

  activateWS() {
    const ws = new WebSocket('ws://localhost:7071/ws');

    const chatForm = document.querySelector('.chat-input');
    const chatMessage = document.querySelector('.chat-message');
    // const chatSend = document.querySelector('.chat-send');

    chatForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const messageText = chatMessage.value;
      const date = Date.now();
      const user = this.userName;

      if (!messageText) return;
      console.log('message', messageText, date, this.userName);
      ws.send(JSON.stringify({ messageText, date, user }));
      chatMessage.value = '';
    });

    ws.addEventListener('message', (e) => {
      const data = JSON.parse(e.data);
      const { chat: messages } = data;
      console.log(messages);

      messages.forEach((message) => {
        this.renderMessage(message);
      });
    });
  }

  renderMessage(message) {
    const chat = document.querySelector('.chat-content');
    const newNode = document.createElement('div');
    const dateDiv = document.createElement('div');
    const content = document.createElement('div');
    const date = Chat.formatDate(new Date(message.date));
    let userName = message.user;

    dateDiv.classList.add('message-date');
    newNode.classList.add('message');
    content.classList.add('message-content');

    if (userName === this.userName) {
      dateDiv.classList.add('user-message-date');
      content.classList.add('user-message-content');
      userName = 'You';
    }
    dateDiv.innerText = `${userName}, ${date}`;
    content.innerText = message.messageText;

    newNode.appendChild(dateDiv);
    newNode.appendChild(content);

    chat.appendChild(newNode);
  }

  async deleteUser() {
    const query = `users/${encodeURIComponent(this.userName)}`;

    const request = fetch(this.URL + query, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      keepalive: true,
    });

    const result = await request;

    if (!result.ok) {
      console.error('Ошибка!');

      return;
    }

    const json = await result.json();
    const { status } = json;

    console.log(status);
  }

  static formatDate(date) {
    let dayOfMonth = date.getDate();
    let month = date.getMonth() + 1;
    let year = date.getFullYear();
    let hour = date.getHours();
    let minutes = date.getMinutes();

    year = year.toString().slice(-2);
    month = month < 10 ? `0${month}` : month;
    dayOfMonth = dayOfMonth < 10 ? `0${dayOfMonth}` : dayOfMonth;
    hour = hour < 10 ? `0${hour}` : hour;
    minutes = minutes < 10 ? `0${minutes}` : minutes;

    return `${dayOfMonth}.${month}.${year} ${hour}:${minutes}`;
  }
}
