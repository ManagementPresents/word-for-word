import WordList
 from "../interfaces/WordList";
import humanWords from './humanWords';
import dicitonaryWords from './dictionaryWords';
import dictionaryWords from "./dictionaryWords";

const KEYBOARD_LETTERS = [
	['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
	['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
	['Z', 'X', 'C', 'V', 'B', 'N', 'M'],
];

const LETTERS = [
	'A',
	'B',
	'C',
	'D',
	'E',
	'F',
	'G',
	'H',
	'I',
	'J',
	'K',
	'L',
	'M',
	'N',
	'O',
	'P',
	'Q',
	'R',
	'S',
	'T',
	'U',
	'V',
	'W',
	'X',
	'Y',
	'Z',
];

const TIMEOUT_DURATION = 1750;

const WORD_LISTS = [{
	name: 'human',
	description: 'A curated list of words. Includes slang.',
	words: humanWords,
}, {
	name: 'dictionary',
	description: 'Every possible 5 letter word. All of them.',
	words: dictionaryWords,
}] as WordList[];

export { 
	LETTERS,
	KEYBOARD_LETTERS,
	TIMEOUT_DURATION,
	WORD_LISTS, 
};