import { getQuestions as getStaticQuestions } from '../data/questions.js';

// Questions are now loaded from static file instead of database
export const getQuestions = async () => {
    return getStaticQuestions();
};

