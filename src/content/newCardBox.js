import _ from 'lodash';
import axios from 'axios';

class newCardBox {
  constructor() {
    let boxElement = document.createElement('div');
    boxElement.className = 'masterlingo__new-card-box';
    document.querySelector('body').appendChild(boxElement);
    this.domSelector = document.querySelector('.masterlingo__new-card-box');
    this.stage = 'hidden';
    this.term = '';
    this.translationsToSave = [];
  }

  showButton(selection) {
    let wordElement = selection.getRangeAt(0);
    console.log(wordElement);

    if (!this.domSelector.contains(wordElement.commonAncestorContainer)) {
      console.log(wordElement);
      this.domSelector.classList.remove('masterlingo__new-card--translations');
      this.domSelector.classList.add('masterlingo__new-card--button');
      this.domSelector.classList.add('masterlingo__new-card-box--active');
      this.setPosition(wordElement);
      this.domSelector.innerHTML = `M<span>L</span>`;
      this.term = selection.toString();
      this.stage = 'button';
    }
  }

  async showTranslations() {
    let translationsHTML;
    this.stage = 'translations';
    this.domSelector.classList.replace('masterlingo__new-card--button', 'masterlingo__new-card--translations');
    const { data } = await axios.get(`https://masterlingoapp.com/api/translate/${this.term}`, {
      headers: {
        inverted: false
      }
    });
    if (data.translations) {
      translationsHTML = data.translations.slice(0, 6).map(translation => {
        return `<div class="masterlingo__new-card--translation-container"><div class="masterlingo__new-card--translation">${translation}</div></div>`;
      });
    }
    const volumeIconSrc = chrome.extension.getURL('assets/volume.svg');
    this.domSelector.innerHTML = `<div class="masterlingo__new-card--container"><div class="masterlingo__new-card--header"><div class="masterlingo__new-card--term" >${
      this.term
    }</div>
    <div class="masterlingo__new-card--pos" >${data.partOfSpeech[0].toLowerCase()}</div><img src="${volumeIconSrc}" class="masterlingo__new-card--audio" /></div>${translationsHTML.join(
      ''
    )}</div>`;
    console.log(data);
    Array.from(document.getElementsByClassName('masterlingo__new-card--translation')).forEach(translationEl => {
      translationEl.addEventListener('click', () => {
        if (translationEl.classList.contains('saved-translation')) {
          this.translationsToSave.splice(this.translationsToSave.indexOf(translationEl.textContent), 1);
          translationEl.classList.remove('saved-translation');
        } else if (this.translationsToSave.length < 4) {
          this.translationsToSave.push(translationEl.textContent);
          translationEl.classList.add('saved-translation');
        } else {
          alert(`You cannot save more than 4 translations at once, sorry :()`);
        }
      });
    });
  }

  async hide() {
    this.stage = 'hidden';
    this.domSelector.classList.remove('masterlingo__new-card--button');
    this.domSelector.classList.remove('masterlingo__new-card-box--active');
    if (this.translationsToSave.length > 0) {
      const response = await axios.post('https://masterlingoapp.com/api/flashcards', {
        translations: this.translationsToSave,
        inverted: false,
        original: [this.term]
      });
      console.log(response);
      this.translationsToSave = [];
    }
    this.term = '';
  }

  setPosition(wordElement) {
    const wordOffset = this.getOffset(wordElement);
    console.log(wordElement);
    this.domSelector.style.left = wordOffset.left + wordOffset.width / 2 + 'px';
    this.domSelector.style.top = wordOffset.top - 15 + 'px';
  }

  getOffset(element) {
    const rect = element.getBoundingClientRect();
    console.log(rect);
    return {
      left: rect.left + window.scrollX,
      top: rect.top + window.scrollY,
      width: rect.width
    };
  }
}

export default newCardBox;
