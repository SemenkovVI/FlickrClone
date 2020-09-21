class ImageApp {
  constructor() {
    this.imageApp = document.querySelector('.image-app-container');
    this.authorization = new AuthorizationWindow();
    this.authorization.loginButton.addEventListener('click', this.authorization.handleLogin);
    this.logoutBtn = new Logout();
    this.logoutBtn.logoutButton.addEventListener('click', this.logoutBtn.handleLogout);
  }
}

class AuthorizationWindow {
  constructor() {
    this.authorizationWindow = document.querySelector('.authorization-window');
    this.emailField = document.querySelector('.email');
    this.passwordField = document.querySelector('.password');
    this.loginButton = document.querySelector('.login');
    this.registrationButton = document.querySelector('.registration');
  }

  handleLogin() {
    const authWindow = this.parentElement;
    const email = document.querySelector('.email').value;
    const password = document.querySelector('.password').value;

    const FILL_FIELDS = 'Please fill in all the fields';
    const EMPTY_PASSWORD = "Password can't be empty";
    const EMPTY_EMAIL = "E-mail can't be empty";

    if (email === 'admin' && password === 'admin') {
      document.querySelector('.email').value = '';
      document.querySelector('.password').value = '';
      document.querySelectorAll('.form-control').forEach(e => e.classList.remove('error'));
      authWindow.classList.add('hide');

      const main = document.querySelector('.image-app-container__main-container');
      main.innerHTML = '';

      const findWindow = new FindUserWindow();
      findWindow.getUserEmail();

    } else if (email === '' && password === '') {
      document.querySelectorAll('small')[0].innerHTML = `${EMPTY_EMAIL} ${FILL_FIELDS}`;
      document.querySelectorAll('small')[1].innerHTML = `${EMPTY_PASSWORD}`;
      document.querySelectorAll('.form-control').forEach(e => e.classList.add('error'));
    } else if (email === '') {
      document.querySelectorAll('small')[0].innerHTML = `${EMPTY_EMAIL}`;
      document.querySelectorAll('small')[1].innerHTML = `${FILL_FIELDS}`;
      document.querySelectorAll('.form-control').forEach(e => e.classList.add('error'));
    } else if (password === '') {
      document.querySelectorAll('small')[1].innerHTML = `${EMPTY_PASSWORD}`;
      document.querySelectorAll('small')[0].innerHTML = `${FILL_FIELDS}`;
      document.querySelectorAll('.form-control').forEach(e => e.classList.add('error'));
    } else if (email !== '' || password !== '') {
      document.querySelectorAll('small')[0].innerHTML = 'The username or password is incorrect';
      document.querySelectorAll('small')[1].innerHTML = 'Please try again';
      document.querySelectorAll('.form-control').forEach(e => e.classList.add('error'));
    }
  }
}

class FindUserWindow {
  constructor() {
    this.mainContainer = document.querySelector('.image-app-container__main-container');
    this.findContainer = document.createElement('div');
    this.findContainer.classList.add('authorization-window');
    this.findUserWindow = document.createElement('input');
    this.findBtn = document.createElement('button');
    this.findBtn.classList.add('btn');
    this.findBtn.classList.add('login');
    this.text = document.createTextNode('find');
    this.findBtn.appendChild(this.text);
    this.findContainer.appendChild(this.findUserWindow);
    this.findContainer.appendChild(this.findBtn);
    this.mainContainer.appendChild(this.findContainer);
  }

  getUserEmail() {
    this.findBtn.addEventListener('click', function () {
      this.parentElement.remove();
      const albumWindow = new AlbumWindow(this.previousSibling.value);
    });
  }
}


class AlbumWindow {
  constructor(email) {
    this.apiKey = '52328a43f026a14d5bd0e416ba524a42';
    this.format = 'json&nojsoncallback=1';
    this.startUrl = 'https://www.flickr.com/services/rest/?method=flickr';
    this.getUserPhotosByUserName(email);
  }
  
  async getUserPhotosByUserName(userName) {
    const response = await fetch(`${this.startUrl}.people.findByUsername&api_key=${this.apiKey}&username=${userName}` +
    `&format=${this.format}`);
    const result = await response.json();
    const ID = result.user.nsid;
    this.id = ID;
    this.getUserPhotoSetsByUserId(this.id);
  }

