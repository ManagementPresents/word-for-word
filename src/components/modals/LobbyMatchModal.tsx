import { FC, useState, useEffect} from 'react';
import { useNavigate } from 'react-router-dom';
import { doc, setDoc, getDoc } from 'firebase/firestore';

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
	updateCurrentTurn,
} from '../../utils/misc';

interface Props {
	isOpen: boolean;
	onRequestClose: any;
}

const LobbyMatchModal: FC<Props> = ({ isOpen, onRequestClose }: Props) => {
	const { 
		currentMatch, 
		matchOpponents, 
		user,
		setCurrentMatch,
		db,
	} = useStore();

	const [matchOpponent, setMatchOpponent] = useState({} as Player);
	const [isUserTurn, setIsUserTurn] = useState(isPlayerCurrentTurn(currentMatch, user.uid));
	const [isOpponentTurn, setIsOpponentTurn] = useState(false);

	const navigate = useNavigate();

	const handleGoToMatch = async () => {
		// TODO: Need a loading throbber
		const updatedTurns: Turn[] = updateCurrentTurn(currentMatch.turns, (turn: Turn) => {
			turn.hasActivePlayerStartedTurn = true;
			return turn;
		});

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
		navigate(`/match/${currentMatch.id}`);
	}

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
	};

	const renderMatchButtons = () => {
		if (matchOpponent) {
			return (
				<div className="flex flex-col gap-y-2 mt-4">
					{isUserTurn &&
						<Button 
							copy="Go to Match" 
							customStyle="green-button"
							onClick={handleGoToMatch}
						/>
					}

					<Button
						copy="Return to Lobby"
						customStyle="yellow-button-hollow"
						onClick={onRequestClose}
					/>

					<Button
						copy="Forfeit Match"
						customStyle="grey-button-hollow mt-4 "
						onClick={() => {
							console.log('cancel and delete match');
						}}
					/>
				</div>
			);
		}

		return (
			<Button
				copy="Cancel Invite"
				customStyle="grey-button-hollow w-full"
				onClick={() => {
					console.log('cancel and delete match');
				}}
			/>
		);
	};

	const renderTurns = () => {
		const isSelectedMatch = Object.keys(currentMatch).length;

		if (isSelectedMatch) {
			const renderedTurns = currentMatch?.turns.map((turn: Turn) => {
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
		setMatchOpponent(matchOpponents[getMatchOpponentId(user, currentMatch)]);
	}, [user, matchOpponents, currentMatch]);

	useEffect(() => {
		setIsUserTurn(isPlayerCurrentTurn(currentMatch, user.uid));
	}, [user, currentMatch]);

	useEffect(() => {
		setIsOpponentTurn(isPlayerCurrentTurn(currentMatch, matchOpponent?.id as string),);
	}, [currentMatch, matchOpponent]);

	return (
		<Modal isOpen={isOpen} onRequestClose={onRequestClose}>
			<h1 className="modal-header">{renderTitle()}</h1>

			

			<div className="flex flex-col justify-center gap-y-2 ">{renderTurns()}</div>

			{renderMatchCopy()}

			<div className="modal-label">
				<h3 className="text-[16px]">Match Link</h3>

				<CopyInput copyText={createMatchUrl(currentMatch)} />
				
				{renderMatchButtons()}
			</div>
		</Modal>
	);
};

export default LobbyMatchModal;
