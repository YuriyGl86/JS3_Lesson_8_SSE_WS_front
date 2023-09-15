import Popover from '../../popover/Popover';
import '../../popover/style.css';
import Chat from './Chat';

export default class LogIn {
  constructor() {
    this.form = document.querySelector('.add-form-modal');

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
    const result = await LogIn.sendLogInRequest(event.target);

    if (await result.status === 'not a unique username') {
      console.log('не ок');
      this.popover.showPopover();
    } else if (await result.status === 'OK') {
      console.log('OK');
      this.popover.removePopover();
      this.form.classList.remove('show');
      LogIn.activateChat(event.target.name.value);
      // console.log(event.target.name.value)
    }
  }

  static async sendLogInRequest(form) {
    return fetch('http://localhost:7071/users', {
      method: 'POST',
      body: new FormData(form),
    }).then((response) => response.json());
  }

  static activateChat(name) {
    const chat = new Chat();
    chat.init();
    chat.userName = name;
  }
}
