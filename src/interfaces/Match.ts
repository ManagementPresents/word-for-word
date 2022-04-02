import Turn from './Turn';

interface Match {
	id: string;
	type: string;
	outcome: string,
	players: {
		guestId: string;
		hostId: string;
	};
	turns: Turn[];
	isWinnerNotified: boolean;
}

export default Match;
