import { FC, useState, useEffect} from 'react';
import { useNavigate } from 'react-router-dom';

import CopyInput from '../CopyInput';
import Button from '../buttons/Button';
import Modal from './Modal';
import WordleHistory from '../WordleHistory';

import Player from '../../interfaces/Player';
import Turn from '../../interfaces/Turn';
import Cell from '../../interfaces/match/Cell';
import useStore from '../../utils/store';
import {
	createMatchUrl,
	getMatchOpponentId,
	isPlayerCurrentTurn,
	numericalObjToArray,
} from '../../utils/misc';
import { renderWordleSquares } from '../../utils/wordUtils';

interface Props {
    nextWordle: string;
    isWordleSentModalOpen: boolean;
	isOpen: boolean;
	onRequestClose: any;
    handleCloseWordleSentModal: any;
    matchLink: string;
}

const WordleSentModal: FC<Props> = ({
    isWordleSentModalOpen,
    handleCloseWordleSentModal,
    nextWordle,
    matchLink,
}: Props) => {
    const navigate = useNavigate();
    
    return (
        <Modal isOpen={isWordleSentModalOpen} onRequestClose={handleCloseWordleSentModal}>
            <h1 className="text-4xl text-center">Your Wordle Has Been Sent!</h1>

            <div className="flex flex-row gap-x-2 justify-center">
                {renderWordleSquares(nextWordle, 'green')}
            </div>

            <div className="flex flex-col text-center">
                <p>Your opponent has been notified that it's their turn.</p>
                <p>
                    If you're antsy, you can always send them this match's link.
                </p>
            </div>

            <div className="flex flex-col gap-y-2">
                <CopyInput copyText={matchLink} />
            </div>

            <Button
                customStyle="yellow-match-button-hollow"
                onClick={() => navigate('/lobby')}
                copy="Return to Lobby"
            ></Button>
        </Modal>
    );
}

export default WordleSentModal;