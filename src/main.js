import './scss/style.scss';

import 'regenerator-runtime';

const form = document.querySelector('form');
const search = document.querySelector('#search');
const loader = document.querySelector('.loader');

const APIURL = 'https://api.github.com/users/';

async function getUser(username) {
  try {
    loader.classList.remove('loader');
    const response = await fetch(APIURL + username);
    if (response.statusText === 'Not Found')
      throw new Error('User not found!');

    if (response.status === 403)
      throw new Error('You have exceeded the maximum number of requests!');

    const data = await response.json();
    loader.classList.add('loader');
    createUserHtml(data);
    getRepos(username);
  }
  catch (error) {    
    loader.classList.add('loader');
    createErrorHtml(error.message, 'error');  
  }
}

async function getRepos(username) {
  const response = await fetch(APIURL + username + '/repos?sort=created');
  const data = await response.json();
  
  createReposHtml(data);
}

function createUserHtml(user) {
  const html = `
    <div class="container">
        <div>
          <img src="${user.avatar_url}" alt="${user.login}">
          <a href="${user.html_url}" target="_blank">View Profile</a>
        </div>
        <div class="user-info">
          <div class="main-info">
            ${user.name ? '<h2>' + user.name + '</h2>' : ''}
            <small><i class="fas fa-user"></i> ${user.login}</small>
            ${user.location ? '<small><i class="fas fa-map-marker-alt"></i> ' + user.location + '</small>' : ''}
          </div>

          ${user.bio ? '<p>' + user.bio +'</p>' : ''}

          <ul>
            <li><i class="fas fa-users"></i> ${user.followers} <strong>followers</strong></li>
            <li><i class="fas fa-user-plus"></i> ${user.following} <strong>following</strong></li>
            <li><i class="fas fa-book"></i> ${user.public_repos} <strong>repos</strong></li>
          </ul>

          <div class="repos"></div>
        </div>
      </div>
  `;

  document.querySelector('main').innerHTML = html;
}

function createReposHtml(repos) {
  const reposEl = document.querySelector('.repos');

  if (repos.length) {
    repos
      .slice(0, 5)
      .forEach((repo) => {
        const repoEl = document.createElement('a');
        repoEl.classList.add('repo');
        repoEl.href = repo.html_url;
        repoEl.target = '_blank';
        repoEl.title = repo.description ? repo.description : '';
        repoEl.innerHTML = `${repo.name} <span class="stars" title="Stars">${repo.stargazers_count}</span>`;

        reposEl.append(repoEl);
    })
  } else {
    const h3 = document.createElement('h3');
    h3.innerText = 'No repos found.';

    reposEl.append(h3);
  }
}

function createErrorHtml(message, className) {
  const html = `
    <span class="${className}">${message}</span>
  `;

  document.querySelector('main').innerHTML = html;

  setTimeout(() => {
    document.querySelector('main span').remove();
  }, 2000);
}

form.addEventListener('submit', (e) => {
  e.preventDefault();

  if (search.value)
    getUser(search.value);

  search.value = '';
});