// Adding Firebase imports
import { doc, setDoc, getDoc, updateDoc, arrayUnion } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

// Adding animate import
import 'animate.css';

import { Keyboard } from '../components/Keyboard';
import Modal from '../components/modals/Modal';
import Loading from '../components/Loading';
import Button from '../components/buttons/Button';
import EndTurnModal from '../components/modals/EndTurnModal';
import NewMatchModal from '../components/modals/NewMatchModal';
import WordleSentModal from '../components/modals/WordleSentModal';
import ForfeitModal from '../components/modals/ForfeitModal';
import MatchModal from '../components/modals/MatchModal';
import CancelModal from '../components/modals/CancelModal';
import Login from '../components/Login';
import Register from '../components/Register';

import useStore from '../utils/store';
import {
	arrayToNumericalObj,
	numericalObjToArray,
	updateCurrentTurn,
	getCurrentTurn,
	getMatchOpponentId,
	determineMatchOutcome,
} from '../utils/misc';
import { LETTERS } from '../data/constants';
import Turn from '../interfaces/Turn';
import Match from '../interfaces/Match';
import Player from '../interfaces/Player';
import Cell from '../interfaces/Cell';

import { ReactComponent as Lobby } from '../assets/Lobby.svg';

const words = require('../data/words').default as { [key: string]: boolean };

export const difficulty = {
	easy: 'easy',
	normal: 'normal',
	hard: 'hard',
};

interface State {
	answer: '';
	board: Cell[][];
	// Will be zero indexed
	currentRowIndex: number;
	currentCol: number;
	keyboardStatus: () => { [key: string]: string };
	submittedInvalidWord: boolean;
}

