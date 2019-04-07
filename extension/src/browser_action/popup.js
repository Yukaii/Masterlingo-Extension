const rootSelector = document.querySelector('#root');

chrome.runtime.sendMessage({ method: 'get', function: 'config' }, function(response) {
  if (response.loggedIn) {
    rootSelector.innerHTML = `<div class="greeting"> Hi, ${
      response.username
    }! </div> <div class="loggedIn"> Highlight a word to start. </div>
      <div class="icons-container">
      <a target="_blank" href="chrome-extension://fbfmjjebfpcefapmipcbckbdpfnjhfmj/src/options/options.html" class="nostyle icon__settings icon__container"><i class="nostyle material-icons icon">settings</i>Options</a>
      <a target="_blank" href="https://masterlingoapp.com" class="nostyle icon__practise icon__container"><i class="material-icons icon">school</i>Review</a><a target="_blank" href="https://masterlingoapp.com/collection" class="nostyle icon__practise icon__container"><i class="material-icons icon">layers</i>Collection</a></div>
    `;
  } else {
    rootSelector.innerHTML = `<div class="logo">Masterlingo <img src="chrome-extension://fbfmjjebfpcefapmipcbckbdpfnjhfmj/assets/logo.svg" class="logo__img"></div><div class="sign-in"> Sign in to start using the extension. </div><a href="https://masterlingoapp.com/signin" class="button log-in">Sign in</a>`;
    document.querySelector('.log-in').addEventListener('click', () => {
      logIn();
    });
  }
});

function logIn() {
  window.open('https://masterlingoapp.com/signin');
}
