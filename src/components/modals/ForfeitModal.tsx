import { FC } from 'react';
import Button from '../buttons/Button';

import Modal from './Modal';

interface Props {
	isOpen: boolean;
	onRequestClose: any;
    shouldCloseOnOverlayClick?: boolean;
    hideCloseButton?: boolean;
}

const ForfeitModal: FC<Props> = ({
    isOpen,
    onRequestClose,
    shouldCloseOnOverlayClick,
    hideCloseButton,
}: Props) => {

    return (
        <Modal isOpen={isOpen} onRequestClose={onRequestClose} shouldCloseOnOverlayClick={shouldCloseOnOverlayClick} hideCloseButton={hideCloseButton}>
            <h1 className="modal-header">Forfeit Match?</h1>

            <p className="max-w-xs">There is honor in knowing when to call it quits, we just want to be sure.</p>

            <Button 
                copy="Confirm Forfeit"
                customStyle="green-button"
            />
            
            <Button 
                copy="Keep Playing"
                customStyle="yellow-button"
            />
        </Modal>
    );
}

export default ForfeitModal;