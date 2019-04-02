import axios from 'axios';
console.log(axios);

const masterLingoApi = axios.create({
  baseURL: 'https://masterlingoapp.com/api'
});

async function login() {
  try {
    const result = await masterLingoApi.get('/login');
    const user = result.data;
    if (user) {
      return user;
    } else {
      return false;
    }
  } catch (err) {
    console.log(err);
    return false;
  }
}

async function getFlashcards() {
  try {
    const response = await masterLingoApi.get('/flashcards');
    const flashcards = response.data;
    if (flashcards) {
      let reviewFlashcards = flashcards.filter(card => {
        return new Date(card.dueDate) - new Date() < 0;
      });

      return { allFlashcards: _.mapKeys(flashcards, '_id'), reviewFlashcards: _.mapKeys(reviewFlashcards, '_id') };
    } else {
      return false;
    }
  } catch (err) {
    console.log(err);
    return false;
  }
}

async function updateFlashcard(flashcard) {
  try {
    const result = await masterLingoApi.put(`/flashcards/${flashcard._id}`, flashcard);
    if (result.data) {
      return result.data;
    } else {
      return false;
    }
  } catch (err) {
    console.log(err);
    return false;
  }
}

async function upadateFlashcardSrs(flashcard) {
  try {
    const response = await masterLingoApi.put(`/srs/${flashcard._id}`, {
      repetition: flashcard.repetition,
      dueDate: flashcard.dueDate,
      schedule: flashcard.schedule,
      factor: flashcard.factor
    });
  } catch (err) {
    console.log(err);
  }
}

async function deleteFlashcard(flashcard) {
  try {
    const result = await masterLingoApi.delete(`/flashcards/${flashcard._id}`);
    if (result.data) {
      return result.data;
    } else {
      return false;
    }
  } catch (err) {
    console.log(err);
    return false;
  }
}

async function createFlashcard(flashcard) {
  try {
    const result = await masterLingoApi.post(`/flashcards`, flashcard);
    if (result.data) {
      return result.data;
    } else {
      return false;
    }
  } catch (err) {
    console.log(err);
    return false;
  }
}

async function getTranslations(word) {
  try {
    const result = await masterLingoApi.get(`/translate/${word}`, {
      headers: {
        inverted: false
      }
    });
    if (result.data) {
      return result.data;
    } else {
      return false;
    }
  } catch (err) {
    console.log(err);
    return false;
  }
}

async function signIn() {
  try {
    const result = await axios.get(`https://masterlingoapp.com/auth/google`);
    return result;
  } catch (err) {
    console.log(err);
    return false;
  }
}

const apiMethods = {
  getFlashcards,
  updateFlashcard,
  deleteFlashcard,
  createFlashcard,
  login,
  getTranslations,
  upadateFlashcardSrs,
  signIn
};

export default apiMethods;
