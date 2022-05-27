interface WordList {
	name: string;
	description: string;
	words: {[word: string]: boolean};
}

export default WordList;