import { useState, useEffect, Fragment} from 'react'
import { Default } from 'react-spinners-css';
import { collection, addDoc } from "firebase/firestore"; 
import { CopyToClipboard } from 'react-copy-to-clipboard';
import ReactTooltip from 'react-tooltip';
// import { Link } from "react-router-dom";
// import { getAuth, signInWithEmailAndPassword } from "firebase/auth";

import { validateWordle } from '../utils/validation';
import ReactModal from 'react-modal';
import useStore from '../utils/store';
import { renderErrors } from '../utils/misc';

type Props = {}

const modalStyle = { 
    overlay: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center', 
        backgroundColor: 'rgba(0, 0, 0, 0.75)',
    },
    // content: {
    //     width: '750px',
    //     height: '750px',
    //     position: 'relative',
    //     backgroundColor: '#3C2A34',
    //     border: '0',
    //     borderRadius: '15%',
    //     padding: '3rem',
    //     inset: '0',
    // },  
};

const Lobby = ({}: Props) => {
    const { user, db } = useStore();

    const [isOpenMatch, setIsOpenMatch] = useState(false);
    const [isSpecificPlayer, setSpecificPlayer] = useState(false);
    const [openMatchLink, setOpenMatchLink] = useState('');
    const [specificMatchLink, setSpecificMatchLink] = useState('');
    const [wordle, setWordle] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isGenerateLinkReady, setIsGenerateLinkReady] = useState(false);
    const [isGeneratingLink, setIsGeneratingLink] = useState(false);
    const [wordleValidationErrors, setWordleValidationErrors] = useState([]);

    useEffect(() => {
        // @ts-ignore
        handleValidateWordle();
    }, []);

    const handleModalButtonClick = (selection: string) => {
        if (selection === 'open') {
            setIsOpenMatch(true);
            setSpecificPlayer(false);
        } else if (selection === 'specific') {
            setIsOpenMatch(false);
            setSpecificPlayer(true);
        }
    }

    const handleStartNewMatch = () => {
        setIsModalOpen(true);
    }

    const handleValidateWordle = (e: React.ChangeEvent<HTMLInputElement>): void => {
        const value = e?.target.value || '';
        // TODO: this 'message' property can be refactored away when we stop using 'password-validator.js'
        const validationErrors = validateWordle(value).map(error => ({ message: error }));

        // @ts-ignore
        setWordleValidationErrors(validationErrors); 

        if (!validationErrors.length) {
            setWordle(value);
            setIsGenerateLinkReady(true);
        } else {
            setIsGenerateLinkReady(false);
        }
    }

    const handleGenerateLink = async () => {
        setIsGeneratingLink(true);

        // TODO: Schemas need to be permanently stored and reused
        const docRef = await addDoc(collection(db, 'matches'), {
            players: {
                guestId: '',
                hostId: user.uid,
                winner: '',
                turns: [{
                    activePlayer: '',
                    currentTurn: true,
                    guesses: [],
                    turnState: 'playing',
                    wordle,
                }],
            }
        });

        setIsGeneratingLink(false);
        // TODO: This setOpenMatchLink thing probably needs to be abstracted
        // @ts-ignore
        setOpenMatchLink(`wordleswithfriendles.com/match/${docRef.id}`); // TODO: Figure out if there's any danger using this ID in the match url
        console.log(`new match started with match id: ${docRef.id}`);
    }

    const handleShortTooltip = (e: any) => {
        const { tip }  = e.target.dataset;

        // TODO: Kludge way to ensure only the 'copied' tooltips go away automatically
        if (tip.toLowerCase().includes('copied')) {
            setTimeout(ReactTooltip.hide, 2000);
        }
    }

	return (
        <Fragment>
            <div className="max-w-6xl flex flex-col gap-y-3 h-full md:gap-x-6 md:flex-row mx-auto py-6 px-4 sm:px-6 lg:px-8">
                <div className="flex gap-y-2 flex-col p-4 rounded-lg border border-gray-200 shadow-md bg-[#3C2A34] h-max md:basis-4/12">
                    <div>
                        <h3 className="text-2xl font-bold tracking-tight text-[#F1F1F9]">Welcome back,</h3>
                        {/* TODO: If email is super long, it'll stretch the page */}
                        <h2 className="text-3xl font-bold tracking-tight text-[#15B097]">{user?.email}</h2>
                    </div>

                    <div className="flex flex-col justify-conter font-normal text-gray-700 dark:text-gray-400">
                        <div className="flex flex-row gap-x-6 md:flex-col">
                            <div>
                                <h3 className="text-base font-bold text-[#F1F1F9] dark:text-gray-400">Matches Played</h3>
                                <span className="text-[#F1F1F9]">489</span>
                            </div>

                            <div>
                                <h3 className="text-base font-bold text-[#F1F1F9] dark:text-gray-400">Wins</h3>
                                <span className="text-[#F1F1F9]">69</span>
                            </div>

                            <div>
                                <h3 className="text-base font-bold text-[#F1F1F9] dark:text-gray-400">Losses</h3>
                                <span className="text-[#F1F1F9]">420</span>
                            </div>
                        </div>
                    </div>

                    <button className="bg-[#15B097] hover:bg-green-700 text-[#F1F1F9] font-bold py-2 px-4 rounded w-full" onClick={handleStartNewMatch}>
                        Start a New Match
                    </button>
                </div>

                {/* TODO: This basis-[46rem] business is a kludge fix to ensure the layout looks right on moble */}
                <div className="flex flex-col items-center justify-center overflow-scroll p-6 basis-[46rem] md:basis-8/12 bg-[#3C2A34] rounded-lg border border-gray-200 shadow-md">
                    <div className="mx-auto max-w-lg">
                        <h2 className="mb-2 text-2xl font-bold tracking-tight text-[#F1F1F9] dark:text-white">You have no currently active matches.</h2>
                        <button className="bg-[#15B097] hover:bg-green-700 text-[#F1F1F9] font-bold py-2 px-4 rounded w-full" onClick={handleStartNewMatch}>
                            Start a New Match
                        </button>
                    </div>
                </div>
            </div>

            {/* @ts-ignore */}
            <ReactModal isOpen={isModalOpen} onRequestClose={() => setIsModalOpen(false)} style={modalStyle} className="modals-style">
                <Fragment>
                    <i className="fixed top-6 right-6 text-6xl not-italic cursor-pointer transition-all hover:text-zinc-500" onClick={() => setIsModalOpen(false)}>X</i>

                    <div className="flex justify-center flex-col text-xs mx-auto gap-y-4 p-6 md:text-base md:gap-y-8 md:p-12 md:max-w-sm">
                        {(!isSpecificPlayer && !isOpenMatch) && 
                            <Fragment>
                                <h2 className="text-xl text-center font-bold tracking-tight text-[#F1F1F9] md:text-2xl">Start a New Match</h2>    

                                <p>blah blah blah basic rules/instructions.</p>

                                <button data-tip="This mode is not yet available. Check back soon!" className={'yellow-style font-bold py-2 px-4 rounded w-full opacity-50 cursor-not-allowed'} onClick={(e) => {
                                    e.preventDefault();
                                    return;
                                    //  handleModalButtonClick('specific') 
                                    }}>Invite Specific Player</button>

                                <button className={'green-style hover:green-hover font-bold py-2 px-4 rounded w-full'} onClick={() => { handleModalButtonClick('open') }}>Create Open Match</button>

                                <ReactTooltip effect='solid' type='dark' />
                            </Fragment>
                        }
                        {isSpecificPlayer && 
                            <Fragment>
                                <h2 className="text-xl text-center font-bold tracking-tight text-[#F1F1F9] md:text-2xl">Invite Specific Player</h2>   

                                <p>Get a match link only you and a specific player can use.</p>

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
                                        <button className="yellow-style hover:yellow-hover text-black font-bold py-2 px-4 rounded w-full" onClick={() => {
                                            setIsOpenMatch(false);
                                            setSpecificPlayer(false);
                                        }}>Go Back</button>
                                    </div>
                                }
                            </Fragment>
                        }

                        {isOpenMatch && 
                            <Fragment>  
                                <h2 className="text-xl text-center font-bold tracking-tight text-[#F1F1F9] md:text-2xl">Create Open Match</h2>   

                                <p>Play with the first person who opens the link!</p>

                                <div className="flex justify-center flex-col gap-y-2">
                                    <span>Your Word</span>
                                    
                                    <input type="text" className={`text-black ${wordleValidationErrors.length ? 'border-red-500 focus:border-red-500 focus:ring-red-500': 'border-[#15B097] focus:border-[#15B097] focus:ring-[#15B097]'}`} placeholder="Enter a word" onChange={handleValidateWordle}></input>
                                    {renderErrors(wordleValidationErrors, 'text-red-500 text-sm')}
                                </div>

                                <div className={`flex justify-center flex-col ${openMatchLink ? 'gap-y-6' : 'gap-y-3'}`}>
                                    {/* TODO: Might want to abstract into 'submit button' component */}
                                    {openMatchLink ? 
                                        <div className="flex flex-col gap-y-2">
                                            <CopyToClipboard text={openMatchLink}>
                                                <input type="text" readOnly value={openMatchLink} className="text-black cursor-pointer" data-tip="Copied!" data-place="right" /> 
                                            </CopyToClipboard>

                                            <CopyToClipboard text={openMatchLink}>
                                                <button className={`bg-[#15B097] text-[#F1F1F9] font-bold py-2 px-4 rounded w-full hover:bg-green-700`} data-tip="Copied!" data-place="right">
                                                    Copy Link
                                                </button>
                                            </CopyToClipboard>

                                            {/* TODO: Bad interaction with copy to clipboard ): */}
                                            {/* <ReactTooltip event='click' effect='solid' type='dark' afterShow={handleShortTooltip} /> */}
                                        </div>
                                        :                                     
                                        <button disabled={!isGenerateLinkReady} onClick={handleGenerateLink} className={`bg-[#15B097] text-[#F1F1F9] font-bold py-2 px-4 rounded w-full ${isGenerateLinkReady && !isGeneratingLink ? 'hover:bg-green-700' : 'opacity-50 cursor-not-allowed'} ${!isGenerateLinkReady ? 'opacity-50 cursor-not-allowed' : ''}`}>
                                            {isGeneratingLink ? <Fragment><span>Generating...</span> <Default color="#fff" size={20}/></Fragment> : <span>Generate Link</span>}
                                        </button>
                                    }
                                    <button className="bg-[#FFCE47] hover:bg-yellow-600 text-black font-bold py-2 px-4 rounded w-full" onClick={() => {
                                        setIsOpenMatch(false);
                                        setSpecificPlayer(false);
                                    }}>Go Back</button>
                                </div>
                            </Fragment>
                        }
                    </div>
                </Fragment>
            </ReactModal>
        </Fragment>
	)
}

export default Lobby;
