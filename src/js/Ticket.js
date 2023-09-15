export default class Ticket {
  constructor(elem) {
    this.container = elem.querySelector('.all-tickets-container');
    this.addButton = elem.querySelector('.add-ticket-btn');
    this.onTicketClick = this.onTicketClick.bind(this);
    this.addNewTicket = this.addNewTicket.bind(this);
    this.editTicketSubmitHandler = this.editTicketSubmitHandler.bind(this);
    this.addForm = document.querySelector('.add-ticket-form');
    this.editForm = document.querySelector('.edit-form-modal');
    this.currentEditTicket = undefined;
  }

  init() {
    const URL = 'http://localhost:7071/?method=allTickets';
    fetch(URL, {
      method: 'GET',
    }).then((response) => response.json())
      .then((data) => {
        console.log(data);
        for (const obj of data) {
          this.renderTicket(obj);
        }
      });

    this.container.addEventListener('click', this.onTicketClick);
    this.addButton.addEventListener('click', () => {
      document.querySelector('.add-form-modal').classList.add('show');
    });

    const cancelButtons = document.querySelectorAll('.add-form-cancel-button');
    console.log(cancelButtons);

    cancelButtons.forEach((button) => button.addEventListener('click', (event) => {
      event.target.closest('.modalBackground').classList.remove('show');
    }));

    this.addForm.addEventListener('submit', this.addNewTicket);
    this.editForm.addEventListener('submit', this.editTicketSubmitHandler);
  }

  renderTicket(data) {
    const ticket = document.createElement('div');
    ticket.classList.add('ticket');
    ticket.innerHTML = `
        <div class="main-ticket-content">
            <div class="done-btn-container"></div>
            <div class="content"></div>
            <div class="edit-container">
                <div class="date"></div>
                <div class="edit"></div>
                <div class="delete"></div>
            </div>
            </div>
            <div class="description-ticket">

            </div>
        `;
    ticket.querySelector('.content').innerText = data.name;
    ticket.querySelector('.date').innerText = Ticket.formatDate(new Date(data.created));
    ticket.dataset.id = data.id;

    this.container.appendChild(ticket);
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

  static removeTicket(event) {
    const ticket = event.target.closest('.ticket');
    const URL = `http://localhost:7071/?id=${ticket.dataset.id}`;
    fetch(URL, {
      method: 'DELETE',
    }).then((response) => {
      if (response.ok) {
        ticket.remove();
      }
    });
  }

  onTicketClick(event) {
    if (event.target.closest('.delete')) {
      Ticket.removeTicket(event);
    } else if (event.target.closest('.done-btn-container')) {
      Ticket.checkTicket(event);
    } else if (event.target.closest('.edit')) {
      this.editTicket(event);
    } else {
      Ticket.showDetailedTicket(event);
    }
  }

  static checkTicket(event) {
    event.target.closest('.done-btn-container').classList.toggle('checked');
    const ticket = event.target.closest('.ticket');
    const URL = `http://localhost:7071/?id=${ticket.dataset.id}`;
    fetch(URL, {
      method: 'PATCH',
    }).then((response) => response.text())
      .then((data) => console.log(data));
  }

  editTicket(event) {
    const modal = document.querySelector('.edit-form-modal');
    const ticket = event.target.closest('.ticket');
    const ticketDescription = ticket.querySelector('.description-ticket').innerText;
    console.log(ticketDescription);
    const nameModal = modal.querySelector('input');
    const descriptionModal = modal.querySelector('textarea');

    modal.classList.add('show');
    this.currentEditTicket = ticket;
    nameModal.value = ticket.querySelector('.content').innerText;
    if (!ticketDescription.replace(/\s/g, '').length) {
      console.log('тут');
      Ticket.getFullInfoById(ticket.dataset.id)
        .then((data) => {
          console.log(data);
          descriptionModal.value = data.description;
        });
    } else {
      descriptionModal.value = ticketDescription;
    }

    // event.target.closest('.done-btn-container').classList.toggle('checked')
    // const ticket = event.target.closest('.ticket')
    // const URL = 'http://localhost:7071/' + '?id=' + ticket.dataset.id
    // fetch(URL, {
    //     method: 'PATCH',
    // }).then(response => response.text())
    // .then(data => console.log(data))
  }

  static showDetailedTicket(event) {
    const ticket = event.target.closest('.ticket');
    const descriptionTicket = ticket.querySelector('.description-ticket');
    descriptionTicket.classList.toggle('show');
    if (descriptionTicket.innerText === '') {
      Ticket.getFullInfoById(ticket.dataset.id)
        .then((data) => {
          descriptionTicket.innerText = data.description;
        });
    }
  }

  static getFullInfoById(id) {
    const URL = `http://localhost:7071/?method=ticketById&id=${id}`;
    return fetch(URL, { method: 'GET' })
      .then((response) => response.json());
  }

  addNewTicket(event) {
    event.preventDefault();

    fetch('http://localhost:7071', {
      method: 'POST',
      body: new FormData(this.addForm),
    }).then((response) => response.json())
      .then((data) => {
        console.log(data.id);
        this.renderTicket(data);
      });

    this.addForm.reset();
    this.addForm.closest('.modalBackground').classList.remove('show');
  }

  editTicketSubmitHandler(event) {
    event.preventDefault();
    const form = event.target;
    this.currentEditTicket.querySelector('.content').innerText = form.name.value;
    this.currentEditTicket.querySelector('.description-ticket').innerText = form.description.value;

    this.editForm.closest('.modalBackground').classList.remove('show');

    const URL = `http://localhost:7071/?id=${this.currentEditTicket.dataset.id}`;

    fetch(URL, {
      method: 'PUT',
      body: new FormData(form),
    }).then((response) => response.text())
      .then((data) => {
        console.log(data);
        form.reset();
        this.currentEditTicket = undefined;
      });
  }
}
