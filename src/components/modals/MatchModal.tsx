import { FC, useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { doc, setDoc, getDoc, } from 'firebase/firestore';

import CopyInput from '../CopyInput';
import Button from '../buttons/Button';
import Modal from './Modal';
import WordleHistory from '../WordleHistory';
import Loading from '../Loading';

import Player from '../../interfaces/Player';
import Turn from '../../interfaces/Turn';
import Cell from '../../interfaces/Cell';
import useStore from '../../utils/store';
import {
	createMatchUrl,
	getMatchOpponentId,
	isPlayerCurrentTurn,
	numericalObjToArray,
	updateCurrentTurn,
	hasUserWonMatch,
	getCurrentTurn,
} from '../../utils/misc';

interface Props {
	isOpen: boolean;
	handleStartNewMatch: any;
	setIsForfeitModalOpen: any;
	setIsCancelModalOpen: any;
	userIsInMatch: boolean;
	hideNewMatchButton?: boolean;
	handleReturn?: any;
	onRequestClose?: any;
	shouldCloseOnOverlayClick?: any;
	hideCloseButton?: any;
}

const MatchModal: FC<Props> = ({ 
	isOpen, 
	onRequestClose, 
	handleStartNewMatch,
	setIsForfeitModalOpen,
	setIsCancelModalOpen,
	shouldCloseOnOverlayClick,
	hideCloseButton,
	handleReturn,
	hideNewMatchButton,
	userIsInMatch,
}: Props) => {
	const { 
		currentMatch, 
		matchOpponents, 
		user,
		setCurrentMatch,
		db,
	} = useStore();

	const [matchOpponent, setMatchOpponent] = useState({} as Player);
	const [isUserTurn, setIsUserTurn] = useState(isPlayerCurrentTurn(currentMatch, user?.uid));
	const [isOpponentTurn, setIsOpponentTurn] = useState(false);
	const [hasUserWon, setHasUserWon] = useState(false);
	const [isLoading, setIsLoading] = useState(true);

	const navigate = useNavigate();
	const location = useLocation();

	const handleGoToMatch = async () => {
		const currentTurn = getCurrentTurn(currentMatch.turns);

		if (isUserTurn && !currentTurn.hasActivePlayerStartedTurn) {
			// TODO: Need a loading throbber
			const updatedTurns: Turn[] = updateCurrentTurn(currentMatch.turns, (turn: Turn) => {
				turn.hasActivePlayerStartedTurn = true;
				return turn;
			});

			// TODO: Something here, or around here, is throwing a "invalid document reference" error. i think, maybe, either 'db' is undefined, or the third arg of a 'doc' call
			const currentMatchRef = doc(db, 'matches', currentMatch.id);

			await setDoc(
				currentMatchRef,
				{
					turns: updatedTurns,
				},
				{ merge: true },
			);

			/*
				TODO: Set the local state so we see UI updates
				In the long term, we might need to think of the best way to keep local state and firestore in sync
				(something similar to, but not quite, ember data)
			*/
			setCurrentMatch({ ...currentMatch, turns: updatedTurns });
		}

		if (location.pathname.includes('/match')) {
			// this accounts for the possibility that you're seeing this modal on the /match route
			onRequestClose();
		} else {
			navigate(`/match/${currentMatch.id}`);
		}
	}

	const renderTitle = () => {
		if (!userIsInMatch) {
			return <span>Match in Progress</span>
		}

		if (matchOpponent || isUserTurn) {
			return (
				<span className="flex flex-col">
					<span>Match with</span>
					<span>{matchOpponent?.email}</span>
				</span>
			);
		}

		return 'Awaiting Opponent';
	};

	const renderMatchButtons = () => {
		if (!userIsInMatch) {
			return (
				<div className="flex flex-col gap-y-2 mt-4">
					<Button
						customStyle="green-button"
						copy="Start a New Match"
						onClick={handleStartNewMatch}
					></Button>

					<Button
						copy="Return to Lobby"
						customStyle="yellow-button-hollow"
						onClick={handleReturn ? handleReturn : onRequestClose}
					/>
				</div>
			)
		}

		if (matchOpponent) {
			return (
				<div className="flex flex-col gap-y-2 mt-4">
					{(isUserTurn && !currentMatch.outcome) &&
						<Button 
							copy="Go to Match" 
							customStyle="green-button"
							onClick={handleGoToMatch}
						/>
					}

					{(currentMatch.outcome && !hideNewMatchButton) &&
						<Button
							customStyle="green-button"
							copy="Start a New Match"
							onClick={handleStartNewMatch}
						></Button>
					}

					<Button
						copy="Return to Lobby"
						customStyle="yellow-button-hollow"
						onClick={handleReturn ? handleReturn : onRequestClose}
					/>

					{!currentMatch.outcome &&
						<Button
							copy="Forfeit Match"
							customStyle="grey-button-hollow mt-4 "
							onClick={() => {
								onRequestClose();
								setIsForfeitModalOpen(true); 
							}}
						/>
					}
				</div>
			);
		}

		if (handleReturn) {
			return (
				<>
					<Button 
						copy="Return to Lobby"
						customStyle="yellow-button mb-4"
						onClick={handleReturn}
					/>

					<Button
						copy="Cancel Invite"
						customStyle="grey-button-hollow w-full"
						onClick={() => {
							onRequestClose();
							setIsCancelModalOpen(true)
						}}
					/>
				</>
			);
		}

		return (
			<Button
				copy="Cancel Invite"
				customStyle="grey-button-hollow w-full"
				onClick={() => {
					onRequestClose();
					setIsCancelModalOpen(true)
				}}
			/>
		);
	};

	const renderTurns = () => {
		const isSelectedMatch = Object.keys(currentMatch).length;

		if (isSelectedMatch) {
			const renderedTurns = currentMatch?.turns?.map((turn: Turn) => {
				const guessesArray: Cell[][] = numericalObjToArray(turn.guesses) as Cell[][];

				return (
					<WordleHistory
						guesses={guessesArray}
						turn={turn}
						matchOpponent={matchOpponent}
					/>
				);
			});

			return renderedTurns;
		}

		return [<></>];
	};

	const renderMatchCopy = () => { 
		if (!userIsInMatch) {
			return (
				<>
					<p>You are unable to join this match in progress.</p>
					<p>However, you can always make a new match! No time like the present.</p>
				</>
			);
		}

		if (currentMatch.outcome) {
			if (hasUserWon) {
				return (
					<div className="modal-content">
						<p className="modal-header">You Won!</p>
						
						{/* TODO: this does not feel smart */}
						{(() => {
							if (currentMatch.outcome.toLowerCase().includes('forfeit')) {
								return <p>Your opponent has forfeited.</p>;
							}
						})()}
					</div>
				);
			}
	
			if (!hasUserWon) {
				return (
					<div className="modal-content">
						<p className="modal-header">You Lost!</p>
					</div>
				);
			}
		}

		if (isUserTurn) {
			return (
				<div className="modal-content">
					<p className="modal-header">It's your turn!</p>
					<p className="modal-body mt-0">Get your game on. Go play!</p>
				</div>
			);
		}

		if (isOpponentTurn) {
			return (
				<div className="modal-content">
					<p className="modal-header">It's your opponent's turn!</p>
					<p className="modal-body">
						Come back once they've completed their turn.
					</p>
				</div>
			);
		}

		return (
			<p className="modal-content modal-header">
				Waiting for an opponent to accept match invite!
			</p>
		);
	};

	useEffect(() => {
		const matchOpponentId = getMatchOpponentId(user, currentMatch);

		if (Object.keys(matchOpponents).length) {
			setMatchOpponent(matchOpponents[matchOpponentId]);
			setIsLoading(false);
		} else if (currentMatch?.players?.guestId) {
			(async () => {
				// TODO: Now that MatchModal can be present on both the lobby AND the match view, it would probably be wise to rethink how "matchOpponents" is retrieved
				const playerDocRef = doc(db, 'players', matchOpponentId);
				const playerSnap = await getDoc(playerDocRef);

				setMatchOpponent({ ...playerSnap.data(), id: matchOpponentId,  } as Player);
				setIsLoading(false);
			})();            
		} else {
			// There is no opponent player
			setIsLoading(false);
		}
	}, [user, matchOpponents, currentMatch, db]);

	useEffect(() => {
		setIsUserTurn(isPlayerCurrentTurn(currentMatch, user?.uid));
	}, [user, currentMatch]);

	useEffect(() => {
		setIsOpponentTurn(isPlayerCurrentTurn(currentMatch, matchOpponent?.id as string));
	}, [currentMatch, matchOpponent]);

	useEffect(() => {
		setHasUserWon(hasUserWonMatch(currentMatch, user?.uid));
	}, [currentMatch, user?.uid]);

	return (
		<Modal isOpen={isOpen} onRequestClose={onRequestClose} shouldCloseOnOverlayClick={shouldCloseOnOverlayClick} hideCloseButton={hideCloseButton}>
			{
				isLoading ?
				<Loading fullHeight={false} enableCentering={true} /> :
				<>
					<h1 className="modal-header">{renderTitle()}</h1>

					{userIsInMatch && <div className="flex flex-col justify-center gap-y-2 ">{renderTurns()}</div>}

					{renderMatchCopy()}

					<div className="modal-label">
						{(!currentMatch.outcome && userIsInMatch) &&
							<>
								<h3 className="text-[16px]">Match Link</h3>

								<CopyInput copyText={createMatchUrl(currentMatch)} />
							</>
						}
						
						{renderMatchButtons()}
					</div>
				</>
			}
		</Modal>
	);
};

export default MatchModal;
