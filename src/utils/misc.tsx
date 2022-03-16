import Turn from '../interfaces/Turn';
import Match from '../interfaces/Match';
import ValidationError from '../interfaces/ValidationError';
import Cell from '../interfaces/match/Cell';
import MatchOutcome from '../interfaces/MatchOutcome';

const { REACT_APP_URL } = process.env;

const renderErrors = (errors: ValidationError[], className: string): JSX.Element[] => {
	let validationMessages: JSX.Element[] = [] as JSX.Element[];

	if (errors.length) {
		validationMessages = errors.map((error: any) => {
			/* 
                TODO: This 'message' property is only necessary because of the 'password-validator' library.
                This can be refactored now that we're also using validator.js
            */
			// @ts-ignore
			return <div className={className}>{error.message}</div>;
		});
	} /* else {
        // TODO: Revisit how the "no errors" case, here, is handled
        validationMessages.push(<div className={'text-[#15B097] text-sm'}>Looking good!</div>);
    }*/

	return validationMessages;
};

/*
    TODO: This, and arrayToNumericalObj, are necessary to help get around Firestore's current inability to support arrays of arrays. Instead, we serialize nested arrays into objects where array index maps to a property in the object, and the value at that index becomes the corresponding value in the object.
*/
const numericalObjToArray = (numericalObj: { [key: string]: any }): any[] => {
	return Object.values(numericalObj);
};

const arrayToNumericalObj = (array: any[]): { [key: string]: any } => {
	return Object.assign({}, array);
};

/*
    TODO: This stupid pattern of having to loop through turns just to update the current turn is
    an attempt to work with firestore's limitations when it comes to editing nested data.

    For future me: For a given currentTurn, there can be anywhere between 0 and 6 turns. In order to update just the currentTurn,
    but also ensure we don't accidentally alter any previous turns, we map through the whole turns array. If the turn is not the currentTurn, we send it back as is, no changes. If it's the currentTurn, we get to editing.

    All this is to say: This function returns an array of /all/ the turns in this match, but /only/ the currentTurn should actually be changed
*/
const updateCurrentTurn = (turns: Turn[], callback: (turn: Turn) => Turn): Turn[] => {
	return turns.map((turn: Turn): Turn => {
		if (!turn.currentTurn) return turn;

		return callback(turn);
	}) as Turn[];
};

const getCurrentTurn = (turns: Turn[] = []): Turn => {
	return turns.find((turn: Turn): boolean => turn.currentTurn) as Turn;
};

const addTurn = (turns: Turn[], turn: Turn): Turn[] => {
	return turns.concat(turn) as Turn[];
};

const createMatchUrl = (match: Match): string => {
	return `${REACT_APP_URL}/match/${match.id}`;
};

const getMatchOpponentId = (user: any, match: Match): string => {
	const { uid } = user;
	const { players } = match;
	
	if (!players?.guestId && uid !== players?.hostId) return uid;

	return uid === players?.guestId ? players?.hostId : players?.guestId;
};

const isPlayerCurrentTurn = (match: Match = {} as Match, id: string): boolean => {
	const currentTurn: Turn = getCurrentTurn(match.turns) as Turn;

	return currentTurn?.activePlayer === id;
};

const getLastPlayedWordByPlayerId = (id: string, turns: Turn[]): string => {
	const reversedTurns = [...turns].reverse();

	return reversedTurns.find((turn) => turn.activePlayer !== id)?.wordle as string;
};

const hasPlayerWonCurrentTurn = (match: Match = {} as Match, playerId: string): boolean => {
	if (isPlayerCurrentTurn(match, playerId)) {
		const currentTurn = getCurrentTurn(match.turns);

		const guessesArray: Cell[][] = numericalObjToArray(currentTurn.guesses);

		// TODO: i'll be the first to admit this could be hard to read
		const isTurnWon: boolean = !!guessesArray.length && guessesArray.every((singleGuess: Cell[]) => {
			return singleGuess.every((guessLetter: Cell) => {
				return guessLetter.status === 'correct';
			});
		});

		return isTurnWon;
	}

	return false;
}

const determineOutcome = (match: Match): string => {
	const currentTurn = getCurrentTurn(match.turns);
	const guessesAsArray = numericalObjToArray(currentTurn.guesses);
	const lastGuess = guessesAsArray.slice(-1);
	const isLastGuessIncorrect = lastGuess.every((cell: Cell) => cell.status !== 'correct');

	if (isLastGuessIncorrect && guessesAsArray.length === 6) {
		const { players } = match;

		if (currentTurn.activePlayer === players.hostId) {
			return MatchOutcome.GUEST_WIN;
		} else if (currentTurn.activePlayer === players.guestId) {
			return MatchOutcome.HOST_WIN;
		}
	}

	return '';
};

export {
	renderErrors,
	numericalObjToArray,
	arrayToNumericalObj,
	updateCurrentTurn,
	getCurrentTurn,
	addTurn,
	createMatchUrl,
	getMatchOpponentId,
	isPlayerCurrentTurn,
	getLastPlayedWordByPlayerId,
	hasPlayerWonCurrentTurn,
	determineOutcome
};
