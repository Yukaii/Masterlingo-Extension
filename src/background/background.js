import Flashcards from './Flashcards';
import mslApi from './msLingoApi';

let config = {
    loggedIn: false,
    native: '',
    foreign: ''
  },
  flashcards = new Flashcards();

async function init() {
  const user = await mslApi.login();
  if (user) {
    config.loggedIn = true;
    config.native = user.native;
    config.foreign = user.foreign;
    await flashcards.getFlashcards();
    addListeners();
  } else {
    console.log('could not log in');
  }
}

// handles request from content scripts
function addListeners() {
  chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    console.log('bg script got message');

    switch (request.method) {
      case 'get':
        switch (request.function) {
          case 'config':
            sendResponse(config);
          case 'flashcards':
            console.log('bg script sending cards');
            console.log(flashcards);
            sendResponse({ ...flashcards });
        }
    }
  });
}

init();
