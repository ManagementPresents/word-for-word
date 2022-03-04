import answers from '../data/answers';
import words from '../data/answers';

const getRandomWord = () => {
    const randomIndex = Math.floor(Math.random() * answers.length)

    return words[randomIndex].toLowerCase();
};

const generateMatchUri = (numWords: number, char = '-') => {
    let matchUri = [];

    for (let i = 0; i < numWords; i++) {
        matchUri.push(getRandomWord());
    }

    return matchUri.join(char);
};

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
};

// TODO: Need to change this to be able to render green, yellow, and gray squares
const renderWordleSquares = (wordle: string, color?: string | []) => {
    if (!wordle) return;

    return wordle.split('').map((letter: string) => {
        if (typeof color === 'string') {
            return <span className={`${color} h-[30px] w-[30px] text-center leading-[30px] text-[14px] sm:text-[18px] sm:leading-[40px] sm:h-[40px] sm:w-[40px]`}>{letter.toUpperCase()}</span>;
        }
        
        // Default to yellow
        return <span className={`yellow h-[30px] w-[30px] text-center leading-[30px] text-[14px] sm:text-[18px] sm:leading-[40px] sm:h-[40px] sm:w-[40px]`}>{letter.toUpperCase()}</span>;
    });
};


export {
    getRandomWord,
    generateMatchUri,
    makeUpADude,
    renderWordleSquares,
}
