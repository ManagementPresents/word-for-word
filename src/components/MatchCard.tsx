
import { FC } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCircleUser } from "@fortawesome/free-solid-svg-icons";
import { faClockRotateLeft } from '@fortawesome/free-solid-svg-icons';

import Match from '../types/Match';

import { renderWordleSquares } from '../utils/wordUtils';

type Props = {
    match: Match,
}

const MatchCard: FC<Props> = ({ match }: Props) => {
    return (
        <div className="relative flex flex-col bg-[#caa82a] rounded-3xl p-6 justify-center items-center gap-y-3">
            <FontAwesomeIcon icon={faClockRotateLeft} className="absolute top-[-10px] right-0 text-[#FFCE47]" size='3x' />
            <FontAwesomeIcon icon={faCircleUser} size='4x' />

            <div className="flex flex-col items-center">
                <span className="text-[20px]">Match with @Username</span>
                <span className="text-[20px]">You last played:</span>
            </div>

            <div className="flex gap-x-3">
                {renderWordleSquares(match.turns.find((turn) => turn.currentTurn)?.wordle as string)}
            </div>

            {/* 
                TODO: Consider making it so that when a host clicks on a match card for a match that hasn't been accepted yet, it shows the match's shareable url 
            */}
            <button className="gray-button-style font-bold py-2 px-4 rounded w-full">Waiting for opponent</button>
        </div>
    );
};

export default MatchCard;