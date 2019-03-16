import mslApi from './msLingoApi';
import _ from 'lodash';

class Flashcards {
  constructor() {
    this.allFlashcards = {};
    this.reviewFlashcards = {};
  }
  async getFlashcards() {
    const result = await mslApi.getFlashcards();
    console.log('this is the result');
    console.log(result);
    if (result) {
      this.allFlashcards = result.allFlashcards;
      this.reviewFlashcards = result.reviewFlashcards;
      console.log(result);
    }
  }
  updateFlashcard(flashcard) {
    this.allFlashcards[flashcard._id] = flashcard;
    mslApi.updateFlashcard(flashcard);
  }
  deleteFlashcard(flashcardId, deleteFromDb = false) {
    this.allFlashcards = _.omit(this.allFlashcards, flashcardId);
    if (deleteFromDb) {
      mslApi.deleteFlashcard(flashcardId);
    }
  }
  addFlashcard(flashcard) {
    this.allFlashcards[flashcard._id] = flashcard;
    mslApi.addFlashcard(flashcard);
  }
}

export default Flashcards;
