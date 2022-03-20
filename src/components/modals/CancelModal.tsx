import { FC } from 'react';
import {
    doc, 
    deleteDoc,
    setDoc,
    getDoc,
 } from 'firebase/firestore';
import { useState } from 'react';

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

const CancelModal: FC<Props> = ({
    isOpen,
    onRequestClose,
    handleReturn,
}: Props) => {
    const {
        removeMatchById,
        currentMatch,
        db,
        user
    } = useStore();

    const [isCanceling, setIsCanceling] = useState(false);

    const handleCancel = async () => {
        if (!currentMatch.players.guestId) {
            setIsCanceling(true);

            const matchDocRef = doc(db, 'matches', currentMatch.id);
            const playerDocRef = doc(db, 'players', user.uid);

            await deleteDoc(matchDocRef);

            // TODO: We shouldn't have to make a request for the player. It should already be cached at this point (or else we should be able to check if it is, and make the request if it's not)
            const playerSnap = await getDoc(playerDocRef);
            const updatedPlayerMatches = playerSnap.data()?.matches.filter((matchId: string) => matchId !== currentMatch.id);
            
            await setDoc(playerDocRef, {
                ...playerSnap.data(),
                matches: updatedPlayerMatches,
            });

            removeMatchById(currentMatch.id);
            setIsCanceling(false);            
            onRequestClose();
        }
    }

    return (
        <Modal isOpen={isOpen} onRequestClose={onRequestClose}>
            <h1 className="modal-header">Cancel Invite</h1>

            <p className="max-w-xs">A prudent choice. Discretion is the better part of valor.</p>

            <p className="max-w-xs">This will close this invite and delete this match. This will not count as a loss.</p>

            <LoadingButton
                copy={'Confirm Cancel'}
                isLoadingCopy={'Cancelling...'}
                customStyle="green-button"
                isLoading={isCanceling}
                onClick={handleCancel}
            />

            <Button 
                copy="Return"
                customStyle="yellow-button"
                onClick={handleReturn}
            />
        </Modal>
    );
}

export default CancelModal;