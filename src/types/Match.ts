import Turn from './Turn';

type Match = {
    players: {
        guestId: string,
        hostId: string,
    },
    turns: Turn[],
    winner: string,
}

export default Match;
