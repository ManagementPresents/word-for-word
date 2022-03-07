
import { FC, useState, useEffect, ReactElement } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCircleUser } from "@fortawesome/free-solid-svg-icons";

import CopyInput from '../CopyInput';
import Button from '../buttons/Button';
import Modal from './Modal';

import Turn from '../../interfaces/Turn';
import Cell from '../../interfaces/match/Cell';
import useStore from '../../utils/store';
import { renderWordleSquares, renderWordleSquaresComplete } from '../../utils/wordUtils';
import {  
    createMatchUrl,
    getMatchOpponentId,
    isPlayerTurn,
    numericalObjToArray,
} from "../../utils/misc";
import { convertToObject } from 'typescript';

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
    const [isUserTurn, setIsUserTurn] = useState(isPlayerTurn(selectedMatch, user.uid));
    const [isOpponentTurn, setIsOpponentTurn] = useState(isPlayerTurn(selectedMatch, matchOpponent?.id as string));

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
             const renderedTurns = selectedMatch?.turns.map((turn: Turn) => {
                const guessesArray: Cell[][] = numericalObjToArray(turn.guesses) as Cell[][];
                let [ lastGuess ]: Cell[][] = guessesArray.slice(-1) as Cell[][];
                let wordleHistoryRow: JSX.Element = <></>;
                
                if (!lastGuess) lastGuess = Array(5).fill({ letter: '?', status: 'unguessed' }) as Cell[];

                if (turn?.activePlayer === matchOpponent?.id) {
                    console.log('render opponent turn')
                    wordleHistoryRow = (
                        <div className="flex flex-row max-h-[30px] sm:max-h-[40px]">
                            <div className="flex bg-[#775568] p-2.5 items-center justify-center w-[76px] sm:w-[86px]">
                                {guessesArray.length ? `Score: ${guessesArray.length}` : '?'}/6
                            </div>
            
                            <div className="flex flex-row gap-x-2">
                                {renderWordleSquaresComplete(lastGuess)}
                            </div>
            
                            <div className="flex bg-[#775568] p-2.5 items-center justify-center w-[76px] sm:w-[86px]">
                                <span>Your Word</span>
                            </div>
                        </div>
                    )
                } else if (turn?.activePlayer === user?.uid) {
                    console.log('render my turn')
                    wordleHistoryRow = (
                        <div className="flex flex-row max-h-[30px] sm:max-h-[40px]">
                            <div className="flex bg-[#775568] p-2.5 items-center justify-center w-[76px] sm:w-[86px]">
                                <span>Your Word</span>
                            </div>
            
                            <div className="flex flex-row gap-x-2">
                                {renderWordleSquaresComplete(lastGuess)}
                            </div>
            
                            <div className="flex bg-[#775568] p-2.5 items-center justify-center w-[76px] sm:w-[86px]">
                                {guessesArray.length ? `Score: ${guessesArray.length}` : '?'}/6
                            </div>
                        </div>
                    )
                }
                
                return wordleHistoryRow;
            });

            return renderedTurns;
        }

        return <></>;
    }

    const renderMatchCopy = () => {
        if (isUserTurn) {
            return (
                <div className="text-center max-w-[270px] mx-auto sm:max-w-[370px]">
                    <p className="text-2xl sm:text-4xl mb-1">It's your turn!</p>
                    <p className="text-[14px] sm:text-[18px]">Get your game on. Go play!</p>
                </div>
            );
        }

        if (isOpponentTurn) {
            return (
                <div className="text-center max-w-[270px] mx-auto sm:max-w-[370px]">
                    <p className="text-2xl sm:text-4xl mb-1">It's your opponent's turn!</p>
                    <p className="text-[14px] sm:text-[18px]">Come back once they've completed their turn.</p>
                </div>
            );
        }

        return <p className="text-2xl text-center max-w-[270px] mx-auto sm:text-4xl sm:max-w-[370px]">Waiting for an opponent to accept match invite!</p>;
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

            <div className="flex flex-col justify-center gap-y-2 ">
                {renderTurns()}
            </div>

            {renderMatchCopy()}

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