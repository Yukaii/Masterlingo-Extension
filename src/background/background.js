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
    await flashcards.getFlashcards();
  } else {
  }
  addListeners();
  return config;
}

// handles request from content scripts
function addListeners() {
  chrome.runtime.onMessage.addListener(handleMessages);
  chrome.runtime.onMessageExternal.addListener(handleMessages);
}

function handleMessages(request, sender, sendResponse) {
  console.log('got message');
  console.log(request);
  switch (request.method) {
    case 'get':
      switch (request.function) {
        case 'config':
          sendResponse(config);
          break;
        case 'flashcards':
          if (!config.loggedIn) {
            sendResponse('you need to log in first');
          }
          sendResponse({ ...flashcards });
          break;
        case 'translations':
          if (!config.loggedIn) {
            sendResponse('you need to log in first');
          }
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
          init().then(config => {
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
          flashcards.reviewFlashcards = {};
          flashcards.allFlashcards = {};
          sendResponse('successfully logged out');
          break;
        default:
          sendResponse('invalid function');
          break;
      }
      break;
    case 'put':
      if (!config.loggedIn) {
        sendResponse('you need to log in first');
      }
      switch (request.function) {
        case 'flashcard':
          const id = request.payload._id;
          if (parseInt(request.quality) > 3) {
            flashcards.reviewFlashcards = _.omit(flashcards.reviewFlashcards, id);
          } else {
            flashcards.reviewFlashcards[id] = request.payload;
          }
          flashcards.allFlashcards[id] = request.payload;
          if (!request.offline) {
            mslApi
              .upadateFlashcardSrs(request.payload)
              .then(response => {
                sendResponse(response);
              })
              .catch(err => {
                sendResponse(err);
              });
            return true;
          } else {
            sendResponse('success');
            break;
          }
        case 'flashcards':
          const receivedFlashcards = request.payload;
          let reviewFlashcards = receivedFlashcards.filter(card => {
            return new Date(card.dueDate) - new Date() < 0;
          });
          flashcards = {
            allFlashcards: _.mapKeys(receivedFlashcards, '_id'),
            reviewFlashcards: _.mapKeys(reviewFlashcards, '_id')
          };
          sendResponse('flashcards in bg script successfully updated');
          break;
        case 'config':
          config = { ...config, ...request.payload.data };
          sendResponse('successs');
          break;
        default:
          sendResponse('invalid function');
          break;
      }
      break;
    case 'delete':
      if (!config.loggedIn) {
        sendResponse('you need to log in first');
      }
      switch (request.function) {
        case 'flashcard':
          flashcards.reviewFlashcards = _.omit(flashcards.reviewFlashcards, request.payload._id);
          flashcards.allFlashcards = _.omit(flashcards.allFlashcards, request.payload._id);
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
      if (!config.loggedIn) {
        sendResponse('you need to log in first');
      }
      switch (request.function) {
        case 'flashcard':
          if (!request.offline) {
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
                sendResponse(flashcard);
              }
              sendResponse(false);
            });
          } else {
            init().then(config => {
              if (config) {
                sendResponse(config);
              } else {
                sendResponse(false);
              }
            });
          }
          return true;

        default:
          sendResponse('invalid function');
          break;
      }
      break;
    default:
      sendResponse('invalid method');
  }
  return true;
}

init();