  async getUserPhotoSetsByUserId(userId) {
    const response = await fetch(`${this.startUrl}.photosets.getList&api_key=${this.apiKey}&user_id=${userId}&format` +
    `=${this.format}`);
    const result = await response.json();
    const photoSets = result.photosets.photoset;
    const photoSetsId = photoSets.map((photoSet) => photoSet.id);
    this.getUserPhotosByPhotoSetId(this.id, photoSetsId);
  }

  async getUserPhotosByPhotoSetId(userId, photoSetId) {
    const objectOfPhotoSets = {};
    for (let i = 0; i < photoSetId.length; i++) {
      const response = await fetch(`${this.startUrl}.photosets.getPhotos&api_key=${this.apiKey}&photoset_id=` +
      `${photoSetId[i]}&user_id=${userId}&format=${this.format}`);
      const result = await response.json();
      objectOfPhotoSets[i + 1] = result.photoset.photo;
    }

    const albumsContainer = document.createElement('div');
    albumsContainer.classList.add('main-container__albums');
    albumsContainer.classList.add('hide');

    const arrayOfAlbumElements = [];
    for (let key in objectOfPhotoSets) {
      const albumElement = document.createElement('div');
      const span = document.createElement('span');
      albumElement.setAttribute('data-images', JSON.stringify(objectOfPhotoSets[key]));
      albumElement.classList.add('album');
      albumElement.classList.add(`${key}`);
      arrayOfAlbumElements.push(albumElement);

      span.textContent = `album ${key}`;
      albumsContainer.appendChild(albumElement);
      albumElement.appendChild(span);

      const images = JSON.parse(albumElement.dataset.images);
      const photoLinkLogo = `http://farm${images[0].farm}.staticflickr.com/${images[0].server}/${images[0].id}_${images[0].secret}.jpg`;
      albumElement.style.backgroundImage = `url(${photoLinkLogo})`;
      albumElement.style.backgroundPosition = 'center';
      albumElement.addEventListener('click', this.showImages);
    }

    const main = document.querySelector('.image-app-container__main-container');
    main.appendChild(albumsContainer);

  }

  showImages() {
    this.parentElement.parentElement.remove();
    const images = JSON.parse(this.dataset.images);
    const albumContainer = this.parentElement;
    albumContainer.classList.add('hide');

    const mainContainer = document.createElement('main');
    mainContainer.classList.add('image-app-container__main-container');

    const imagesContainer = document.createElement('div');
    imagesContainer.classList.add('main-container__images');
  
      images.forEach((image) => {
      const photoLink = `http://farm${image.farm}.staticflickr.com/${image.server}/${image.id}_${image.secret}.jpg`;
      const img = document.createElement('img');
      img.setAttribute('src', photoLink);
      imagesContainer.appendChild(img);
      const imgElement = new Image(photoLink);
      img.addEventListener('click', imgElement.showImage.bind(imgElement));
    });

    mainContainer.appendChild(imagesContainer);
    const imageApp = document.querySelector('.image-app-container');
    imageApp.appendChild(mainContainer);
  }

}

class Logout {
  constructor() {
    this.logoutButton = document.querySelector('.logout');
  }

  handleLogout() {
    const authWindow = document.querySelector('.authorization-window');
    authWindow.classList.remove('hide');

    const imageAppContainer = document.querySelector('.image-app-container__main-container');
    imageAppContainer.innerHTML = '';

    const authorization = new AuthorizationWindow();
    authorization.loginButton.addEventListener('click', authorization.handleLogin);
  }

}

class Image {
  constructor(src) {
    this.imgSrc = src;
  }

  showImage() {
    const mainContainer = document.querySelector('.image-app-container__main-container');
    const modalWindow = document.createElement('div');
    const modalWindowContainer = document.createElement('div');
    modalWindow.classList.add('modal');
    modalWindowContainer.classList.add('modal-container');

    const img = document.createElement('img');
    img.setAttribute('src', this.imgSrc);
    img.classList.add('modal-image');
    modalWindowContainer.appendChild(img);

    const exitBtn = document.createElement('button');
    exitBtn.classList.add('exitBtn');
    modalWindowContainer.appendChild(exitBtn);
    modalWindow.appendChild(modalWindowContainer);
    mainContainer.appendChild(modalWindow);
    exitBtn.addEventListener('click', this.closeModal);
  }

  closeModal() {
    const modalContainer = this.parentElement;
    modalContainer.parentElement.remove();
  }

}

const app = new ImageApp();