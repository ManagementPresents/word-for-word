import Match from './Match';

interface Player {
    matches: Match[],
    email: string,
    id?: string,
}

export default Player;