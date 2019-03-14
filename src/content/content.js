import TranslationBox from './TranslationBox';
import supermemo from './supermemo';

function runContentScript() {
  let config = { native: '', foreign: '', loggedIn: false },
    flashcards,
    translationBox;
  const spanCode = '-198987';

  const readyStateCheckInterval = setInterval(function() {
    if (document.readyState === 'complete') {
      clearInterval(readyStateCheckInterval);

      // ----------------------------------------------------------
      // This part of the script triggers when page is done loading
      console.log('Hello. This message was sent from scripts/inject.js');
      // ----------------------------------------------------------

      chrome.runtime.sendMessage({ method: 'get', function: 'config' }, function(response) {
        if (response) {
          console.log(response);
          config = { ...config, foreign: response.foreign, native: response.native, loggedIn: true };
          init();
          console.log(flashcards);
        }
      });
    }
  }, 100);

  async function init() {
    getFlashcards(highlightPageWords);
    translationBox = new TranslationBox();
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
    let pageElements = document.querySelectorAll('p, span'),
      elementHtml;
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
    filterAnchorsOut();
  }

  function filterAnchorsOut() {
    let listOfWords = document.getElementsByTagName('mark');
    Array.from(listOfWords).forEach(curr => {
      if (curr.textContent.endsWith(spanCode)) {
        if (curr.parentNode.tagName !== 'A') {
          console.log('got here');
          curr.className = 'masterlingo__marked-word';
          curr.addEventListener('click', handleMarkedWordClick);
        }
        curr.textContent = curr.textContent.split('-')[0];
      }
    });
  }

  function handleMarkedWordClick(e) {
    console.log('word clicked');
    const clickedWordEl = e.target;
    const flashcardId = clickedWordEl.dataset.flashcardid;
    const flashcard = flashcards.allFlashcards[flashcardId];
    console.log(flashcard);
    translationBox.show(clickedWordEl, flashcard);
  }
}

runContentScript();
