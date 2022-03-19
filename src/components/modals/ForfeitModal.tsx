import { FC } from 'react';
import { doc, setDoc } from 'firebase/firestore';
import { useState } from 'react';

import useStore from '../../utils/store';
import MatchOutcome from '../../enums/MatchOutcome';

import Modal from './Modal';
import Button from '../buttons/Button';
import LoadingButton from '../buttons/LoadingButton';

interface Props {
	isOpen: boolean;
	onRequestClose: any;
    setIsEndTurnModalOpen: any;
    handleKeepPlaying: any;
    shouldCloseOnOverlayClick?: boolean;
    hideCloseButton?: boolean;
    isLobbyReturn?: boolean;
}

const ForfeitModal: FC<Props> = ({
    isOpen,
    onRequestClose,
    shouldCloseOnOverlayClick,
    hideCloseButton,
    setIsEndTurnModalOpen,
    isLobbyReturn,
    handleKeepPlaying,
}: Props) => {
    const {
        setCurrentMatch,
        currentMatch,
        db,
        user
    } = useStore();

    const [isForfeiting, setIsForfeiting] = useState(false);

    const handleForfeit = async () => {
        const { players } = currentMatch;
        let outcome = user.uid === players.guestId ? MatchOutcome.GUEST_FORFEIT : MatchOutcome.HOST_FORFEIT;

        setIsForfeiting(true);

        const currentMatchRef = doc(db, 'matches', currentMatch.id);

        // TODO: Will need a throbber here
        await setDoc(
            currentMatchRef,
            {
                outcome
            },
            { merge: true },
        );

        // TODO: It continues to feel fragile, manually updating the 'global' state after making firestore calls. What would likely be better is ensuring these updates happen in one of the firestore document change event listeners, so it's automatic.

        setCurrentMatch({
            ...currentMatch,
            outcome
        });

        setIsForfeiting(false);
        setIsEndTurnModalOpen(true);
        onRequestClose();
    }

    return (
        <Modal isOpen={isOpen} onRequestClose={onRequestClose} shouldCloseOnOverlayClick={shouldCloseOnOverlayClick} hideCloseButton={hideCloseButton} isLobbyReturn={isLobbyReturn}>
            <h1 className="modal-header">Forfeit Match?</h1>

            <p className="max-w-xs">There is honor in knowing when to call it quits, we just want to be sure.</p>

            <p className="max-w-xs">This will end the match and be counted as your loss. Your opponent will be notified.</p>

            <LoadingButton
                copy={'Confirm Forfeit'}
                isLoadingCopy={'Forfeiting...'}
                customStyle="green-button"
                isLoading={isForfeiting}
                onClick={handleForfeit}
            />

            <Button 
                copy="Keep Playing"
                customStyle="yellow-button"
                onClick={handleKeepPlaying}
            />
        </Modal>
    );
}

export default ForfeitModal;