interface Turn {
	activePlayer: string;
	currentTurn: boolean;
	guesses: {};
	turnState: string;
	wordle: string;
	keyboardStatus: {};
	hasActivePlayerStartedTurn: boolean;
}

export default Turn;
