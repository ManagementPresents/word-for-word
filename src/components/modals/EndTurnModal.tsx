
import { FC, useEffect, useState, } from 'react';
import { doc, setDoc, } from "firebase/firestore"; 
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCircleUser } from "@fortawesome/free-solid-svg-icons";
import { useNavigate } from 'react-router-dom';

import Button from '../buttons/Button';
import Modal from './Modal';
import WordleInput from "../../components/WordleInput";
import LoadingButton from "../../components/buttons/LoadingButton";

import useStore from '../../utils/store';
import { 
    getCurrentTurn,
    getMatchOpponentId,
    updateCurrentTurn,
    addTurn,
} from '../../utils/misc';
import { renderWordleSquares } from '../../utils/wordUtils';
import { validateWordle } from '../../utils/validation';
import ValidationError from '../../interfaces/ValidationError';
import Turn from '../../interfaces/Turn';
import GameState from '../../interfaces/GameState';

interface Props {
    isOpen: boolean,
    onRequestClose: any,
    nextWordle: string,
    setNextWordle: any,
    gameState: string,
}

const EndTurnModal: FC<Props> = ({ isOpen, onRequestClose, nextWordle, setNextWordle, gameState, }: Props) => {
    const { 
        opponentPlayer, 
        db,
        user,
        currentMatch,
        setCurrentMatch,
    } = useStore();

    const [answer] = useState(getCurrentTurn(currentMatch.turns)?.wordle.toUpperCase());
    const [wordleValidationErrors, setWordleValidationErrors] = useState([]);
    const [isSendingWordle, setIsSendingWordle] = useState(false);

    const navigate = useNavigate();

    const handleValidateWordle = (wordle: string  = ''): void => {
        // TODO: this 'message' property can be refactored away when we stop using 'password-validator.js'
        const validationErrors: ValidationError[] = validateWordle(wordle).map(error => ({ message: error } as ValidationError));

        // @ts-ignore
        setWordleValidationErrors(validationErrors); 

        if (!validationErrors.length) {
            setNextWordle(wordle);
            // setIsNextWordleReady(true);
        } else {
            // setIsNextWordleReady(false);
            setNextWordle('');
        }
    }

    const handleSendWordle = async () => {
        const opponentId: string = getMatchOpponentId(user, currentMatch);

        const newTurn: Turn = {
            activePlayer: opponentId,
            currentTurn: true,
            guesses: {},
            keyboardStatus: {},
            turnState: 'playing',
            wordle: nextWordle,
        };
        const updatedTurns: Turn[] = updateCurrentTurn(currentMatch.turns, (turn: Turn) => {
            turn.currentTurn = false;
            // TODO: This state obviously needs to depend on whether they won or lost
            turn.turnState = 'won';

            return turn;
        });
        const newTurns: Turn[] = addTurn(updatedTurns, newTurn);

        setIsSendingWordle(true);

        const currentMatchRef = doc(db, 'matches', currentMatch.id);

        await setDoc(currentMatchRef, {
            turns: newTurns,
        }, { merge: true });

        /*
            TODO: Set the local state so we see UI updates
            In the long term, we might need to think of the best way to keep local state and firestore in sync
            (something similar to, but not quite, ember data)
        */
        setCurrentMatch({...currentMatch, turns: newTurns});
        setIsSendingWordle(false);
    }

    const renderEndTurnCopy = () => {
        if (gameState === GameState.WON) {
            return (
                <>
                    <span className="yellow-font uppercase text-center text-[24px] md:text-[42px]">You guessed their word!</span>

                    <div className="flex flex-row gap-x-2 justify-center">
                        {renderWordleSquares(answer, 'green')}
                    </div>
                </>
            );
        } else if (gameState === GameState.LOST) {
            return (
                <>
                    <span className="yellow-font uppercase text-center text-[24px] md:text-[42px]">You lost the game!</span>

                    <div className="flex flex-col gap-y-2">
                        <span className="text-center">Your Opponent's Word Was:</span>

                        <div className="flex flex-row gap-x-2 justify-center">
                            {renderWordleSquares(answer, 'green')}
                        </div>
                    </div>
                </>
            );
        }

        return <></>;
    }

    const renderEndTurnInputs = () => {
        if (gameState === GameState.WON) {
            return (
                <>
                    <div className="flex flex-col gap-y-2 text-center mx-auto md:min-w-[250px]">
                        <span className="text-[20px] md:text-[28px]">Now it's your turn!</span>
            
                        <span className="text-[12px] md:text-[16px]">Send them a word right back!</span>
                        <WordleInput validationErrors={wordleValidationErrors} handleValidationErrors={(e: React.ChangeEvent<HTMLInputElement>) => { handleValidateWordle(e.target.value) }} />
                    </div>
            
                    {/* TODO: Hook up isLoading and onClick props */}
                    <LoadingButton copy={'Send Wordle'} isLoadingCopy={'Sending Wordle...'} color='green' isLoading={isSendingWordle} disabled={!!wordleValidationErrors.length} onClick={handleSendWordle} />
            
                    <div className="flex flex-row gap-x-1 justify-center items-center">
                        <span className="basis-full">Tired of this chicanery? </span>
            
                        <Button copy="Forfeit Game" color="gray" onClick={() => { console.log('forfeit game')}} />
                    </div>
                </>
            );
        } else if (gameState === GameState.LOST) {
            return (
                <div className="flex flex-col items-center gap-y-3">
                    <Button copy="Rematch?" color="grey" />
                    <Button copy="Challenge Someone Else" color="grey" />
                    <Button copy="Comfort Yourself, Make Up a Guy" color="grey" onClick={() => navigate('/makeupaguy')} />
                    <Button copy="Back to Lobby" color="yellow" onClick={() => navigate('/lobby')} />
                </div>
            );
        }

        return <></>;
    }

    useEffect(() => {
        // TODO: Clunky way to ensure we see the validation errors the first time the wordle input renders
        handleValidateWordle();
    }, []); 

    return (
        <Modal isOpen={isOpen} onRequestClose={onRequestClose}>
            {/* TODO: Think about using a random "Word for Word" generator here */}
            <div className="flex flex-col gap-y-2">
                <h1 className="text-4xl text-center">
                    Turn {currentMatch.turns.length}
                </h1>

                <div className="flex flex-row items-center justify-center gap-x-3">
                    <div className="flex flex-col gap-y-2">
                        <FontAwesomeIcon icon={faCircleUser} size='4x' />
                        <span>{opponentPlayer.email}</span>
                    </div>

                    <span>vs</span>

                    <div className="flex flex-col gap-y-2">
                        <FontAwesomeIcon icon={faCircleUser} size='4x' />
                        <span>{user.email}</span>
                    </div>
                </div>
            </div>

            {renderEndTurnCopy()}

            {renderEndTurnInputs()}
        </Modal>
    );
}

export default EndTurnModal;