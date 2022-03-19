import create from 'zustand';

import Match from '../interfaces/Match';
import Player from '../interfaces/Player';
import Players from '../interfaces/Players';
import Turn from '../interfaces/Turn';

// TODO: Figure out the correct type for the 'set's
interface State {
	user: any;
	isLoading: boolean;
	db: any;
	app: any;
	matches: {};
	currentMatch: Match;
	opponentPlayer: Player;
	hasCheckedUser: boolean;
	currentTurn: Turn;
	// All the people you are currently involved in matches with
	matchOpponents: Players;
	setMatchOpponents: any;
	setOpponentPlayer: any;
	setCurrentMatch: any;
	setHasCheckedUser: any;
	setCurrentTurn: any;
	addMatch: any;
	setUser: any;
	setIsLoading: any;
	setMatches: any;
}

const useStore = create<State>((set, get) => ({
	user: null,
	isLoading: true,
	db: null,
	app: null,
	currentMatch: {} as Match,
	currentTurn: {} as Turn,
	matches: {},
	opponentPlayer: {} as Player,
	hasCheckedUser: false,
	setHasCheckedUser: (hasCheckedUser: boolean) => set({ hasCheckedUser }),
	setOpponentPlayer: (opponentPlayer: Player) => set({ opponentPlayer }),
	addMatch: (match: Match) => {
		const matches = get().matches;
		// @ts-ignore
		matches[match.id] = match;

		set({ matches });
	},
	matchOpponents: {} as Players,
	setMatches: (matches: {}) => set({ matches }),
	setIsLoading: (isLoading: boolean) => set({ isLoading }),
	setUser: (user: any) => set({ user }),
	setCurrentMatch: (currentMatch: Match) => {
		// TODO: idk if it's a zustand 'antipattern' to edit multiple state properties in one call, but, it works, so
		const matches = {
			...get().matches,
			[currentMatch.id]: currentMatch
		}; 

		set({ 
			currentMatch,
			matches,
		});
	},
	setCurrentTurn: (currentTurn: Turn) => set({ currentTurn }),
	setMatchOpponents: (matchOpponents: Players) => set({ matchOpponents }),
}));

export default useStore;
