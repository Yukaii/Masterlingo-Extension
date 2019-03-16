import axios from 'axios';
console.log(axios);

const masterLingoApi = axios.create({
  baseURL: 'https://masterlingoapp.com/api'
});

async function login() {
  const result = await masterLingoApi.get('/login');
  console.log(result);
  const user = result.data;
  if (user) {
    console.log('logged in');
    return user;
  } else {
    console.log(`couldn't log in`);
    return false;
  }
}

async function getFlashcards() {
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
}

async function updateFlashcard(flashcard) {
  const result = await masterLingoApi.put(`/flashcards/${flashcard._id}`, flashcard);
  if (result.data) {
    return result.data;
  } else {
    return false;
  }
}

async function deleteFlashcard(flashcard) {
  const result = await masterLingoApi.put(`/flashcards/${flashcard._id}`, flashcard);
  if (result.data) {
    return result.data;
  } else {
    return false;
  }
}

async function addFlashcard(flashcard) {
  const result = await masterLingoApi.put(`/flashcards/${flashcard._id}`, flashcard);
  if (result.data) {
    return result.data;
  } else {
    return false;
  }
}

async function getTranslations(word) {
  const result = await masterLingoApi.get('/translate', word);
  if (result.data) {
    return result.data;
  } else {
    return false;
  }
}

const apiMethods = {
  getFlashcards,
  updateFlashcard,
  deleteFlashcard,
  addFlashcard,
  login,
  getTranslations
};

export default apiMethods;
