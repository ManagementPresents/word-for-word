
import { FC, useState, } from 'react';
import { doc, setDoc, updateDoc, arrayUnion } from "firebase/firestore"; 
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
import { validateWordle } from '../../utils/validation';

interface Props {
    isOpen: boolean,
    onRequestClose: any,
    returnAction?: any,
    returnCopy: string,
    isLobbyReturn?: boolean,
}

const NewMatchModal: FC<Props> = ({ 
    isOpen, 
    onRequestClose,
    returnAction,
    returnCopy,
    isLobbyReturn,
 }: Props) => {
    const [isSpecificPlayer, setIsSpecificPlayer] = useState(false);
    const [openMatchLink, setOpenMatchLink] = useState('');
    const [specificMatchLink, setSpecificMatchLink] = useState('');
    const [isGeneratingLink, setIsGeneratingLink] = useState(false);
    const [wordle, setWordle] = useState('');
    const [isGenerateLinkReady, setIsGenerateLinkReady] = useState(false);
    const [isOpenMatch, setIsOpenMatch] = useState(false);
    const [wordleValidationErrors, setWordleValidationErrors] = useState([]);

    const { 
        db,
        user,
        addMatch 
    } = useStore();

    const handleGoBack = () => {
        setOpenMatchLink('');
        setIsGenerateLinkReady(false);
        setIsGeneratingLink(false);
        setWordle('');
        setIsOpenMatch(false);
        setIsSpecificPlayer(false);
    }

    const handleGenerateLink = async () => {
        setIsGeneratingLink(true);

        // TODO: Schemas need to be permanently stored and reused
        const generatedUri = generateMatchUri(3);
        const newMatch: Match = {
            isMatchEnded: false,
            id: generatedUri,
            players: {
                guestId: '',
                hostId: user.uid
            },
            winner: '',
            turns: [{
                activePlayer: '',
                currentTurn: true,
                // TODO: This is an (annoying) concession to firebase, which does not support arrays of arrays at the moment
                guesses: {},
                turnState: 'playing',
                keyboardStatus: {},
                wordle,
            }]
        };

        await setDoc(doc(db, 'matches', generatedUri), newMatch);

        const playerDocRef = doc(db, 'players', user.uid);

        await updateDoc(playerDocRef, {
            matches: arrayUnion(generatedUri)
        })
        
        addMatch(newMatch);

        setIsGeneratingLink(false);
        // TODO: This setOpenMatchLink thing probably needs to be abstracted
        // @ts-ignore
        setOpenMatchLink(`${process.env.REACT_APP_URL}/match/${generatedUri}`); // TODO: Figure out if there's any danger using this ID in the match url
    }

    const handleValidateWordle = (wordle: string  = ''): void => {
        // TODO: this 'message' property can be refactored away when we stop using 'password-validator.js'
        const validationErrors: ValidationError[] = validateWordle(wordle).map(error => ({ message: error } as ValidationError));

        // @ts-ignore
        setWordleValidationErrors(validationErrors); 
        setWordle(wordle);

        if (!validationErrors.length) {
            setIsGenerateLinkReady(true);
        } else {
            setIsGenerateLinkReady(false);
        }
    }

    const handleModalButtonClick = (selection: string) => {
        if (selection === 'open') {
            setIsOpenMatch(true);
            setIsSpecificPlayer(false);
        } else if (selection === 'specific') {
            setIsOpenMatch(false);
            setIsSpecificPlayer(true);
        }
    }

    return (
        <Modal isOpen={isOpen} onRequestClose={onRequestClose} isLobbyReturn={isLobbyReturn}>
            {(!isSpecificPlayer && !isOpenMatch) && 
                <>
                    <h2 className="text-xl text-center font-bold tracking-tight modals-header md:text-2xl">Start a New Match</h2>    

                    <p className="modals-body">blah blah blah basic rules/instructions.</p>
                    
                    <div className="flex flex-col gap-y-2">
                        {/* TODO: Ensure data-tip works with this new component */}
                        <Button data-tip="This mode is not yet available. Check back soon!" color="yellow" disabled={true} copy="Invite Specific Player" onClick={(e: any) => {
                            e.preventDefault();
                            return;
                            //  handleModalButtonClick('specific') 
                            }}></Button>

                        <Button color="green" copy="Create Open Match" onClick={() => { handleModalButtonClick('open') }}></Button>
                    </div>

                    <Button color="yellow" copy={returnCopy} onClick={returnAction} />

                    <ReactTooltip effect='solid' type='dark' />
                </>
            }

            {isSpecificPlayer && 
                <>
                    <h2 className="text-xl text-center font-bold tracking-tight modals-header md:text-2xl">Invite Specific Player</h2>   

                    <p className="modals-body">Get a match link only you and a specific player can use.</p>

                    <div className="flex justify-center flex-col">
                        <span>Your Word</span>
                        <input type="text" className="text-black"></input>
                    </div>

                    <div className="flex justify-center flex-col">
                        <span>Enter user email</span>
                        <input type="text" className="text-black pd-2" placeholder="User's email"></input>
                    </div> 

                    {specificMatchLink ?
                        <input type="text" />
                        :
                        <div className="flex justify-center flex-col gap-y-2">
                            <button className="green-style hover:green-hover font-bold py-2 px-4 rounded w-full">Generate Link</button>
                            <button className="yellow hover:yellow-hover text-black font-bold py-2 px-4 rounded w-full" onClick={() => {
                                setIsOpenMatch(false);
                                setIsSpecificPlayer(false);
                            }}>Go Back</button>
                        </div>
                    }
                </>
            }

            {isOpenMatch && 
                <>  
                    <h2 className="text-xl text-center font-bold tracking-tight modals-header md:text-2xl">Create Open Match</h2>   

                    <p className="modals-body">Play with the first person who opens the link!</p>

                    <div className="flex justify-center flex-col gap-y-2">
                        <span>Your Word</span>
                        
                        <WordleInput 
                            validationErrors={wordleValidationErrors} 
                            handleInputChange={(e: any) => handleValidateWordle(e.target.value)} 
                            value={wordle} 
                        />
                    </div>

                    <div className={`flex justify-center flex-col ${openMatchLink ? 'gap-y-6' : 'gap-y-3'}`}>
                        {openMatchLink ? 
                            <div className="flex flex-col gap-y-2">
                                <CopyInput copyText={openMatchLink} />
                            </div>
                            :                                     
                            <LoadingButton disabled={!isGenerateLinkReady} onClick={handleGenerateLink} color="green" isLoading={isGeneratingLink} isLoadingCopy={'Generating...'} copy="Generate Link" />
                        }
                        <Button color="yellow" copy="Go Back" onClick={handleGoBack} />
                    </div>
                </>
            }
        </Modal>
    );
}

export default NewMatchModal;