import { FC } from 'react';
import {
    doc, 
    updateDoc,
 } from 'firebase/firestore';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import useStore from '../../utils/store';

import Modal from './Modal';
import Button from '../buttons/Button';
import LoadingButton from '../buttons/LoadingButton';

interface Props {
	isOpen: boolean;
	onRequestClose: any;
    handleReturn: any;
    shouldCloseOnOverlayClick?: boolean;
    hideCloseButton?: boolean;
    isLobbyReturn?: boolean;
}

const DeclineModal: FC<Props> = ({
    isOpen,
    onRequestClose,
    handleReturn,
}: Props) => {
    const {
        removeMatchById,
        currentMatch,
        db,
    } = useStore();

    const [isDeclining, setIsDeclining] = useState(false);

    const navigate = useNavigate();

    const handleDecline = async () => {
        if (!currentMatch.players.guestId) {
            setIsDeclining(true);

            const matchDocRef = doc(db, 'matches', currentMatch.id);
  
            await updateDoc(matchDocRef, {
                outcome: 'declined',
            })

            removeMatchById(currentMatch.id);
            setIsDeclining(false);            
            navigate('/lobby');
        }
    }

    return (
        <Modal isOpen={isOpen} onRequestClose={onRequestClose}>
            <h1 className="modal-header">Decline Invite</h1>

            <p className="max-w-xs">A prudent choice. Discretion is the better part of valor.</p>

            <p className="max-w-xs">This will delete this match. This will not count as a loss. Your opponent will be informed of your choice.</p>

            <LoadingButton
                copy={'Confirm Decline'}
                isLoadingCopy={'Declining...'}
                customStyle="green-button"
                isLoading={isDeclining}
                onClick={handleDecline}
            />

            <Button 
                copy="Return"
                customStyle="yellow-button"
                onClick={handleReturn}
            />
        </Modal>
    );
}

export default DeclineModal;