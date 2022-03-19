interface Turn {
	activePlayer: string;
	isCurrentTurn: boolean;
	guesses: {};
	turnState: string;
	wordle: string;
	keyboardStatus: {};
	hasActivePlayerStartedTurn: boolean;
}

export default Turn;
