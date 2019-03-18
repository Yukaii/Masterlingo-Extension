import _ from 'lodash';

class TranslationBox {
  constructor(flashcards) {
    let boxElement = document.createElement('div');
    boxElement.className = 'masterlingo__translation-box';
    document.querySelector('body').appendChild(boxElement);
    this.domSelector = document.querySelector('.masterlingo__translation-box');
    this.activeClass = 'masterlingo__translation-box--active';
    this.initiate();
    this.currentFlashcard = {};
    this.flashcards = flashcards;
    console.log(flashcards);
  }

  initiate() {
    const volumeIconSrc = chrome.extension.getURL('assets/volume.svg');
    const rateButtons = [
      { name: 'incorrect', quality: 1 },
      { name: 'correct', quality: 4 },
      { name: 'easy', quality: 5 }
    ];
    const rateButtonsHtml = rateButtons
      .map(rateButton => {
        return `<div class="masterlingo__rating-button masterlingo__rating-button--${rateButton.name}" id="rateButton-${
          rateButton.quality
        }">${rateButton.name}</div>`;
      })
      .join('');

    this.domSelector.innerHTML = `<img src="${volumeIconSrc}" class="masterlingo__original-word--audio" /><div class="masterlingo__translations-container"></div><div class="masterlingo__rating-buttons">${rateButtonsHtml}</div>`;
    this.translationsDomSelector = document.querySelector('.masterlingo__translations-container');
    this.ratingsDomSelector = document.querySelector('.masterlingo__rating-buttons');
  }

  show(wordElement, flashcard) {
    console.log('about to show');
    console.log(flashcard);
    if (!flashcard) return;
    this.domSelector.classList.add(this.activeClass);
    const translations = flashcard.inverted ? flashcard.original.join(', ') : flashcard.translations.join(', ');
    let fontSize = 26;
    if (translations.length < 8) {
      fontSize = 32;
    } else if (translations.length > 18) {
      fontSize = 22;
    }
    console.log('changing font size');
    console.log(fontSize);
    if (flashcard.cannotRate) {
      this.ratingsDomSelector.style.display = 'none';
    } else {
      this.ratingsDomSelector.style.display = 'grid';
    }
    this.translationsDomSelector.style.fontSize = fontSize + 'px';
    this.translationsDomSelector.textContent = translations;
    this.setPosition(wordElement);
    this.currentFlashcard = flashcard;
  }

  hide() {
    this.domSelector.classList.remove(this.activeClass);
  }

  setPosition(wordElement) {
    const wordOffset = this.getOffset(wordElement);
    this.domSelector.style.left = wordOffset.left + wordElement.offsetWidth / 2 + 'px';
    this.domSelector.style.top = wordOffset.top - 15 + 'px';
    const boxOffset = this.getOffset(this.domSelector);
  }

  getOffset(element) {
    const rect = element.getBoundingClientRect();
    return {
      left: rect.left + window.scrollX,
      top: rect.top + window.scrollY
    };
  }
}

export default TranslationBox;
