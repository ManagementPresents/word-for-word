import isAlpha from 'validator/lib/isAlpha';
import isLength from 'validator/lib/isLength';
import words from '../data/words';

// TODO: It's probably necessary to create server side validation, via cloud function or something,
// so that it's totally impossible to start up a match with a faulty word
const validateWordle = (wordle: string): string[] => {
    let errors = [];

    if (!isAlpha(wordle)) {
        errors.push('No special characters.');
    }

    if (!isLength(wordle, { min: 5, max: 5 })) {
        errors.push('Must be exactly 5 letters.');
    }

    if (!words[wordle.toLowerCase()]) {
        errors.push('Not in current word list.');
    }
    
    // return [{ message: 'Wordle cannot contain special characters' }];
    return errors;
}

export {
    validateWordle,
}