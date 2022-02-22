import create from 'zustand';

type State = {
    user: any,
    isLoading: boolean,
    setIsLoading: any,
    db: any,
    app: any,
}

const useStore = create<State>((set) => ({
    user: null,
    isLoading: true,
    db: null,
    app: null,
    setIsLoading: (isLoading: boolean) => set({ isLoading }),
    setUser: (user: any) => set({ user }),
}));

export default useStore;