import { FC } from 'react';

import Modal from './Modal';
import Button from '../buttons/Button';

interface Props {
	isOpen: boolean;
    handleReturn: () => void;
    handleConfirm: () => void;
    onRequestClose?: () => void;
    shouldCloseOnOverlayClick?: boolean;
    hideCloseButton?: boolean;
    isLobbyReturn?: boolean;
}

const ConfirmModal: FC<Props> = ({
    isOpen,
    onRequestClose,
    handleReturn,
    shouldCloseOnOverlayClick,
    hideCloseButton,
    handleConfirm,
}: Props) => {
    return (
        <Modal isOpen={isOpen} onRequestClose={onRequestClose} shouldCloseOnOverlayClick={shouldCloseOnOverlayClick} hideCloseButton={hideCloseButton}>
            <h1 className="modal-header">Confirm Return</h1>

            <p className="max-w-xs">Are you sure? The game can't continue until you send your opponent a word.</p>

            <p className="max-w-xs">However, you can still return to the lobby, and send a word later.</p>

            <Button 
                copy="Send a word"
                customStyle="green-button"
                onClick={handleReturn}
            />

            <Button 
                copy="Go to Lobby"
                customStyle="yellow-button"
                onClick={handleConfirm}
            />
        </Modal>
    );
}

export default ConfirmModal;