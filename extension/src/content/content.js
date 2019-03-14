/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, { enumerable: true, get: getter });
/******/ 		}
/******/ 	};
/******/
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = function(exports) {
/******/ 		if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 			Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 		}
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/
/******/ 	// create a fake namespace object
/******/ 	// mode & 1: value is a module id, require it
/******/ 	// mode & 2: merge all properties of value into the ns
/******/ 	// mode & 4: return value when already ns object
/******/ 	// mode & 8|1: behave like require
/******/ 	__webpack_require__.t = function(value, mode) {
/******/ 		if(mode & 1) value = __webpack_require__(value);
/******/ 		if(mode & 8) return value;
/******/ 		if((mode & 4) && typeof value === 'object' && value && value.__esModule) return value;
/******/ 		var ns = Object.create(null);
/******/ 		__webpack_require__.r(ns);
/******/ 		Object.defineProperty(ns, 'default', { enumerable: true, value: value });
/******/ 		if(mode & 2 && typeof value != 'string') for(var key in value) __webpack_require__.d(ns, key, function(key) { return value[key]; }.bind(null, key));
/******/ 		return ns;
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = "./src/content/content.js");
/******/ })
/************************************************************************/
/******/ ({

/***/ "./src/content/TranslationBox.js":
/*!***************************************!*\
  !*** ./src/content/TranslationBox.js ***!
  \***************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
class TranslationBox {
  constructor() {
    let boxElement = document.createElement('div');
    boxElement.className = 'masterlingo__translation-box';
    document.querySelector('body').appendChild(boxElement);
    this.domSelector = document.querySelector('.masterlingo__translation-box');
    this.isActive = false;
    this.activeClass = 'masterlingo__translation-box--active';
  }

  show(wordElement, flashcard = false) {
    this.active = true;
    this.domSelector.classList.add(this.activeClass);

    if (flashcard) {
      const translations = flashcard.inverted ? flashcard.original : flashcard.translations,
        original = !flashcard.inverted ? flashcard.original.join(', ') : flashcard.translations.join(', ');
      let translationsHtml = translations.map(translation => {
        return `<div class="masterlingo__translation">${translation}</div>`;
      });
      const rateButtons = [
        { name: 'incorrect', quality: 1 },
        { name: 'correct', quality: 4 },
        { name: 'easy', quality: 5 }
      ];
      const rateButtonsHtml = rateButtons.map(rateButton => {
        return `<div class="masterlingo__rating-button masterlingo__rating-button--easy" >${rateButton.name}</div>`;
      });

      // update DOM
      const volumeIconSrc = chrome.extension.getURL('assets/volume.svg');
      console.log(volumeIconSrc);
      this.domSelector.innerHTML = `<div class="masterlingo__original-word--container"><div class="masterlingo__original-word">${original}</div><img src="${volumeIconSrc}" class="masterling__original-word--audio material-icons" /></div><div class="masterlingo__translations-container">${translationsHtml}</div><div class="masterlingo__rating-buttons">${rateButtonsHtml}</div>`;
      this.setPosition(wordElement);
      // flashcard mode
    } else {
      // need to fetch translations first
    }
  }

  setPosition(wordElement) {
    const wordOffset = this.getOffset(wordElement);
    this.domSelector.style.left = wordOffset.left + wordElement.offsetWidth / 2 + 'px';
    this.domSelector.style.top = wordOffset.top + 'px';
  }

  getOffset(element) {
    const rect = element.getBoundingClientRect();
    return {
      left: rect.left + window.scrollX,
      top: rect.top + window.scrollY
    };
  }

  hide() {
    this.active = false;
    this.domSelector.classList.remove(this.activeClass);
  }
}

/* harmony default export */ __webpack_exports__["default"] = (TranslationBox);


/***/ }),

/***/ "./src/content/content.js":
/*!********************************!*\
  !*** ./src/content/content.js ***!
  \********************************/
/*! no exports provided */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _TranslationBox__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./TranslationBox */ "./src/content/TranslationBox.js");
/* harmony import */ var _supermemo__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./supermemo */ "./src/content/supermemo.js");



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
    translationBox = new _TranslationBox__WEBPACK_IMPORTED_MODULE_0__["default"]();
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


/***/ }),

/***/ "./src/content/supermemo.js":
/*!**********************************!*\
  !*** ./src/content/supermemo.js ***!
  \**********************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
function calcFactor(oldFac, quality) {
  let newFac = oldFac + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
  if (newFac > 2.5) newFac = 2.5;
  if (newFac < 1.3) newFac = 1.3;
  return newFac;
}

/**
 * @params {number} a number between 0~5 representing the quality of review. 0 is the worse while 5 is the best.
 * @params {number} the factor of last schedual
 */
function supermemo(quality, { schedule, factor, repetition }) {
  let curSchedule,
    newFactor,
    newRepetition,
    lastSchedule = schedule,
    lastFactor = factor;

  if (!repetition) {
    newRepetition = 1;
    newFactor = 2.5;
  } else {
    newRepetition = repetition + 1;
    console.log('got here');
    console.log(newRepetition);
  }
  if (quality < 3) {
    console.log('quality under 3');
    newRepetition = 0;
    curSchedule = 0;

    if (lastFactor) {
      newFactor = calcFactor(lastFactor, quality);
    }
  } else {
    if (lastFactor) {
      newFactor = calcFactor(lastFactor, quality);
      console.log(`new factor is ${newFactor}`);
    }
    curSchedule = Math.round(lastSchedule * newFactor);
  }

  if (newRepetition === 1) {
    if (quality < 5) {
      curSchedule = 2;
    } else {
      curSchedule = 6;
    }
  }
  let dueDate = new Date();
  if (quality >= 3) {
    console.log('1b');
    if (quality === 5) {
      curSchedule = Math.round(curSchedule * 1.4);
    }
    dueDate = addSubtractDate.add(dueDate, Math.round(curSchedule / 2), 'days');
    // only 1/2 of current schedule gets added compared to the app version where 100% gets added
  }

  console.log('before return' + newRepetition);
  return {
    factor: newFactor,
    schedule: curSchedule,
    isRepeatAgain: quality < 4,
    repetition: newRepetition,
    dueDate
  };
}

/* harmony default export */ __webpack_exports__["default"] = (supermemo);


/***/ })

/******/ });
//# sourceMappingURL=content.js.map