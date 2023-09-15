import Popover from '../../popover/Popover';
import '../../popover/style.css';
import Chat from './Chat';

export default class LogIn {
  constructor(URL) {
    this.form = document.querySelector('.add-form-modal');
    this.URL = URL;

    this.logInHandler = this.logInHandler.bind(this);
  }

  init() {
    this.form.classList.add('show');
    this.activatePopover();

    this.form.addEventListener('submit', this.logInHandler);
  }

  activatePopover() {
    const input = this.form.querySelector('.nickname-input');

    this.popover = new Popover({
      title: 'User Name Error',
      content: 'Not a unique username. Choose enother one.',
    }, input);

    // this.popover.showPopover()
    // this.popover.removePopover()

    input.addEventListener('focus', () => {
      this.popover.removePopover();
    });
  }

  async logInHandler(event) {
    event.preventDefault();
    this.popover.removePopover();
    const result = await this.sendLogInRequest(event.target);

    if (await result.status === 'not a unique username') {
      console.log('не ок');
      this.popover.showPopover();
    } else if (await result.status === 'OK') {
      console.log('OK');
      this.popover.removePopover();
      this.form.classList.remove('show');
      this.activateChat(event.target.name.value);
      // console.log(event.target.name.value)
    }
  }

  async sendLogInRequest(form) {
    console.log('sending login request');
    const URL = `${this.URL}users`;
    console.log(URL);
    return fetch(URL, {
      method: 'POST',
      body: new FormData(form),
    }).then((response) => response.json());
  }

  activateChat(name) {
    const chat = new Chat(this.URL);
    chat.init();
    chat.userName = name;
  }
}
