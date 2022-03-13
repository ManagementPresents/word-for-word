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

interface Props {
	isOpen: boolean;
	onRequestClose: any;
}

const LobbyMatchModal: FC<Props> = ({ isOpen, onRequestClose }: Props) => {
	const { selectedMatch, matchOpponents, user } = useStore();

	const [matchOpponent, setIsMatchOpponent] = useState({} as Player);
	const [isUserTurn, setIsUserTurn] = useState(isPlayerCurrentTurn(selectedMatch, user.uid));
	const [isOpponentTurn] = useState(
		isPlayerCurrentTurn(selectedMatch, matchOpponent?.id as string),
	);

	const navigate = useNavigate();

	useEffect(() => {
		setIsMatchOpponent(matchOpponents[getMatchOpponentId(user, selectedMatch)]);
	}, [user, matchOpponents, selectedMatch]);

	useEffect(() => {
		setIsUserTurn(isPlayerCurrentTurn(selectedMatch, user.uid));
	}, [user, selectedMatch]);

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
							onClick={() => {
								navigate(`/match/${selectedMatch.id}`);
							}}
						/>
					}

					<Button
						copy="Return to Lobby"
						customStyle="yellow-button-hollow"
						onClick={onRequestClose}
					/>

					<Button
						copy="Forfeit Match"
						customStyle="grey-match-button-hollow mt-4 "
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
				customStyle="grey-match-button-hollow w-full"
				onClick={() => {
					console.log('cancel and delete match');
				}}
			/>
		);
	};

	const renderTurns = () => {
		const isSelectedMatch = Object.keys(selectedMatch).length;

		if (isSelectedMatch) {
			const renderedTurns = selectedMatch?.turns.map((turn: Turn) => {
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

	return (
		<Modal isOpen={isOpen} onRequestClose={onRequestClose}>
			<h1 className="modal-header">{renderTitle()}</h1>

			

			<div className="flex flex-col justify-center gap-y-2 ">{renderTurns()}</div>

			{renderMatchCopy()}

			<div className="modal-label">
				<h3 className="text-[16px]">Match Link</h3>

				<CopyInput copyText={createMatchUrl(selectedMatch)} />
				
				{renderMatchButtons()}
			</div>
		</Modal>
	);
};

export default LobbyMatchModal;
