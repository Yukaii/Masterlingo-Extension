import _ from 'lodash';
import axios from 'axios';
import textToSpeech from './responsiveVoice';

class newCardBox {
  constructor(config) {
    let boxElement = document.createElement('div');
    boxElement.className = 'masterlingo__new-card-box';
    document.querySelector('body').appendChild(boxElement);
    this.domSelector = document.querySelector('.masterlingo__new-card-box');
    this.stage = 'hidden';
    this.term = '';
    this.translationsToSave = [];
    this.wordElement = null;
    this.config = config;
    this.flip = false;
  }

  showButton(selection) {
    let selectedText = selection.toString().trim();
    if (selectedText.length < 1) {
      return;
    }
    let wordElement = selection.getRangeAt(0);
    if (!this.domSelector.contains(wordElement.commonAncestorContainer)) {
      this.wordElement = wordElement;
      this.domSelector.style.display = 'flex';
      this.domSelector.classList.remove('masterlingo__new-card--translations');
      this.domSelector.classList.add('masterlingo__new-card--button');
      this.domSelector.classList.add('masterlingo__new-card-box--active');
      this.setPosition(wordElement);
      this.domSelector.innerHTML = `M<span>L</span>`;
      this.domSelector.style.transform = `translate(-50%, 100%)`;

      this.term = selectedText;
      this.stage = 'button';
    }
  }

  async showTranslations(foreign) {
    let translationsHTML;

    this.stage = 'translations';
    this.domSelector.innerHTML = `<svg class="masterlingo__spinner" width="30px" height="30px" viewBox="0 0 66 66" xmlns="http://www.w3.org/2000/svg"><circle class="path" fill="none" stroke-width="6" stroke-linecap="round" cx="33" cy="33" r="30"></circle>
     </svg>`;
    this.domSelector.classList.replace('masterlingo__new-card--button', 'masterlingo__new-card--translations');
    if (this.flip) {
      this.domSelector.style.transform = `translate(-50%, ${this.height + 25 + 'px'})`;
      this.domSelector.classList.add('masterlingo__flip-after');
    } else {
      this.domSelector.style.transform = `translate(-50%, -100%)`;
    }
    if (this.term.length > 80) {
      this.domSelector.innerHTML = `Text too long`;
      this.domSelector.classList.add('masterlingo__error');
      return;
    }
    this.domSelector.style.top = parseInt(this.domSelector.style.top.split('.')[0]) - 5 + 'px';

    chrome.runtime.sendMessage({ method: 'get', function: 'translations', payload: this.term }, response => {
      if (!response) return;
      const data = response;
      if (data.translations && !data.error && data.invertable) {
        if (this.config.autoAudio) textToSpeech(this.term, foreign);
        translationsHTML = data.translations.slice(0, 6).map(translation => {
          return `<div class="masterlingo__new-card--translation-container"><div class="masterlingo__new-card--translation">${translation}</div></div>`;
        });
        this.domSelector.innerHTML = `<div class="masterlingo__new-card--container"><div class="masterlingo__new-card--header"><div class="masterlingo__new-card--term" >${
          this.term
        }</div>
        <div class="masterlingo__new-card--pos" >${
          data.partOfSpeech[0] ? data.partOfSpeech[0].toLowerCase() : ''
        }</div><i class="material-icons masterlingo__volume-icon--new">volume_up</i></div>${translationsHTML.join(
          ''
        )}</div>`;
        if (this.term.length > 12) {
          document.querySelector('.masterlingo__new-card--term').style.fontSize = '17px';
        } else {
          document.querySelector('.masterlingo__new-card--term').style.fontSize = '25px';
        }

        Array.from(document.getElementsByClassName('masterlingo__new-card--translation')).forEach(translationEl => {
          translationEl.addEventListener('click', () => {
            if (translationEl.classList.contains('saved-translation')) {
              this.translationsToSave.splice(this.translationsToSave.indexOf(translationEl.textContent), 1);
              translationEl.classList.remove('saved-translation');
            } else if (this.translationsToSave.length < 4) {
              this.translationsToSave.push(translationEl.textContent);
              translationEl.classList.add('saved-translation');
            } else {
              alert(`You cannot save more than 4 translations at once, sorry :(`);
            }
          });
        });
        document.querySelector('.masterlingo__volume-icon--new').addEventListener('click', () => {
          textToSpeech(this.term, foreign);
        });
      } else {
        this.domSelector.innerHTML = `No translations found, sorry.`;
        this.domSelector.classList.add('masterlingo__error');
        if (this.config.autoAudio) textToSpeech(this.term, foreign);
      }
    });
  }

  async hide() {
    this.stage = 'hidden';
    this.domSelector.classList.remove('masterlingo__new-card--button');
    this.domSelector.classList.remove('masterlingo__error');
    this.domSelector.classList.remove('masterlingo__new-card-box--active');
    this.domSelector.classList.remove('masterlingo__flip-after');
    this.domSelector.style.transform = 'transform: translate(0)';
    this.domSelector.style.display = 'none';
    this.translationsToSave = [];
    this.wordElement = null;
    this.term = '';
  }

  setPosition(wordElement) {
    const wordOffset = this.getOffset(wordElement);
    if (wordOffset.left === 0 || wordOffset.top === 0 || wordOffset.width === 0) {
      this.hide();
      return;
    }
    if (wordOffset.top - window.scrollY < 200) {
      this.flip = true;
      this.height = wordOffset.height;
    } else {
      this.flip = false;
    }
    this.domSelector.style.left = wordOffset.left + wordOffset.width / 2 + 'px';
    this.domSelector.style.top = wordOffset.top - 5 + 'px';
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

export default newCardBox;
