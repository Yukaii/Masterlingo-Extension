import TranslationBox from './TranslationBox';
import NewCardBox from './NewCardBox';
import supermemo from './supermemo';
import axios from 'axios';
import _ from 'lodash';
/*
 ResponsiveVoice JS v1.5.14

 (c) 2015-2019 LearnBrite

 License: http://responsivevoice.org/license
*/

function runContentScript() {
  let config = { native: '', foreign: '', loggedIn: false },
    pageElements,
    flashcards,
    translationBox,
    newCardBox;
  const spanCode = '-198987';

  const readyStateCheckInterval = setInterval(function() {
    if (document.readyState === 'complete') {
      clearInterval(readyStateCheckInterval);

      console.log('Hello. This message was sent from scripts/inject.js');
      // ----------------------------------------------------------

      chrome.runtime.sendMessage({ method: 'get', function: 'config' }, function(response) {
        if (response) {
          console.log(response);
          config = { ...config, foreign: response.foreign, native: response.native, loggedIn: true };
          pageElements = document.querySelectorAll('p');
          init();
          console.log(flashcards);
        }
      });
    }
  }, 10);
  async function init() {
    getFlashcards(highlightPageWords);
    translationBox = new TranslationBox();
    newCardBox = new NewCardBox();
    addEventListeners();
  }

  function getFlashcards() {
    // get flashcards from bg script
    chrome.runtime.sendMessage({ method: 'get', function: 'flashcards' }, response => {
      if (response) {
        console.log('response is:');
        console.log(response);
        flashcards = response;
        highlightPageWords(flashcards.allFlashcards);
      } else {
        console.log(`couldn't get flashcards`);
      }
    });
  }

  function highlightPageWords(flashcards) {
    let elementHtml;
    for (let pageElement of pageElements) {
      // loop over all elements
      elementHtml = pageElement.innerHTML;
      let noDuplicatesArray = [];
      Object.values(flashcards).forEach(flashcard => {
        // loop over all cards
        let originalWords = flashcard.inverted ? flashcard.translations : flashcard.original;

        originalWords.forEach(originalWord => {
          if (noDuplicatesArray.includes(originalWord)) {
            return;
          } else {
            noDuplicatesArray.push(originalWord);
          }
          // loop over all words in card
          let regularExp = new RegExp(`\\b(${originalWord})\\b`, 'gi'); // set regular expression to replace words
          elementHtml = elementHtml.replace(regularExp, match => {
            return `<mark data-flashcardid=${flashcard._id} >${match + spanCode}</mark>`;
          }); // update element html
        });
      });
      pageElement.innerHTML = elementHtml; // update element html
    }
    // get rid of a tags styling, add classes
    console.log('filtering anchors');
    filterAnchorsOut();
  }

  function filterAnchorsOut() {
    let alreadyHighlightedList = document.getElementsByClassName('masterlingo__marked-word');
    Array.from(alreadyHighlightedList).forEach(alreadyHighlighted => {
      alreadyHighlighted.addEventListener('click', handleMarkedWordClick);
    });
    let listOfWords = document.getElementsByTagName('mark');
    Array.from(listOfWords).forEach(curr => {
      if (curr.textContent.endsWith(spanCode)) {
        if (curr.parentNode.tagName !== 'A') {
          console.log('got heree');
          curr.className = 'masterlingo__marked-word';
          curr.addEventListener('click', handleMarkedWordClick);
        }
        curr.textContent = curr.textContent.split('-')[0];
      }
    });
  }

  function handleMarkedWordClick(e) {
    const clickedWordEl = e.target;
    const flashcardId = clickedWordEl.dataset.flashcardid;
    const flashcard = flashcards.allFlashcards[flashcardId];
    translationBox.show(clickedWordEl, flashcard);
  }

  function addEventListeners() {
    document.addEventListener('click', function(event) {
      let isNotClickInside = !translationBox.domSelector.contains(event.target),
        isNotWordClick = !event.target.classList.contains('masterlingo__marked-word');
      if (isNotClickInside && isNotWordClick) {
        console.log('clicked outside');
        translationBox.hide();
        //the click was outside the specifiedElement, do something
      }
    });

    function updateBgFlashcards(method, flashcard) {
      chrome.runtime.sendMessage({ method, function: 'flashcard', payload: flashcard }, response => {
        console.log('bg said' + response);
      });
    }

    function updateHighlightedWords(method, flashcard) {
      switch (method) {
        case 'delete':
          let highlightedWords = document.getElementsByClassName('masterlingo__marked-word');
          Array.from(highlightedWords).forEach(element => {
            if (element.dataset.flashcardid === flashcard._id) {
              console.log('found a match');
              element.outerHTML = element.innerHTML;
            }
          });
          break;
        case 'add':
          highlightPageWords({ [flashcard._id]: flashcard });
          break;
      }
    }

    Array.from(document.getElementsByClassName('masterlingo__rating-button')).forEach(button => {
      button.addEventListener('click', async e => {
        translationBox.hide();
        console.log(translationBox.currentFlashcard);
        if (translationBox.currentFlashcard._id) {
          console.log('rated!');
          // handle card rating click
          console.log(translationBox.flashcards);
          const quality = e.target.id.split('-')[1];
          const supermemoResults = supermemo(quality, translationBox.currentFlashcard);
          console.log(flashcards);
          let method = 'delete';
          if (quality > 3) {
            updateHighlightedWords('delete', translationBox.currentFlashcard);
            flashcards.allFlashcards = _.omit(flashcards.allFlashcards, translationBox.currentFlashcard._id);
          } else {
            method = 'put';
            flashcards.allFlashcards[translationBox.currentFlashcard._id] = {
              ...translationBox.currentFlashcard,
              ..._.omit(supermemoResults, 'isRepeatAgain'),
              cannotRate: true
            };
            console.log(flashcards.allFlashcards._id);
          }
          console.log('this is the current flashcard');
          console.log(translationBox.currentFlashcard);
          updateBgFlashcards(method, translationBox.currentFlashcard);
          console.log('UPDATING BG FLASHCARDS');
          const response = await axios.put(
            `https://masterlingoapp.com/api/srs/${translationBox.currentFlashcard._id}`,
            _.omit(supermemoResults, 'isRepeatAgain')
          );
          console.log(response);
        }
      });
    });

    function handleClickOutside(e) {
      console.log('handleClick outside');
      const isNotClickInside = !newCardBox.domSelector.contains(e.target);
      if (isNotClickInside && window.getSelection().toString.length < 1 && e.target.textContent !== 'L') {
        document.removeEventListener('click', handleClickOutside);
        if (newCardBox.translationsToSave.length > 0) {
          const translations = newCardBox.translationsToSave,
            original = [newCardBox.term.trim()];
          axios
            .post('https://masterlingoapp.com/api/flashcards', {
              translations,
              inverted: false,
              original
            })
            .then(response => {
              console.log(response);
              const flashcard = {
                translations,
                inverted: false,
                original,
                repetition: null,
                schedule: null,
                factor: null,
                _id: response.data[0],
                cannotRate: true
              };
              updateHighlightedWords('add', flashcard);
              flashcards.allFlashcards[response.data[0]] = flashcard;
              console.log(flashcards);
              updateBgFlashcards('post', flashcard);
            });
        }
        newCardBox.hide();
      }
    }

    document.addEventListener('mouseup', function(e) {
      let selection = window.getSelection(); //get the text range
      if (selection.toString()) {
        newCardBox.showButton(selection);
        setTimeout(() => {
          document.addEventListener('click', handleClickOutside);
        }, 500);
      }
    });
    newCardBox.domSelector.addEventListener('click', e => {
      if (newCardBox.stage === 'button') {
        console.log('clicked button');
        newCardBox.showTranslations(config.foreign);
      }
    });
    document.querySelector('.masterlingo__delete-icon').addEventListener('click', () => {
      if (confirm('Are you sure you want to delete this card?')) {
        console.log('removing');
        updateHighlightedWords('delete', translationBox.currentFlashcard);
        flashcards.allFlashcards = _.omit(flashcards.allFlashcards, translationBox.currentFlashcard._id);
        updateBgFlashcards('delete', translationBox.currentFlashcard);
        translationBox.hide();
        axios
          .delete(`https://masterlingoapp.com/api/flashcards/${translationBox.currentFlashcard._id}`)
          .then(result => {
            console.log('db record deleted successfully');
            console.log(result);
          })
          .catch(err => {
            console.log(err);
          });
      }
    });
  }
}

runContentScript();
