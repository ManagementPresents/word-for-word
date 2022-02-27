import { matchRoutes } from 'react-router-dom';
import create from 'zustand';

import Match from '../types/Match';

type State = {
    user: any,
    isLoading: boolean,
    setIsLoading: any,
    setMatches: any,
    db: any,
    app: any,
    matches: Match[],
    addMatch: any,
}

const useStore = create<State>((set, get) => ({
    user: null,
    isLoading: true,
    db: null,
    app: null,
    matches: [] as Match[],
    addMatch: (match: Match) => set({ matches: get().matches.concat(match) }),
    setMatches: (matches: Match[]) => set({ matches }),
    setIsLoading: (isLoading: boolean) => set({ isLoading }),
    setUser: (user: any) => set({ user }),
}));

export default useStore;