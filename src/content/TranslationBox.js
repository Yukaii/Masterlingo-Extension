import _ from 'lodash';
import textToSpeech from './responsiveVoice';

class TranslationBox {
  constructor(config) {
    let boxElement = document.createElement('div');
    boxElement.className = 'masterlingo__translation-box';
    document.querySelector('body').appendChild(boxElement);
    this.domSelector = document.querySelector('.masterlingo__translation-box');
    this.activeClass = 'masterlingo__translation-box--active';
    this.initiate();
    this.config = config;
    this.flip = false;
    this.height = 0;
  }

  initiate() {
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
    this.domSelector.innerHTML = `<i class="material-icons masterlingo__volume-icon">volume_up</i><i class="material-icons masterlingo__delete-icon">delete</i><div class="masterlingo__translations-container"></div><div class="masterlingo__rating-buttons">${rateButtonsHtml}</div>`;
    this.translationsDomSelector = document.querySelector('.masterlingo__translations-container');
    this.ratingsDomSelector = document.querySelector('.masterlingo__rating-buttons');
  }

  show(wordElement, flashcard) {
    this.setPosition(wordElement);
    this.domSelector.classList.remove('masterlingo__flip-after');

    if (!flashcard) return;
    this.domSelector.classList.add(this.activeClass);
    if (this.flip) {
      this.domSelector.style.transform = `translate(-50%, ${this.height + 25 + 'px'})`;
      this.domSelector.classList.add('masterlingo__flip-after');
    } else {
      this.domSelector.style.transform = `translate(-50%, -100%)`;
    }
    const translations = flashcard.inverted ? flashcard.original.join(', ') : flashcard.translations.join(', ');
    const original = !flashcard.inverted ? flashcard.original.join(', ') : flashcard.translations.join(', ');
    let fontSize = 26;
    if (translations.length < 8) {
      fontSize = 32;
    } else if (translations.length > 18) {
      fontSize = 22;
    }
    if (flashcard.cannotRate) {
      this.ratingsDomSelector.style.display = 'none';
    } else {
      this.ratingsDomSelector.style.display = 'grid';
    }
    this.translationsDomSelector.style.fontSize = fontSize + 'px';
    this.translationsDomSelector.textContent = translations;
    this.currentFlashcard = flashcard;
    if (this.config.autoAudio) textToSpeech(original, flashcard.originalLanguage);
    document.querySelector('.masterlingo__volume-icon').addEventListener('click', () => {
      textToSpeech(original, flashcard.originalLanguage);
    });
  }

  hide() {
    this.domSelector.classList.remove(this.activeClass);
    this.domSelector.classList.remove('masterlingo__flip-after');
  }

  setPosition(wordElement) {
    const wordOffset = this.getOffset(wordElement);
    const elWidth = wordElement.offsetWidth || wordOffset.width;

    if (wordOffset.top - window.scrollY < 200) {
      this.flip = true;
      this.height = wordOffset.height;
    } else {
      this.flip = false;
    }
    this.domSelector.style.left = wordOffset.left + elWidth / 2 + 'px';
    this.domSelector.style.top = wordOffset.top - 10 + 'px';
  }

  getOffset(element) {
    const rect = element.getBoundingClientRect();
    return {
      left: rect.left + window.scrollX,
      top: rect.top + window.scrollY,
      width: rect.width,
      height: rect.height
    };
  }
}

export default TranslationBox;
