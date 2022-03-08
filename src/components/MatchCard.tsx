
import { FC, useState, } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCircleUser } from "@fortawesome/free-solid-svg-icons";
import { faUserClock } from "@fortawesome/free-solid-svg-icons";
import { faClockRotateLeft } from '@fortawesome/free-solid-svg-icons';

import Match from '../interfaces/Match';
import Turn from '../interfaces/Turn';
import { renderWordleSquares } from '../utils/wordUtils';
import { 
    getCurrentTurn,
    getMatchOpponentId,
    isPlayerTurn,
} from '../utils/misc';
import useStore from '../utils/store';


interface Props {
    match: Match,
    isLobbyMatchModalOpen: boolean,
    setIsLobbyMatchModalOpen: any,
}

const MatchCard: FC<Props> = ({ match, setIsLobbyMatchModalOpen }: Props) => {
    const { 
        setSelectedMatch, 
        user, 
        matchOpponents,
    } = useStore();

    const [isUserTurn, setIsUserTurn] = useState(isPlayerTurn(match, user.uid));
    const [matchOpponent, setIsMatchOpponent] = useState(matchOpponents[getMatchOpponentId(user, match)]);
 
    // TODO: I'm sure there's room for even more abstraction for the repetition across these functions
    const renderCardDetails = () => {
        const { players } = match;

        if (!players.guestId) {
            return  <div className="yellow-match-opponent">
            <span className="yellow-match-title">Awaiting a Challenger</span>
            <FontAwesomeIcon icon={faUserClock} size='4x' className="yellow-match-avatar" />
            <span className="yellow-match-user">Who will it be?</span>
            </div>;
        }

        if (isUserTurn) {
        return <div className="green-match-opponent">
                <span className="green-match-title">Match With</span>
                <FontAwesomeIcon icon={faCircleUser} size='4x' className="green-match-avatar" />
                <span className="green-match-user">{matchOpponent?.email}</span>
            </div>;
        }

        if (matchOpponent) {
            return <div className="yellow-match-opponent">
                <span className="yellow-match-title">Match With</span>
                <FontAwesomeIcon icon={faCircleUser} size='4x' className="yellow-match-avatar" />
                <span className="yellow-match-user">{matchOpponent?.email}</span>
            </div>;
        }
    };

    const renderMatchButton = () => {
        const { players } = match;


        if (isUserTurn) {
            return <button className="green-match-button">The results are in...</button>;
        }

        if (!players.guestId) {
            // TODO: is this language "fun" enough to justify being both twee and potentially a touch unclear?
            return <button className="yellow-match-button">{`Waiting for an Opponent to Accept`}</button>;
        }

        if (matchOpponent) {
            // TODO: Copy?
            return <button className="yellow-match-button-hollow">Opponent's turn ...</button>
        }
    }


    const handleCardClick = () => {
        const { players, turns } = match;
        const currentTurn: Turn =  getCurrentTurn(turns);

        // if (!players.guestId || currentTurn.activePlayer !== user.uid) {
            setSelectedMatch(match);
            setIsLobbyMatchModalOpen(true);
        // }
    }

    const handleCardColor = () => {
        if (isUserTurn) return 'green';
        if (!matchOpponent || (matchOpponent && !isUserTurn)) return 'yellow';
    }


    return (
        <div onClick={handleCardClick} className={`${handleCardColor()}-match-card ${handleCardColor()}-match-lastplay`}>
            <div className="card-label">
                { renderCardDetails() }
                <span className={`${handleCardColor()}-match-text`}>You entered the word:</span>
            </div>

            {/* TODO: investigate repsonsiveness at REALLY small screen sizes ( < 360px) */}
            <div className={`${handleCardColor()}-match-playbox`}>
                {renderWordleSquares(match.turns.find((turn) => turn.currentTurn)?.wordle as string)}
            </div>

            {/* 
                TODO: Consider making it so that when a host clicks on a match card for a match that hasn't been accepted yet, it shows the match's shareable url 
            */}
            {renderMatchButton()}
        </div>
    );
};

export default MatchCard;