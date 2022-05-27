import { FC, useState } from 'react';
import { doc, setDoc, updateDoc, arrayUnion } from 'firebase/firestore';
import ReactTooltip from 'react-tooltip';

import CopyInput from '../CopyInput';
import Button from '../buttons/Button';
import Modal from './Modal';
import LoadingButton from '../../components/buttons/LoadingButton';
import WordleInput from '../../components/WordleInput';

import { generateMatchUri } from '../../utils/wordUtils';
import Match from '../../interfaces/Match';
import useStore from '../../utils/store';
import ValidationError from '../../interfaces/ValidationError';
import WordList from '../../interfaces/WordList';
import { validateWordle } from '../../utils/validation';
import { WORD_LISTS } from '../../data/constants';

interface Props {
	isOpen: boolean;
	onRequestClose: any;
	hideCloseButton?: boolean;
	returnAction?: any;
	returnCopy: string;
	isLobbyReturn?: boolean;
}

const NewMatchModal: FC<Props> = ({
	isOpen,
	onRequestClose,
	returnAction,
	returnCopy,
	isLobbyReturn,
	hideCloseButton,
}: Props) => {
	const [isSpecificPlayer, setIsSpecificPlayer] = useState(false);
	const [openMatchLink, setOpenMatchLink] = useState('');
	const [specificMatchLink, setSpecificMatchLink] = useState('');
	const [isGeneratingLink, setIsGeneratingLink] = useState(false);
	const [wordle, setWordle] = useState('');
	const [isGenerateLinkReady, setIsGenerateLinkReady] = useState(false);
	const [isOpenMatch, setIsOpenMatch] = useState(false);
	const [wordleValidationErrors, setWordleValidationErrors] = useState([]);
	const [currentWordList, setCurrentWordList] = useState(WORD_LISTS[0] as WordList);

	const { 
		db, 
		user, 
		addMatch, 
	} = useStore();

	const handleGoBack = () => {
		setOpenMatchLink('');
		setIsGenerateLinkReady(false);
		setIsGeneratingLink(false);
		setWordle('');
		setIsOpenMatch(false);
		setIsSpecificPlayer(false);
	};

	const handleGenerateLink = async () => {
		setIsGeneratingLink(true);

		// TODO: Schemas need to be permanently stored and reused
		// TODO: Some kind of validation might be necessary here. For example, checking if 'wordList' actually has a value
		const generatedUri = generateMatchUri(3);
		const newMatch: Match = {
			id: generatedUri,
			outcome: '',
			wordList: currentWordList.name,
			players: {
				guestId: '',
				hostId: user.uid,
			},
			isWinnerNotified: false,
			turns: [
				{
					activePlayer: '',
					isCurrentTurn: true,
					// TODO: This is an (annoying) concession to firebase, which does not support arrays of arrays at the moment
					guesses: {},
					turnState: 'playing',
					keyboardStatus: {},
					wordle,
					hasActivePlayerStartedTurn: false,
				},
			],
		};

		await setDoc(doc(db, 'matches', generatedUri), newMatch);

		const playerDocRef = doc(db, 'players', user.uid);

		await updateDoc(playerDocRef, {
			matches: arrayUnion(generatedUri),
		});

		addMatch(newMatch);

		setIsGeneratingLink(false);
		// TODO: This setOpenMatchLink thing probably needs to be abstracted
		// @ts-ignore
		setOpenMatchLink(`${process.env.REACT_APP_URL}/match/${generatedUri}`); // TODO: Figure out if there's any danger using this ID in the match url
	};

	const handleValidateWordle = (wordle: string = '', currentWordList: WordList = {} as WordList): void => {
		// TODO: this 'message' property can be refactored away when we stop using 'password-validator.js'
		const validationErrors: ValidationError[] = validateWordle(wordle, currentWordList).map(
			(error) => ({ message: error } as ValidationError),
		);

		// @ts-ignore
		setWordleValidationErrors(validationErrors);
		setWordle(wordle);

		if (!validationErrors.length) {
			setIsGenerateLinkReady(true);
		} else {
			setIsGenerateLinkReady(false);
		}
	};

	const handleModalButtonClick = (selection: string) => {
		if (selection === 'open') {
			setIsOpenMatch(true);
			setIsSpecificPlayer(false);
		} else if (selection === 'specific') {
			setIsOpenMatch(false);
			setIsSpecificPlayer(true);
		}
	};

	const handleSelectWordList = (e: React.ChangeEvent<HTMLSelectElement>) => {
		const wordListObj = WORD_LISTS.find((wordList) => wordList.name === e.target.value) as WordList;

		setCurrentWordList(wordListObj);
		handleValidateWordle(wordle, wordListObj);
	}

	return (
		<Modal isOpen={isOpen} onRequestClose={onRequestClose} isLobbyReturn={isLobbyReturn} hideCloseButton={hideCloseButton}>
			{!isSpecificPlayer && !isOpenMatch && (
				<>
					<h2 className="modal-header">Start a New Match</h2>

					<div className="modal-buttonzone">
						{/* TODO: Ensure data-tip works with this new component */}
						<Button
							customStyle="green-button"
							copy="Create Open Match"
							onClick={() => {
								handleModalButtonClick('open');
							}} 
						/>
					</div>

					<Button customStyle="yellow-button-hollow" copy={returnCopy} onClick={returnAction} />

					<ReactTooltip effect="solid" type="dark" />
				</>
			)}

			{isSpecificPlayer && (
				<>
					<h2 className="modal-header">Invite Specific Player</h2>

					<p className="modals-body">
						Get a match link only you and a specific player can use.
					</p>


					<div className="modal-label">
						<span>Your Word</span>
						<input type="text" className="text-black"></input>
					</div>

					<div className="modal-label">
						<span>Enter user email</span>
						<input
							type="text"
							className="text-black pd-2"
							placeholder="User's email"
						></input>
					</div>

					{specificMatchLink ? (
						<input type="text" />
					) : (
						<div className="modal-buttonzone">
							<button className="green-button">Generate Link</button>
							<button
								className="yellow-button"
								onClick={() => {
									setIsOpenMatch(false);
									setIsSpecificPlayer(false);
								}}
							>
								Go Back
							</button>
						</div>
					)}
				</>
			)}

			{isOpenMatch && (
				<>
					<section className="modal-header">
						<h2>
							Create Open Match
						</h2>

						<p className="modal-body">Play with the first person who opens the link!</p>
					</section>

					{!openMatchLink && (
						<div className="modal-label">
							<span>Select a Word List</span>

							<select onChange={handleSelectWordList} value={currentWordList.name} className="form-select appearance-none
							block
							w-full
							px-3
							py-1.5
							text-base
							font-normal
							text-gray-700
							bg-white bg-clip-padding bg-no-repeat
							border border-solid border-gray-300
							rounded
							transition
							ease-in-out
							m-0
							capitalize
							focus:text-gray-700 focus:bg-white focus:border-blue-600 focus:outline-none" aria-label="Default select example">
								{WORD_LISTS.map((wordList) => <option className="capitalize" value={wordList.name}>{wordList.name}</option>)}
							</select>

							<p className="text-sm text-gray-400">{currentWordList?.description}</p>
						</div>
					)}

					<div className="modal-label">
						<span>Your Word</span>

						<WordleInput
							validationErrors={wordleValidationErrors}
							handleInputChange={(e: any) => handleValidateWordle(e.target.value, currentWordList)}
							value={wordle}
							isReadOnly={!!openMatchLink}
						/>

						{openMatchLink ? (
							<div className="modal-buttonzone">
								<CopyInput copyText={openMatchLink} />
							</div>
						) : (
							<LoadingButton
								disabled={!isGenerateLinkReady}
								onClick={handleGenerateLink}
								customStyle="green-button"
								isLoading={isGeneratingLink}
								isLoadingCopy={'Generating...'}
								copy="Generate Link"
							/>
						)}

						<Button customStyle={'yellow-button-hollow mt-4'} copy="Go Back" onClick={handleGoBack} />
					</div>
				</>
			)}
		</Modal>
	);
};

export default NewMatchModal;
