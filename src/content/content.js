import TranslationBox from './TranslationBox';
import NewCardBox from './NewCardBox';
import supermemo from './supermemo';
import _ from 'lodash';

function runContentScript() {
  let config = {
      native: '',
      foreign: '',
      loggedIn: false,
      highlightElements: 'paragraphs',
      activePages: 'targetLanguage',
      autoAudio: true
    },
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
          getConfig();
        }
      });
    }
  }, 10);

  async function init() {
    console.log(document.documentElement.lang);
    if (
      config.activePages === 'targetLanguage' &&
      !document.documentElement.lang.includes(config.foreign) &&
      document.documentElement.lang
    ) {
      console.log('this page is not in target language, stop content script');
      return;
    }
    let targetElements = 'p';
    if (config.highlightElements === 'all') {
      targetElements = 'p, span, h1, h2, h3, h4, h5, h6';
    }
    console.log(targetElements);
    pageElements = document.querySelectorAll(targetElements);
    getFlashcards(highlightPageWords);
    translationBox = new TranslationBox(config);
    newCardBox = new NewCardBox(config);
    addEventListeners();
  }

  function getConfig() {
    // Use default value color = 'red' and likesColor = true.
    chrome.storage.sync.get(
      {
        autoAudio: true,
        activePages: 'targetLanguage',
        highlightElements: 'paragraphs'
      },
      function(settings) {
        config.autoAudio = settings.autoAudio;
        config.activePages = settings.activePages;
        config.highlightElements = settings.highlightElements;
        init();
      }
    );
  }

  function getFlashcards() {
    // get flashcards from bg script
    chrome.runtime.sendMessage({ method: 'get', function: 'flashcards' }, response => {
      if (response) {
        console.log('response is:');
        console.log(response);
        flashcards = response;
        highlightPageWords(flashcards.reviewFlashcards);
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
      let changed = false;
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
            changed = true;
            return `<mark data-flashcardid=${flashcard._id} >${match + spanCode}</mark>`;
          }); // update element html
        });
      });
      if (changed) {
        pageElement.innerHTML = elementHtml; // update element html
      }
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
    const flashcard = flashcards.reviewFlashcards[flashcardId];
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

    function updateBgFlashcards(method, flashcard, quality = null) {
      chrome.runtime.sendMessage({ method, function: 'flashcard', payload: flashcard, quality }, response => {
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
          const flashcardId = translationBox.currentFlashcard._id;
          const supermemoResults = supermemo(quality, translationBox.currentFlashcard);
          console.log(flashcards);
          if (quality > 3) {
            updateHighlightedWords('delete', translationBox.currentFlashcard);
            flashcards.reviewFlashcards = _.omit(flashcards.reviewFlashcards, flashcardId);
          } else {
            flashcards.reviewFlashcards[flashcardId] = {
              ...translationBox.currentFlashcard,
              ..._.omit(supermemoResults, 'isRepeatAgain'),
              cannotRate: true
            };
            console.log(flashcards.reviewFlashcards._id);
          }
          flashcards.allFlashcards[flashcardId] = {
            ...translationBox.currentFlashcard,
            ..._.omit(supermemoResults, 'isRepeatAgain'),
            cannotRate: true
          };
          console.log(translationBox.currentFlashcard);
          updateBgFlashcards(
            'put',
            { ...translationBox.currentFlashcard, ..._.omit(supermemoResults, 'isRepeatAgain') },
            quality
          );
          console.log('UPDATING BG FLASHCARDS');
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
          chrome.runtime.sendMessage(
            {
              method: 'post',
              function: 'flashcard',
              payload: { original, translations, inverted: false }
            },
            id => {
              console.log(id);
              const flashcard = {
                translations,
                inverted: false,
                original,
                repetition: null,
                schedule: null,
                factor: null,
                _id: id,
                cannotRate: true,
                originalLanguage: config.foreign,
                translationLanguage: config.native
              };
              updateHighlightedWords('add', flashcard);
              flashcards.reviewFlashcards[id] = flashcard;
              flashcards.allFlashcards[id] = flashcard;
              console.log(flashcards);
            }
          );
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

    function checkForExisting(term) {
      console.log('heree2');
      let card;
      Object.values(flashcards.allFlashcards).forEach(flashcard => {
        let textArray = flashcard.inverted ? flashcard.translations : flashcard.original;
        console.log(term);
        let tempCard = flashcard;
        textArray.forEach(word => {
          if (word.toLowerCase() === term.toLowerCase()) {
            card = tempCard;
          }
        });
      });
      return card;
    }
    newCardBox.domSelector.addEventListener('click', e => {
      if (newCardBox.stage === 'button') {
        console.log('clicked button');
        const existingFlashcard = checkForExisting(newCardBox.term);
        console.log('does card exist?');
        if (existingFlashcard) {
          const wordElement = newCardBox.wordElement;
          newCardBox.hide();
          translationBox.show(wordElement, {
            ...existingFlashcard,
            cannotRate: existingFlashcard.cannotRate || !(new Date(existingFlashcard.dueDate) - new Date() < 0)
          });
          e.stopPropagation();
        } else {
          newCardBox.showTranslations(config.foreign);
        }
      }
    });
    document.querySelector('.masterlingo__delete-icon').addEventListener('click', () => {
      if (confirm('Are you sure you want to delete this card?')) {
        console.log('removing');
        updateHighlightedWords('delete', translationBox.currentFlashcard);
        flashcards.reviewFlashcards = _.omit(flashcards.reviewFlashcards, translationBox.currentFlashcard._id);
        flashcards.allFlashcards = _.omit(flashcards.allFlashcards, translationBox.currentFlashcard._id);
        updateBgFlashcards('delete', translationBox.currentFlashcard);
        translationBox.hide();
      }
    });
  }
}

runContentScript();
