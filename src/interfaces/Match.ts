import Turn from './Turn';

interface Match {
    id: string,
    players: {
        guestId: string,
        hostId: string,
    },
    turns: Turn[],
    winner: string,
}

export default Match;
