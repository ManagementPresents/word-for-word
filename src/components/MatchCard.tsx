
import { FC, useState, } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCircleUser } from "@fortawesome/free-solid-svg-icons";
import { faClockRotateLeft } from '@fortawesome/free-solid-svg-icons';

import Match from '../interfaces/Match';
import { renderWordleSquares } from '../utils/wordUtils';
import { 
    getMatchOpponentId,
    isPlayerCurrentTurn,
    getLastPlayedWordByPlayerId
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

    const [isUserTurn, setIsUserTurn] = useState(isPlayerCurrentTurn(match, user.uid));
    const [matchOpponent, setIsMatchOpponent] = useState(matchOpponents[getMatchOpponentId(user, match)]);
 
    // TODO: I'm sure there's room for even more abstraction for the repetition across these functions
    const renderCardDetails = () => {
        const { players } = match;

        if (!players.guestId) {
            return;
        }

        return <>
            <FontAwesomeIcon icon={faClockRotateLeft} className="absolute top-[-10px] right-0 text-[#FFCE47]" size='3x' />
            <FontAwesomeIcon icon={faCircleUser} size='4x' className="mb-2" />

            <div className="flex flex-col justify-center text-center mb-3">
                <span className="text-[20px]">Match with</span>
                <span className="text-[20px]">{matchOpponent?.email}</span>
            </div>
        </>;
    };

    const renderMatchButton = () => {
        const { players } = match;

        if (isUserTurn) {
            return <button className="green-button">It's Your Turn!</button>;
        }

        if (!players.guestId) {
            // TODO: is this language "fun" enough to justify being both twee and potentially a touch unclear?
            return <button className="grey-button">{`Waiting for Opponent`}</button>;
        }

        if (matchOpponent) {
            // TODO: Copy?
            return <button className="grey-button">Opponent's turn ...</button>
        }
    }

    const handleCardClick = () => {
        setSelectedMatch(match);
        setIsLobbyMatchModalOpen(true);
    }

    const handleCardColor = () => {
        if (isUserTurn) return 'green-match-card';
        if (!matchOpponent || (matchOpponent && !isUserTurn)) return 'yellow-match-card';
    }

    return (
        <div onClick={handleCardClick} className={`relative flex flex-col ${handleCardColor()} text-[#3C2A34] rounded-3xl p-6 justify-center items-center gap-y-3 cursor-pointer`}>
            <div className="flex flex-col items-center">
                { renderCardDetails() }
                <span className="text-[20px]">You last played:</span>
            </div>

            {/* TODO: investigate repsonsiveness at REALLY small screen sizes ( < 360px) */}
            <div className="flex gap-x-3">
                {renderWordleSquares(getLastPlayedWordByPlayerId(user.uid, match.turns))}
            </div>

            {/* 
                TODO: Consider making it so that when a host clicks on a match card for a match that hasn't been accepted yet, it shows the match's shareable url 
            */}
            {renderMatchButton()}
        </div>
    );
};

export default MatchCard;