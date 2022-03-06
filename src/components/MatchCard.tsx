
import { FC, useState, } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCircleUser } from "@fortawesome/free-solid-svg-icons";
import { faClockRotateLeft } from '@fortawesome/free-solid-svg-icons';

import Match from '../interfaces/Match';
import Turn from '../interfaces/Turn';
import { renderWordleSquares } from '../utils/wordUtils';
import { 
    getCurrentTurn,
    getMatchOpponent,
} from '../utils/misc';
import useStore from '../utils/store';

interface Props {
    match: Match,
    isPendingMatchModalOpen: boolean,
    setIsPendingMatchModalOpen: any,
}

const MatchCard: FC<Props> = ({ match, setIsPendingMatchModalOpen }: Props) => {
    const { 
        setSelectedMatch, 
        user, 
        matchOpponents 
    } = useStore();

    const [currentTurn, setCurrentTurn] = useState(getCurrentTurn(match.turns));
    const [isPlayerTurn, setIsPlayerTurn] = useState(currentTurn.activePlayer === user.uid);
    const [matchOpponent, setIsMatchOpponent] = useState(getMatchOpponent(user, match, matchOpponents));
 
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
                <span className="text-[20px]">{matchOpponent.email}</span>
            </div>
        </>;
    };

    const renderMatchButton = () => {
        const { players } = match;


        if (isPlayerTurn) {
            return <button className="green-button-style font-bold py-2 px-4 rounded w-full text-[14px] max-w-xs md:text-[18px]">It's Your Turn!</button>;
        }

        if (!players.guestId) {
            // TODO: is this language "fun" enough to justify being both twee and potentially a touch unclear?
            return <button className="gray-button-style font-bold py-2 px-4 rounded w-full text-[14px] max-w-xs md:text-[18px]">{`Waiting for Opponent`}</button>;
        }

        if (matchOpponent) {
            // TODO: Copy?
            return <button className="gray-button-style font-bold py-2 px-4 rounded w-full text-[14px] max-w-xs md:text-[18px]">Opponent's turn ...</button>
        }
    }

    const handleCardClick = () => {
        const { players, turns } = match;
        const currentTurn: Turn =  getCurrentTurn(turns);

        if (!players.guestId || currentTurn.activePlayer !== user.uid) {
            setSelectedMatch(match);
            setIsPendingMatchModalOpen(true);
        }
    }

    const handleCardColor = () => {
        if (isPlayerTurn) return 'bg-[#19647E]';
        if (!matchOpponent || (matchOpponent && !isPlayerTurn)) return 'bg-[#caa82a]';
    }

    return (
        <div onClick={handleCardClick} className={`relative flex flex-col ${handleCardColor()} text-[#3C2A34] rounded-3xl p-6 justify-center items-center gap-y-3 cursor-pointer`}>
            <div className="flex flex-col items-center">
                { renderCardDetails() }
                <span className="text-[20px]">You last played:</span>
            </div>

            {/* TODO: investigate repsonsiveness at REALLY small screen sizes ( < 360px) */}
            <div className="flex gap-x-3">
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