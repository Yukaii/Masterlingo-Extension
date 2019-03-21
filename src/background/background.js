import Flashcards from './Flashcards';
import mslApi from './msLingoApi';
import _ from 'lodash';

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
    console.log(request);
    switch (request.method) {
      case 'get':
        switch (request.function) {
          case 'config':
            sendResponse(config);
            break;
          case 'flashcards':
            console.log('bg script sending cards');
            console.log(flashcards);
            sendResponse({ ...flashcards });
            break;
          default:
            sendResponse('invalid function');
            break;
        }
        break;
      case 'put':
        switch (request.function) {
          case 'flashcard':
            flashcards.reviewFlashcards[request.payload._id] = request.payload;
            flashcards.allFlashcards[request.payload._id] = request.payload;
            sendResponse('success');
            break;
          default:
            sendResponse('invalid function');
            break;
        }
        break;
      case 'delete':
        switch (request.function) {
          case 'flashcard':
            console.log('about to delete a flashcard');
            console.log(flashcards.reviewFlashcards);
            flashcards.reviewFlashcards = _.omit(flashcards.reviewFlashcards, request.payload._id);
            flashcards.allFlashcards = _.omit(flashcards.allFlashcards, request.payload._id);
            console.log(flashcards.reviewFlashcards);
            sendResponse('success');
          default:
            sendResponse('invalid function');
            break;
        }
        break;
      case 'post':
        switch (request.function) {
          case 'flashcard':
            flashcards.reviewFlashcards[request.payload._id] = { ...request.payload, cannotRate: false };
            flashcards.allFlashcards[request.payload._id] = { ...request.payload, cannotRate: false };
            sendResponse('success');
          default:
            sendResponse('invalid function');
            break;
        }
        break;
      default:
        sendResponse('invalid method');
    }
  });
}

init();
