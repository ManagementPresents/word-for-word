import create from 'zustand';

import Match from '../types/Match';
import Player from '../types/Player';

interface State {
    user: any,
    isLoading: boolean,
    setIsLoading: any,
    setMatches: any,
    db: any,
    app: any,
    matches: Match[],
    addMatch: any,
    setUser: any,
    currentMatch: Match,
    setOpponentPlayer: any,
    opponentPlayer: Player,
    setCurrentMatch: any,
    hasCheckedUser: boolean,
    setHasCheckedUser: any,
}

const useStore = create<State>((set, get) => ({
    user: null,
    isLoading: true,
    db: null,
    app: null,
    currentMatch: {} as Match,
    matches: [] as Match[],
    opponentPlayer: {} as Player,
    hasCheckedUser: false,
    setHasCheckedUser: (hasCheckedUser: boolean) => set({ hasCheckedUser }),
    setOpponentPlayer: (opponentPlayer: Player) => set({ opponentPlayer }),
    addMatch: (match: Match) => set({ matches: get().matches.concat(match) }),
    setMatches: (matches: Match[]) => set({ matches }),
    setIsLoading: (isLoading: boolean) => set({ isLoading }),
    setUser: (user: any) => set({ user }),
    setCurrentMatch: (match: Match) => set({ currentMatch: match}),
}));

export default useStore;