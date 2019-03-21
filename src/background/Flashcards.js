import mslApi from './msLingoApi';
import _ from 'lodash';

class Flashcards {
  constructor() {
    this.reviewFlashcards = {};
    this.reviewFlashcards = {};
  }
  async getFlashcards() {
    const result = await mslApi.getFlashcards();
    console.log('this is the result');
    console.log(result);
    if (result) {
      this.reviewFlashcards = result.reviewFlashcards;
      this.allFlashcards = result.allFlashcards;
      console.log(result);
    }
  }
  updateFlashcard(flashcard) {
    this.reviewFlashcards[flashcard._id] = flashcard;
    mslApi.updateFlashcard(flashcard);
  }
  deleteFlashcard(flashcardId, deleteFromDb = false) {
    this.reviewFlashcards = _.omit(this.reviewFlashcards, flashcardId);
    if (deleteFromDb) {
      mslApi.deleteFlashcard(flashcardId);
    }
  }
  addFlashcard(flashcard) {
    this.reviewFlashcards[flashcard._id] = flashcard;
    mslApi.addFlashcard(flashcard);
  }
}

export default Flashcards;
