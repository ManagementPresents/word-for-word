import create from 'zustand';

import Match from '../interfaces/Match';
import Player from '../interfaces/Player';
import Turn from '../interfaces/Turn';

// TODO: Figure out the correct type for the 'set's
interface State {
    user: any,
    isLoading: boolean,
    db: any,
    app: any,
    matches: Match[],
    currentMatch: Match,
    opponentPlayer: Player,
    hasCheckedUser: boolean,
    currentTurn: Turn,
    setOpponentPlayer: any,
    setCurrentMatch: any,
    setHasCheckedUser: any,
    setCurrentTurn: any,
    addMatch: any,
    setUser: any,
    setIsLoading: any,
    setMatches: any,
}

const useStore = create<State>((set, get) => ({
    user: null,
    isLoading: true,
    db: null,
    app: null,
    currentMatch: {} as Match,
    currentTurn: {} as Turn,
    matches: [] as Match[],
    opponentPlayer: {} as Player,
    hasCheckedUser: false,
    setHasCheckedUser: (hasCheckedUser: boolean) => set({ hasCheckedUser }),
    setOpponentPlayer: (opponentPlayer: Player) => set({ opponentPlayer }),
    addMatch: (match: Match) => set({ matches: get().matches.concat(match) }),
    setMatches: (matches: Match[]) => set({ matches }),
    setIsLoading: (isLoading: boolean) => set({ isLoading }),
    setUser: (user: any) => set({ user }),
    setCurrentMatch: (currentMatch: Match) => {
        console.log('nasty boy', currentMatch)
        set({ currentMatch })
        },
    setCurrentTurn: (currentTurn: Turn) => set({ currentTurn }),
}));

export default useStore;