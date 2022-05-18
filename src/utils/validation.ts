import isAlpha from 'validator/lib/isAlpha';
import isLength from 'validator/lib/isLength';
import WordList from '../interfaces/WordList';

/* TODO: It's probably necessary to create server side validation, via cloud function or something,
 so that it's totally impossible to start up a match with a faulty word */
/**
 *
 * @param wordle
 * @returns {string[]}
 */
const validateWordle = (wordle: string, wordList: WordList): string[] => {
	let errors = [];

	if (!isAlpha(wordle)) {
		errors.push('No special characters.');
	}

	if (!isLength(wordle, { min: 5, max: 5 })) {
		errors.push('Must be exactly 5 letters.');
	}

	// @ts-ignore
	if (wordList.words) {
		// TODO: remove this extra 'if' once all instances of validateWordle are correctly refactored
		if (!wordList?.words[wordle.toLowerCase()]) {
			errors.push('Not in current word list.');
		}
	}

	// return [{ message: 'Wordle cannot contain special characters' }];
	return errors;
};

export { validateWordle };
