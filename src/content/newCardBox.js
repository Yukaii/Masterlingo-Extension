import _ from 'lodash';
import axios from 'axios';
import textToSpeech from './responsiveVoice';

class newCardBox {
  constructor() {
    let boxElement = document.createElement('div');
    boxElement.className = 'masterlingo__new-card-box';
    document.querySelector('body').appendChild(boxElement);
    this.domSelector = document.querySelector('.masterlingo__new-card-box');
    this.stage = 'hidden';
    this.term = '';
    this.translationsToSave = [];
    this.wordElement = null;
  }

  showButton(selection) {
    console.log([selection.toString().trim()]);
    let wordElement = selection.getRangeAt(0);
    if (!this.domSelector.contains(wordElement.commonAncestorContainer)) {
      console.log(wordElement);
      this.wordElement = wordElement;
      this.domSelector.style.display = 'flex';
      this.domSelector.classList.remove('masterlingo__new-card--translations');
      this.domSelector.classList.add('masterlingo__new-card--button');
      this.domSelector.classList.add('masterlingo__new-card-box--active');
      this.setPosition(wordElement);
      this.domSelector.innerHTML = `M<span>L</span>`;
      this.term = selection.toString().trim();
      console.log('THIS IS THE TERM');
      console.log(this.term);
      this.stage = 'button';
    }
  }

  async showTranslations(foreign) {
    console.log('STARTING TRANSLATIONS');
    let translationsHTML;

    this.stage = 'translations';
    this.domSelector.innerHTML = `<svg class="masterlingo__spinner" width="30px" height="30px" viewBox="0 0 66 66" xmlns="http://www.w3.org/2000/svg"><circle class="path" fill="none" stroke-width="6" stroke-linecap="round" cx="33" cy="33" r="30"></circle>
     </svg>`;
    this.domSelector.classList.replace('masterlingo__new-card--button', 'masterlingo__new-card--translations');
    const { data } = await axios.get(`https://masterlingoapp.com/api/translate/${this.term}`, {
      headers: {
        inverted: false
      }
    });
    if (data.translations && !data.error && data.invertable) {
      console.log(data);
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
      textToSpeech(this.term, foreign);
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
    }
  }

  async hide() {
    this.stage = 'hidden';
    this.domSelector.classList.remove('masterlingo__new-card--button');
    this.domSelector.classList.remove('masterlingo__error');
    this.domSelector.classList.remove('masterlingo__new-card-box--active');
    this.domSelector.style.display = 'none';
    this.translationsToSave = [];
    this.wordElement = null;
    this.term = '';
  }

  setPosition(wordElement) {
    const wordOffset = this.getOffset(wordElement);
    console.log(wordElement);
    this.domSelector.style.left = wordOffset.left + wordOffset.width / 2 + 'px';
    this.domSelector.style.top = wordOffset.top - 10 + 'px';
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
