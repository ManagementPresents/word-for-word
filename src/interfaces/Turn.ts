interface Turn {
	activePlayer: string;
	currentTurn: boolean;
	guesses: {};
	turnState: string;
	wordle: string;
	keyboardStatus: {};
}

export default Turn;
