const rootSelector = document.querySelector('#root');

chrome.runtime.onMessage.addListener(() => {});

chrome.runtime.sendMessage({ method: 'get', function: 'config' }, function(response) {
  if (response.loggedIn) {
    rootSelector.innerHTML = `<div class="greeting"> Hi, ${
      response.username
    }! </div> <div class="loggedIn"> You're logged in, enjoy Masterlingo :) </div>
      <div class="icons-container">
      <a target="_blank" href="chrome-extension://fpafbifeckmpbhpdphbgibckhmjngamn/src/options/options.html" class="nostyle icon__settings icon__container"><i class="nostyle material-icons icon">settings</i>Settings</a>
      <a target="_blank" href="https://masterlingoapp.com" class="nostyle icon__practise icon__container"><i class="material-icons icon">layers</i>Revise</a>
      <a  target="_blank" href="https://masterlingoapp.com/tutorial" class="nostyle icon__tutorial icon__container"><i class="material-icons icon">video_library</i>Tutorial</a>
      </div>
    `;
  } else {
    rootSelector.innerHTML = `<div class="logo">Master<span>Lingo</span></div><div class="sign-in"> Sign in to start using the extension. </div><a href="https://masterlingoapp.com/auth/google" class="button log-in">Sign in</a>`;
    document.querySelector('.log-in').addEventListener('click', () => {
      logIn();
    });
  }
});

function logIn() {
  window.open('https://masterlingoapp.com/auth/google');
}
