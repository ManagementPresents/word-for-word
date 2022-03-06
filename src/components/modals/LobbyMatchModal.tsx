
import { FC, useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCircleUser } from "@fortawesome/free-solid-svg-icons";

import CopyInput from '../CopyInput';
import Button from '../buttons/Button';
import Modal from './Modal';

import Turn from '../../interfaces/Turn';
import useStore from '../../utils/store';
import { renderWordleSquares } from '../../utils/wordUtils';
import {  
    getCurrentTurn,
    createMatchUrl,
    getMatchOpponentId,
    isPlayerTurn,
} from "../../utils/misc";

interface Props {
    isOpen: boolean,
    onRequestClose: any,
}

const LobbyMatchModal: FC<Props> = ({ isOpen, onRequestClose, }: Props) => {
    const { 
        selectedMatch, 
        matchOpponents, 
        user 
    } = useStore();

    const [matchOpponent, setIsMatchOpponent] = useState(matchOpponents[getMatchOpponentId(user, selectedMatch)]);
    const isUserTurn = isPlayerTurn(selectedMatch, user.uid);

    const renderTitle = () => {
        if (matchOpponent || isUserTurn) {
            return (
                <span className="flex flex-col">
                    <span>Match with</span>
                    <span>{matchOpponent?.email}</span>
                </span>
            );
        }
        
        return 'Awaiting Opponent';
    }

    const renderMatchButtons = () => {
        if (matchOpponent) {
            return (
                <div className="flex flex-col gap-y-2 mt-4">
                    <Button copy="Forfeit Match" color="gray" onClick={() => {
                        console.log('cancel and delete match');
                    }} /> 
                    <Button copy="Return to Lobby" color="yellowHollow" onClick={() => {
                        console.log('cancel and delete match');
                    }} /> 
                    </div>
            );
        }

        return (
            <Button customStyle="mt-4" copy="Cancel Invite" color="gray" onClick={() => {
                console.log('cancel and delete match');
            }} />
        );
    }

    const renderTurns = () => {
        const isSelectedMatch = Object.keys(selectedMatch).length;

        // TODO: This needs abstraction
        if (isSelectedMatch) { 
            const selectedMatchCurrentTurn: Turn = getCurrentTurn(selectedMatch.turns);

            if (selectedMatch?.players?.hostId === user.uid) {
                return renderWordleSquares(selectedMatchCurrentTurn.wordle);
            }

            return <div></div>
        }
    }
    
    return (
        <Modal isOpen={isOpen} onRequestClose={onRequestClose}>
            <h1 className="text-3xl text-center sm:text-4xl">
                {renderTitle()}
            </h1>

            <div className="flex flex-row justify-center gap-x-4 text-center">
                {/* TODO: these two flex items flanking the profile photo need to always be the same width. the CSS implementation
                here is a bit fragile, and could break if, say, the player has played/won/lost a fuck ton
                of matches */}
                <div className="flex flex-row justify-end w-[90px] sm:w-[140px]">
                    <div className="flex flex-col gap-y-1">
                        <h2 className="text-[12px] sm:text-[18px]">
                            Matches Played
                        </h2>

                        <span>?</span>
                    </div>
                </div>

                <FontAwesomeIcon icon={faCircleUser} size='4x' className="mb-2 min-w-[50px] sm:min-w-[80px]" />

                <div className="flex flex-row gap-x-4 justify-start text-center w-[90px] sm:w-[140px]">
                    <div className="flex flex-col gap-y-1">
                        <h2 className="text-[12px] sm:text-[18px]">
                            Won
                        </h2>

                        <span>?</span>
                    </div>

                    <div className="flex flex-col gap-y-1">
                        <h2 className="text-[12px] sm:text-[18px]">Lost</h2>

                        <span>?</span>
                    </div>
                </div>
            </div>

            <div className="flex flex-row justify-center max-h-[30px] sm:max-h-[40px]">
                {/* TODO: Same 'flanking elements must be same width' as above */}
                <div className="flex bg-[#775568] p-2.5 items-center justify-center w-[76px] sm:w-[86px]">
                    <span>Your Word</span>
                </div>

                <div className="flex flex-row bg-[#775568] gap-x-1 sm:gap-x-2 ">
                    {renderTurns()}
                </div>

                <div className="flex bg-[#775568] p-2.5 items-center justify-center w-[76px] sm:w-[86px]">
                    ?/6
                </div>
            </div>

            {matchOpponent ? 
                <div className="text-center max-w-[270px] mx-auto sm:max-w-[370px]">
                    <p className="text-2xl sm:text-4xl mb-1">It's your opponent's turn!</p>
                    <p className="text-[14px] sm:text-[18px]">Come back once they've completed their turn.</p>
                </div> :
                <p className="text-2xl text-center max-w-[270px] mx-auto sm:text-4xl sm:max-w-[370px]">Waiting for an opponent to accept match invite!</p>
            }

            <div className="flex flex-col items-center gap-y-2 max-w-[250px] mx-auto mt-2">
                <h3 className="text-[16px]">
                    Match Link
                </h3>

                <div className="flex flex-col gap-y-2 w-[250px]">
                    <CopyInput copyText={createMatchUrl(selectedMatch)} />
                </div>

                {renderMatchButtons()}
            </div>
        </Modal>
    );
}

export default LobbyMatchModal;