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

export default TranslationBox;
