import answers from '../data/answers';
import words from '../data/answers';

const getRandomWord = () => {
    const randomIndex = Math.floor(Math.random() * answers.length)

    return words[randomIndex].toLowerCase();
}

const generateMatchUri = (numWords: number, char = '-') => {
    let matchUri = [];

    for (let i = 0; i < numWords; i++) {
        matchUri.push(getRandomWord());
    }

    return matchUri.join(char);
}

const makeUpADude = () => {
    let dude = '';

    for (let i = 0; i < 3; i++) {
        const randomWord = getRandomWord();

        if (i === 0) {
            dude += randomWord.charAt(0).toUpperCase() + randomWord.slice(1);
        }
       
        if (i === 1) {
            dude += ` ${randomWord.charAt(0).toUpperCase() + randomWord.slice(1)}`;
        }

        if (i === 2) dude += randomWord;
    }

    return dude;
}

export {
    getRandomWord,
    generateMatchUri,
    makeUpADude,
}
