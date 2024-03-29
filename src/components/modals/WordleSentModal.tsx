import { FC } from 'react';

import CopyInput from '../CopyInput';
import Button from '../buttons/Button';
import Modal from './Modal';

import { renderWordleSquares } from '../../utils/wordUtils';
interface Props {
    nextWordle: string;
	isOpen: boolean;
	onRequestClose: any;
    matchLink: string;
    returnAction: any;
    shouldCloseOnOverlayClick?: boolean;
    hideCloseButton?: boolean;
}

const WordleSentModal: FC<Props> = ({
    isOpen,
    onRequestClose,
    nextWordle,
    matchLink,
    shouldCloseOnOverlayClick,
    hideCloseButton,
    returnAction,
}: Props) => {

    return (
        <Modal isOpen={isOpen} onRequestClose={onRequestClose} shouldCloseOnOverlayClick={shouldCloseOnOverlayClick} hideCloseButton={hideCloseButton}>
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
                customStyle="yellow-button-hollow"
                onClick={returnAction}
                copy="Return to Lobby"
            ></Button>
        </Modal>
    );
}

export default WordleSentModal;