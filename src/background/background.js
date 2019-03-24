import Flashcards from './Flashcards';
import mslApi from './msLingoApi';
import _ from 'lodash';

let config = {
    loggedIn: false,
    native: '',
    foreign: '',
    username: ''
  },
  flashcards = new Flashcards();

async function init() {
  const user = await mslApi.login();
  if (user) {
    config.loggedIn = true;
    config.native = user.native;
    config.foreign = user.foreign;
    config.username = user.name;
    console.log(user);
    await flashcards.getFlashcards();
  } else {
    console.log('could not log in');
  }
  addListeners();
  return config;
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
          case 'translations':
            mslApi
              .getTranslations(request.payload)
              .then(response => {
                sendResponse(response);
              })
              .catch(err => {
                sendResponse(err);
              });
            return true;
          case 'login':
            if (config.loggedIn) {
              sendResponse(config);
              break;
            }
            init().then(config => {
              console.log('this is the config');
              console.log(config);
              if (config) {
                sendResponse(config);
              } else {
                sendResponse(false);
              }
            });
            return true;
          case 'logout':
            config.loggedIn = false;
            config.foreign = '';
            config.native = '';
            config.username = '';
            flashcards = {};
            sendResponse('success');
            break;
          default:
            sendResponse('invalid function');
            break;
        }
        break;
      case 'put':
        switch (request.function) {
          case 'flashcard':
            const id = request.payload._id;
            if (parseInt(request.quality) > 3) {
              flashcards.reviewFlashcards = _.omit(flashcards.reviewFlashcards, id);
            } else {
              flashcards.reviewFlashcards[id] = request.payload;
            }
            flashcards.allFlashcards[id] = request.payload;
            mslApi
              .upadateFlashcardSrs(request.payload)
              .then(response => {
                console.log(response);
                sendResponse(response);
              })
              .catch(err => {
                console.log(err);
                sendResponse(err);
              });
            return true;
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
            mslApi
              .deleteFlashcard(request.payload)
              .then(() => {
                sendResponse('success');
              })
              .catch(err => {
                sendResponse(err);
              });
            return true;
          default:
            sendResponse('invalid function');
            break;
        }
        break;
      case 'post':
        switch (request.function) {
          case 'flashcard':
            mslApi.createFlashcard(request.payload).then(data => {
              if (data[0]) {
                const id = data[0];
                const flashcard = {
                  translations: request.payload.translations,
                  inverted: false,
                  original: request.payload.original,
                  repetition: null,
                  schedule: null,
                  factor: null,
                  _id: id,
                  cannotRate: false,
                  originalLanguage: config.foreign,
                  translationLanguage: config.native
                };
                flashcards.reviewFlashcards[id] = flashcard;
                flashcards.allFlashcards[id] = flashcard;
                sendResponse(id);
              }
              sendResponse(false);
            });
            return true;
            break;
          default:
            sendResponse('invalid function');
            break;
        }
        break;
      default:
        sendResponse('invalid method');
    }
    return true;
  });
}

init();