function MatchView() {
	const initialStates: State = {
		answer: '',
		// TODO: Probably a better way to do this. May not even be necessary once the board logic is properly figured out
		board: [
			Array(5)
				.fill(0)
				.map(() => {
					return { letter: '', status: 'unguessed' };
				}),
			Array(5)
				.fill(0)
				.map(() => ({ letter: '', status: 'unguessed' } as Cell)),
			Array(5)
				.fill(0)
				.map(() => ({ letter: '', status: 'unguessed' } as Cell)),
			Array(5)
				.fill(0)
				.map(() => ({ letter: '', status: 'unguessed' } as Cell)),
			Array(5)
				.fill(0)
				.map(() => ({ letter: '', status: 'unguessed' } as Cell)),
			Array(5)
				.fill(0)
				.map(() => ({ letter: '', status: 'unguessed' } as Cell)),
		],
		currentRowIndex: 0,
		currentCol: 0,
		keyboardStatus: () => {
			const keyboardStatus: { [key: string]: string } = {};

			LETTERS.forEach((letter) => {
				keyboardStatus[letter] = 'unguessed';
			});

			return keyboardStatus;
		},
		submittedInvalidWord: false,
	};

	const [currentRowIndex, setCurrentRowIndex] = useState(initialStates.currentRowIndex);
	const [currentCol, setCurrentCol] = useState(initialStates.currentCol);
	const [keyboardStatus, setKeyboardStatus] = useState(initialStates.keyboardStatus());
	const [submittedInvalidWord, setSubmittedInvalidWord] = useState(
		initialStates.submittedInvalidWord,
	);
	const [nextWordle, setNextWordle] = useState('');
	const [matchLink, setMatchLink] = useState('');
	const [isOpenMatchChallenge, setIsOpenMatchChallenge] = useState(false);
	const [isAModalOpen, setIsAModalOpen] = useState(false);
	const [isForfeitModalOpen, setIsForfeitModalOpen] = useState(false);
	const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
	const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
	const [isMatchModalOpen, setIsMatchModalOpen] = useState(false);
	const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);

	const navigate = useNavigate();

	const getCellStyles = (rowNumber: number, colNumber: number, status: string) => {
		if (rowNumber === currentRowIndex) {
			if (status === 'unguessed') {
				return `guesses-style-default ${
					submittedInvalidWord ? 'guesses-border-wrong' : ''
				}`;
			}

			return 'guesses-style-default';
		}

		const currentCell: Cell = board[rowNumber][colNumber] as Cell;

		// TODO: Make an enum or something for these statuses
		switch (currentCell.status) {
			case 'correct':
				return 'green animate__flipInY';
			case 'misplaced':
				return 'yellow animate__flipInY';
			case 'incorrect':
				return 'dark-grey animate__flipInY';
			default:
				return 'animate__flipInY guesses-style-default';
		}
	};

	const addLetter = (letter: string) => {
		setSubmittedInvalidWord(false);

		const generateNewBoard = (prev: Cell[][]) => {
			if (currentCol > 4) {
				return prev;
			}

			const newBoard = [...prev];
			const newCell: Cell = {
				letter,
				status: 'unguessed',
			};

			newBoard[currentRowIndex][currentCol] = newCell;
			return newBoard;
		};

		setBoard(generateNewBoard);

		if (currentCol < 5) {
			setCurrentCol((prev: number) => prev + 1);
		}
	};

	// returns an array with a boolean of if the word is valid and an error message if it is not
	const isValidWord = (word: string): [boolean] | [boolean, string] => {
		if (word.length < 5) return [false, `please enter a 5 letter word`];

		if (!words[word.toLowerCase()])
			return [false, `${word} is not a valid word. Please try again.`];

		return [true];
	};

	const onEnterPress = () => {
		// TODO: Probably not necessary to clone this, but it makes me feel safe
		const currentGuess: Cell[] = [...board[currentRowIndex]];
		const word = currentGuess.map((cell: Cell) => cell.letter).join('');
		const [valid, _err] = isValidWord(word);

		if (!valid) {
			setSubmittedInvalidWord(true);
			console.log({ _err });
			return;
		}

		if (currentRowIndex === 6) return;

		/*
            TODO: The idea here is that we synchronously create an updated version of the board that can then be
            persisted to Firestore. Then, to update the UI, we update state, as per usual. This should HOPEFULLY avoid potential race conditions between firestore & the inherent async of updating component state.
        */
		const updatedBoard: Cell[][] = updateCells(word, currentRowIndex);
		const updatedKeyboardStatus: {} = updateKeyboardStatus(word);

		setCurrentRowIndex((prev: number) => prev + 1);
		setCurrentCol(0);
		setBoard(updatedBoard);
		setKeyboardStatus(updatedKeyboardStatus);

		/* 
            TODO: Right now, in order to update the 'guesses' property of the current turn,
            we make our adjustments to 'guesses' locally then rewrite the entire 'turns' object of the current match in firestore. There may be a way to more intelligently 'push' a new turn in, rather than a total overwrite
        */
		(async () => {
			const updatedTurns: Turn[] = updateCurrentTurn(currentMatch.turns, (turn: Turn) => {
				const guessArray: Cell[][] = numericalObjToArray(turn.guesses);
				const updatedGuessArray = guessArray.concat([currentGuess]);

				turn.guesses = arrayToNumericalObj(updatedGuessArray);
				turn.keyboardStatus = updatedKeyboardStatus;

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
		})();
	};

	const onDeletePress = () => {
		setSubmittedInvalidWord(false);
		if (currentCol === 0) return;

		setBoard((prev: any) => {
			const newBoard = [...prev];
			newBoard[currentRowIndex][currentCol - 1] = '';
			return newBoard;
		});

		setCurrentCol((prev: number) => prev - 1);
	};

	const updateCells = (word: string, rowNumber: number): Cell[][] => {
		// TODO: Kludge, need to ensure capitalization (or lack thereof) for answers and guesses is standardized
		word = word.toUpperCase();

		const fixedLetters: { [key: number]: string } = {};

		const newBoard = [...board];
		newBoard[rowNumber] = [...board[rowNumber]];

		const wordLength = word.length;
		const answerLetters: string[] = answer.split('');

		// Set all to grey
		for (let i = 0; i < wordLength; i++) {
			newBoard[rowNumber][i].status = 'incorrect';
		}

		// Check greens
		for (let i = wordLength - 1; i >= 0; i--) {
			if (word[i] === answer[i]) {
				newBoard[rowNumber][i].status = 'correct';
				answerLetters.splice(i, 1);
				fixedLetters[i] = answer[i];
			}
		}

		// check yellows
		for (let i = 0; i < wordLength; i++) {
			if (answerLetters.includes(word[i]) && newBoard[rowNumber][i].status !== 'correct') {
				newBoard[rowNumber][i].status = 'misplaced';
				answerLetters.splice(answerLetters.indexOf(word[i]), 1);
			}
		}

		return newBoard;
	};

	const isRowAllGreen = (row: Cell[]) => {
		return row.every((cell: Cell) => cell.status === 'correct');
	};

	const updateKeyboardStatus = (word: string): {} => {
		word = word.toUpperCase();

		const newKeyboardStatus = { ...keyboardStatus };
		const wordLength = word.length;

		for (let i = 0; i < wordLength; i++) {
			if (newKeyboardStatus[word[i]] === 'correct') continue;

			if (word[i] === answer[i]) {
				newKeyboardStatus[word[i]] = 'correct';
			} else if (answer.includes(word[i])) {
				newKeyboardStatus[word[i]] = 'misplaced';
			} else {
				newKeyboardStatus[word[i]] = 'incorrect';
			}
		}

		return newKeyboardStatus;
	};

	const params = useParams();

	const {
		db,
		setOpponentPlayer,
		opponentPlayer,
		currentMatch,
		user,
		inviteMatchId,
		setInviteMatchId,
		setCurrentMatch,
		setCurrentTurn,
	} = useStore();

	const [isLandingModalOpen, setIsLandingModalOpen] = useState(false);
	const [isHowToPlayModalOpen, setIsHowToPlayModalOpen] = useState(false);
	const [answer, setAnswer] = useState('');
	const [board, setBoard] = useState(initialStates.board);
	const [isEndTurnModalOpen, setIsEndTurnModalOpen] = useState(false);
	const [isLoadingMatch, setIsLoadingMatch] = useState(true);
	const [isWordleSentModalOpen, setIsWordleSentModalOpen] = useState(false);

	const handleOpenHowToPlay = () => {
		setIsLandingModalOpen(false);
		setIsHowToPlayModalOpen(true);
	};

	const handleGoBackFromHowToPlay = () => {
		setIsHowToPlayModalOpen(false);
		setIsLandingModalOpen(true);
	};

	const handleAcceptMatch = async () => {
		const matchDocRef = doc(db, 'matches', currentMatch.id as string);
		const playerDocRef = doc(db, 'players', user?.uid as string);

		/*
            TODO: This feels stupid. We shouldn't have to follow this with a 'get' just to update the local store. consider bringing in a firebase listener that, well, listens to changes to the 'matches' collection and automatically updates the store accordingly.
            a firebase transaction might be the solution here.
        */
		const updatedTurns: Turn[] = updateCurrentTurn(currentMatch.turns, (turn: Turn) => {
			turn.activePlayer = user?.uid;

			return turn;
		});

		await updateDoc(playerDocRef, {
			matches: arrayUnion(params.matchId),
		});

		await setDoc(
			matchDocRef,
			{
				players: { guestId: user?.uid },
				turns: updatedTurns,
			},
			{ merge: true },
		);

		const updatedCurrentMatchSnap = await getDoc(matchDocRef);

		if (updatedCurrentMatchSnap.exists()) {
			const updatedCurrentMatchData: Match = updatedCurrentMatchSnap.data() as Match;
			const currentTurn: Turn = updatedCurrentMatchData.turns.find(
				(turn: Turn): boolean => turn.isCurrentTurn,
			) as Turn;

			setCurrentMatch(updatedCurrentMatchData);
			setCurrentTurn(currentTurn);

			setIsHowToPlayModalOpen(false);
			setIsLandingModalOpen(false);
		}
	};

	useEffect(() => {
		const reversedBoard = board.slice().reverse();
		const lastFilledRow = reversedBoard.find((row) => {
			return row.every((cell) => cell.status !== 'unguessed');
		});

		const isMatchWon: boolean = (lastFilledRow && isRowAllGreen(lastFilledRow)) as boolean;
		const isGameLost: boolean = ((currentRowIndex === 6) && !isMatchWon) as boolean;

		const currentTurn = getCurrentTurn(currentMatch.turns);

		if (isGameLost) {
			if (!currentMatch.outcome) {
				const currentMatchRef = doc(db, 'matches', currentMatch.id);
				const outcome = determineMatchOutcome(currentMatch);

				// TODO: Update local state AND firestore. this feels ... fragile, to say the least
				setCurrentMatch({
					...currentMatch,
					outcome,
				});

				/*
					TODO: In a perfect world, anything that has to do with determining fundamental game logic should probably not be present in the client. This should be abstracted out to an end point
				*/

				(async () => {
					await setDoc(
						currentMatchRef,
						{
							outcome,
						},
						{ merge: true },
					);
				})();
			}
		}

		if (isMatchWon && currentTurn.activePlayer === user?.uid) {
			/* 
				TODO: It feels abrupt showing this modal with no delay.
				In the long term, perhaps a fun victory animation? 
			*/
			setTimeout(() => {
				setIsEndTurnModalOpen(true);
			}, 500);
		} else if (isGameLost) {
			setTimeout(() => {
				setIsEndTurnModalOpen(true);
			}, 500);
		}
	}, [board, currentRowIndex, currentMatch, db, setCurrentMatch, user?.uid]);

	useEffect(() => {
		(async () => {
			// TODO: This runs every time there's an update to user. This could potentially lead to this running multiple times, which would not be good.
			if (user) {
				setIsLoginModalOpen(false);
				setIsRegisterModalOpen(false);

				const matchDocRef = doc(db, 'matches', params.matchId || '');
				const matchDocSnap = await getDoc(matchDocRef);

				/*
                    TODO: There's probably a neater way to handle multiple, sequential,
                    doc retrievals. Something like 'async.parallel', but for awaits
                */
				if (matchDocSnap.exists()) {
					const matchData: Match = matchDocSnap.data() as Match;
					const hasCurrentMatch = Object.keys(currentMatch).length;

					if (!hasCurrentMatch) setCurrentMatch(matchData);

					const currentTurn: Turn = getCurrentTurn(matchData.turns);

					if (currentTurn) {
						// TODO: The capitalization for the wordle needs to be standardized universally, at some point
						setAnswer(currentTurn.wordle.toUpperCase());

						const opponentPlayerDocRef = doc(db, 'players', getMatchOpponentId(user, matchData));
						const opponentPlayerSnap = await getDoc(opponentPlayerDocRef);

						if (opponentPlayerSnap.exists()) {
							const opponentPlayerData: Player = opponentPlayerSnap.data() as Player;

							setOpponentPlayer(opponentPlayerData);

							if (!currentTurn.activePlayer) {
								// TODO: Need a loading throbber or something for the landing modal
								setIsLandingModalOpen(true);
							} else {
								// TODO: There's probably a need for a loading screen over the entire match while all these async actions happen
								const guessArray: Cell[][] = numericalObjToArray(
									currentTurn.guesses,
								);
								const newBoard: Cell[][] = board.map(
									(row: Cell[], index: number) => {
										if (guessArray[index]) return guessArray[index];

										return row;
									},
								);

								const hasKeyboardStatus = Object.keys(
									currentTurn.keyboardStatus,
								).length;

								if (hasKeyboardStatus) setKeyboardStatus(currentTurn.keyboardStatus);
								
								setCurrentRowIndex(guessArray.length);
								setBoard(newBoard);
							}

							setIsLoadingMatch(false);
						}
					}
				}
			} else if (inviteMatchId) {
				setIsLoadingMatch(false);
				setIsLoginModalOpen(true);
			}
		})();
	}, [user, board, currentMatch, db, params.matchId, setCurrentMatch, setOpponentPlayer, inviteMatchId]);

	// For handling end game state changes and showing the correct 'game over' modals
	useEffect(() => {
		const hasCurrentMatch = Object.keys(currentMatch).length;

		if (hasCurrentMatch && currentMatch?.turns?.length && user) {
			const currentTurn: Turn = getCurrentTurn(currentMatch.turns);

			if (
				currentTurn.activePlayer &&
				currentTurn.turnState === 'playing' &&
				currentTurn.activePlayer !== user?.uid
			) {
				setIsEndTurnModalOpen(false);
				setIsWordleSentModalOpen(true);
				// TODO: This setOpenMatchLink thing probably needs to be abstracted
				// @ts-ignore
				setMatchLink(`${process.env.REACT_APP_URL}/match/${currentMatch.id}`);
			}
		}
	}, [currentMatch, user]);

	useEffect(() => {
		// TODO: This could be simplified by having a single state variable that signifies whether or not any modal is open
		setIsAModalOpen(isLandingModalOpen || isHowToPlayModalOpen || isEndTurnModalOpen || isWordleSentModalOpen || isLoginModalOpen || isRegisterModalOpen || isMatchModalOpen || isCancelModalOpen);
	}, [isLandingModalOpen, isHowToPlayModalOpen, isEndTurnModalOpen, isWordleSentModalOpen, isLoginModalOpen, isRegisterModalOpen, isMatchModalOpen, isCancelModalOpen]);

	useEffect(() => {
		if (!currentMatch.players?.guestId && user && currentMatch.players?.hostId === user?.uid) {
			setIsLoadingMatch(false);
			setIsMatchModalOpen(true);
		}
	}, [currentMatch, user]);

	return (
		<div className={`flex flex-col justify-between h-fill bg-background min-h-[100vh]`}>
			<header className="flex items-center py-2 px-3 text-primary">
				<button
					type="button"
					onClick={() => navigate('/lobby')}
					className="p-1 rounded-full"
				>
					<Lobby />
				</button>

				<h1 className="flex-1 text-center text-xl xxs:text-2xl sm:text-4xl tracking-wide font-bold font-righteous">
					Word for Word
				</h1>
			</header>

			<div className="flex items-center flex-col py-3 flex-1 justify-center relative">
				{isLoadingMatch ? (
					<Loading />
				) : (
					<>
						<div className="relative">
							<div className="grid grid-cols-5 grid-flow-row gap-4">
								{board.map((row: Cell[], rowNumber: number) => {
									return row.map((cell: Cell, colNumber: number) => {
										return (
											<span
												key={colNumber}
												className={`${getCellStyles(
													rowNumber,
													colNumber,
													cell.status,
												)} animate__animated animate__backInDown inline-flex items-center font-medium justify-center text-lg w-[13vw] h-[13vw] xs:w-14 xs:h-14 sm:w-20 sm:h-20`}
											>
												{cell.letter}
											</span>
										);
									});
								})}
							</div>
						</div>

						<Modal
							isOpen={isHowToPlayModalOpen}
							onRequestClose={() => {
								setIsHowToPlayModalOpen(false);
							}}
						>
							<div className="flex flex-col gap-y-3">
								<h1 className="text-center sm:text-3xl text-2xl">
									How to Play
								</h1>

								<ul className="block sm:text-base text-sm">
									<li className="mb-2">
										You have 6 guesses to guess the correct word.
									</li>

									<li className="mb-2">You can guess any valid word.</li>

									<li className="mb-2">
										After each guess, each letter will turn green, yellow,
										or grey.
									</li>
								</ul>

								<div className="mb-3 flex flex-row items-center gap-x-2">
									<span className="bg-[#15B097] text-gray-50 inline-flex items-center justify-center text-3x w-10 h-10">
										W
									</span>

									<span>Letter is in word and in the correct spot</span>
								</div>

								<div className="mb-3 flex flex-row items-center gap-x-2">
									<span className="bg-[#FFCE47] text-gray-50 inline-flex items-center justify-center text-3x w-10 h-10">
										W
									</span>

									<span>Letter is in word but in the wrong spot</span>
								</div>

								<div className="mb-3 flex flex-row items-center gap-x-2">
									<span className="bg-[#A0939A] text-gray-50 inline-flex items-center justify-center text-3x w-10 h-10">
										W
									</span>

									<span>Letter is not in word</span>
								</div>

								<div>
									Alternately, you can just have fun generating 3-word urls
									and making up stories about them. We definitely spent a late
									night in development doing that. Highly recommend.
								</div>

								{/* TODO: Should be a LoadingButton */}
								<Button
									customStyle="green-match-button"
									copy="Let's Play!"
									onClick={handleAcceptMatch}
								/>
								<Button
									customStyle="yellow-button"
									copy="Go Back"
									onClick={handleGoBackFromHowToPlay}
								/>
							</div>
						</Modal>

						<Modal
							isOpen={isLandingModalOpen}
							onRequestClose={() => {
								setIsLandingModalOpen(false);
							}}
							shouldCloseOnOverlayClick={false}
							hideCloseButton={true}
						>
							{/* TODO: Think about using a random "Word for Word" generator here */}
							<h1 className="flex flex-col gap-y-2 text-[20px] sm:text-2xl text-center">
								<span className="text-[#15B097] block">
									{opponentPlayer.email}
								</span>{' '}
								would like to have a Wordle with you!
							</h1>

							<div className="flex flex-col gap-y-3">
								{/* TODO: Should be a LoadingButton */}
								<Button
									onClick={handleAcceptMatch}
									copy="Accept"
									customStyle="green-button"
								/>

								<Button
									onClick={() => {
										setIsLandingModalOpen(false);
									}}
									copy="Rudely Decline"
									customStyle="grey-button"
								/>

								<Button
									onClick={() => {
										setIsLandingModalOpen(false);
									}}
									copy="Politely Decline"
									customStyle="grey-button"
								/>
							</div>

							<div className="flex flex-row gap-x-1 justify-center">
								Not sure what this is?{' '}
								<span className="yellow-link" onClick={handleOpenHowToPlay}>
									Check out how to play.
								</span>
							</div>
						</Modal>

						<Modal
							isOpen={isLoginModalOpen}
							onRequestClose={() => {
								setIsLoginModalOpen(false);
							}}
							shouldCloseOnOverlayClick={false}
							hideCloseButton={true}
						>
							<Login handleRegisterClick={() => { 
								setIsLoginModalOpen(false);
								setIsRegisterModalOpen(true);
							}}/>
						</Modal>

						<Modal
							isOpen={isRegisterModalOpen}
							onRequestClose={() => {
								setIsRegisterModalOpen(false);
							}}
							shouldCloseOnOverlayClick={false}
							hideCloseButton={true}
						>
							<Register handleReturnClick={() => { 
								setIsRegisterModalOpen(false);
								setIsLoginModalOpen(true);
							}}/>
						</Modal>

						<MatchModal
							isOpen={isMatchModalOpen}
							shouldCloseOnOverlayClick={false}
							hideCloseButton={true}
							handleStartNewMatch={() => {}}
							setIsForfeitModalOpen={() => {}}
							handleReturn={() => navigate('/')}
							setIsCancelModalOpen={setIsCancelModalOpen}
							onRequestClose={() => setIsMatchModalOpen(false)}
						/>
						
						<CancelModal
							isOpen={isCancelModalOpen}
							onRequestClose={() => navigate('/')}
							shouldCloseOnOverlayClick={false}
							hideCloseButton={true}
							handleReturn={() => {
								setIsMatchModalOpen(true);
								setIsCancelModalOpen(false);
							}}
						/>

						<EndTurnModal
							isOpen={isEndTurnModalOpen}
							onRequestClose={() => setIsEndTurnModalOpen(false)}
							nextWordle={nextWordle}
							setNextWordle={setNextWordle}
							setIsOpenMatchChallenge={setIsOpenMatchChallenge}
							isLobbyReturn={true}
							returnAction={() => navigate('/lobby')}
							shouldCloseOnOverlayClick={false}
							setIsForfeitModalOpen={setIsForfeitModalOpen}
						/>

						<NewMatchModal
							isOpen={isOpenMatchChallenge}
							onRequestClose={() => console.log('close')}
							returnAction={() => {
								setIsOpenMatchChallenge(false);
								setIsEndTurnModalOpen(true);
							}}
							returnCopy={'Return'}
							isLobbyReturn={true}
						/>

						<WordleSentModal 
							nextWordle={nextWordle}
							isOpen={isWordleSentModalOpen}
							matchLink={matchLink}
							onRequestClose={() => console.log('close')}
							shouldCloseOnOverlayClick={false}
							hideCloseButton={true}
							returnAction={() => navigate('/lobby')}
						/>

						<ForfeitModal 
							isOpen={isForfeitModalOpen}
							onRequestClose={() => { setIsForfeitModalOpen(false) }}
							setIsEndTurnModalOpen={setIsEndTurnModalOpen}
							shouldCloseOnOverlayClick={false}
							isLobbyReturn={true}
							handleKeepPlaying={() => {
								setIsForfeitModalOpen(false);
								setIsEndTurnModalOpen(true);
							}}
						/>

						<div
							className={`h-auto relative mt-6 ${
								!isAModalOpen ? '' : 'invisible'
							}`}
						>
							<Keyboard
								keyboardStatus={keyboardStatus}
								addLetter={addLetter}
								onEnterPress={onEnterPress}
								onDeletePress={onDeletePress}
								gameDisabled={isAModalOpen}
							/>
						</div>
					</>
				)}
			</div>
		</div>
	);
}

export default MatchView;
