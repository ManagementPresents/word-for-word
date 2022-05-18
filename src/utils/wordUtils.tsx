import humanWords from '../data/humanWords';
import Cell from '../interfaces/Cell';

const getRandomWord = (): string => {
	const formattedWords = Object.keys(humanWords);
	const randomIndex = Math.floor(Math.random() * formattedWords.length);

	return formattedWords[randomIndex].toLowerCase();
};

const generateMatchUri = (numWords: number, char = '-'): string => {
	let matchUri = [];

	for (let i = 0; i < numWords; i++) {
		matchUri.push(getRandomWord());
	}

	return matchUri.join(char);
};

/**
 *
 * @returns a dude
 */
const makeUpADude = (): string => {
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

const renderWordleSquares = (wordle: string, color?: string | []): JSX.Element[] => {
	if (!wordle) return [] as JSX.Element[];

	return wordle.split('').map((letter: string) => {
		if (typeof color === 'string') {
			return (
				<span
					className={`${color} h-[30px] w-[30px] text-center leading-[30px] text-[14px] sm:text-[18px] sm:leading-[40px] sm:h-[40px] sm:w-[40px]`}
				>
					{letter.toUpperCase()}
				</span>
			);
		}

		// Default to yellow
		return (
			<span
				className={`yellow h-[30px] w-[30px] text-center leading-[30px] text-[14px] sm:text-[18px] sm:leading-[40px] sm:h-[40px] sm:w-[40px]`}
			>
				{letter.toUpperCase()}
			</span>
		);
	});
};

const renderWordleSquaresComplete = (wordle: Cell[]): JSX.Element[] => {
	if (!wordle) return [] as JSX.Element[];

	return wordle.map((cell: Cell) => {
		let color: string = '';

		switch (cell.status) {
			case 'correct':
				color = 'green';
				break;
			case 'misplaced':
				color = 'yellow';
				break;
			case 'incorrect':
				color = 'dark-grey';
				break;
			default:
				color = 'neutral';
				break;
		}

		return (
			<span
				className={`${color} h-[30px] w-[30px] text-center leading-[30px] text-[14px] sm:text-[18px] sm:leading-[40px] sm:h-[40px] sm:w-[40px]`}
			>
				{cell.letter.toUpperCase()}
			</span>
		);
	});
};

export {
	getRandomWord,
	generateMatchUri,
	makeUpADude,
	renderWordleSquares,
	renderWordleSquaresComplete,
};
