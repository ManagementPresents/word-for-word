import { useState, useEffect, Fragment} from 'react'
import { Default } from 'react-spinners-css';
import { doc, setDoc, updateDoc, arrayUnion, getDoc, } from "firebase/firestore"; 
import ReactTooltip from 'react-tooltip';

import MatchCard from '../components/MatchCard';
import Loading from '../components/Loading';
import Modal from '../components/modals/Modal';
import Button from '../components/buttons/Button';
import LoadingButton from '../components/buttons/LoadingButton';
import WordleInput from '../components/WordleInput';
import PendingModalMatch from '../components/modals/LobbyMatchModal';
import CopyInput from '../components/CopyInput';

import { getMatchOpponentId } from '../utils/misc';
import { validateWordle } from '../utils/validation';
import useStore from '../utils/store';
import { generateMatchUri } from '../utils/wordUtils';
import { TIMEOUT_DURATION } from '../utils/constants';
import Match  from '../interfaces/Match';
import ValidationError from '../interfaces/ValidationError';
import Player from '../interfaces/Player';
import Players from '../interfaces/Players';

interface Props {}

const Lobby = ({}: Props) => {
    const { 
        user, 
        db, 
        matches, 
        setMatches, 
        setMatchOpponents,
        addMatch, 
    } = useStore();

    const [isOpenMatch, setIsOpenMatch] = useState(false);
    const [isSpecificPlayer, setSpecificPlayer] = useState(false);
    const [openMatchLink, setOpenMatchLink] = useState('');
    const [specificMatchLink, setSpecificMatchLink] = useState('');
    const [wordle, setWordle] = useState('');
    const [isNewMatchModalOpen, setIsNewMatchModalOpen] = useState(false);
    const [isGenerateLinkReady, setIsGenerateLinkReady] = useState(false);
    const [isGeneratingLink, setIsGeneratingLink] = useState(false);
    const [wordleValidationErrors, setWordleValidationErrors] = useState([]);
    const [isLoadingMatches, setIsLoadingMatches] = useState(true);
    const [isLobbyMatchModalOpen, setIsLobbyMatchModalOpen] = useState(false);

    useEffect(() => {
        // @ts-ignore
        handleValidateWordle();

        if (user) {
            setIsLoadingMatches(true);
            
            const loadingMatchesTimeout = setTimeout(() => {;
                setIsLoadingMatches(false);
            }, TIMEOUT_DURATION);

            (async () => {
                const playerRef = doc(db, 'players', user.uid);
                const playerSnap = await getDoc(playerRef);
        
                if (playerSnap.exists()) {
                    const matchIds = playerSnap.data().matches;
    
                    /*
                        TODO: These requests make a separate request for each and every match and player they need, individually.
                        That is a ton of requests. This could be a place to optimize performance.
                       
                        To my understanding, doing these requests separately does have the benefit of only pulling matches
                        this client has permission to see. Trying to pull /all/ the matches in, then filtering them client side,
                        would mean /every single match/ is available in the client. Seems like a recipe for disaster.

                        Perhaps this could, eventually, be abstracted to a cloud function end point, where it would be safe to pull/cache all the matches/players, filter on the server, and bring them back here. Need to test and see if that would actually be more performant.
                    */
                    const playerMatches: Match[] = await Promise.all(matchIds.map(async (matchId: string): Promise<Match> => {
                        const matchRef = doc(db, 'matches', matchId);
                        const matchSnap = await getDoc(matchRef);
    
                        return matchSnap.data() as Match;
                    }));
    
                    const opponentPlayersArray: Player[] = await Promise.all(playerMatches.map(async (match: Match): Promise<Player> => {
                        const { players } = match;
                        const matchOpponentId = getMatchOpponentId(user, match);

                        if (matchOpponentId) {
                            const playerRef = doc(db, 'players', matchOpponentId);
                            const playerSnap = await getDoc(playerRef);
        
                            return {
                                id: matchOpponentId,
                                ...playerSnap.data()
                             } as Player;
                        }

                        return {} as Player;
                    }));

                    // Transform (or, i guess, reduce) the opponentPlayersArray into an object, for easier data access
                    const opponentPlayers: Players = opponentPlayersArray.reduce((accum: Players, player: Player): Players => {
                        const hasPlayer = !!Object.keys(player).length;

                        if (hasPlayer) {
                            //
                            const {
                                id,
                                email,
                                /* 
                                    TODO: 'matches' is unlikely to be used, but, it's currently required by the interface.
                                    Investigate in the future if this is the best way to do this
                                */
                               matches,
                            } = player;

                            accum[id as string] = {
                                email,
                                matches,
                                id,
                            }
                        }

                        return accum;
                    }, {} as Players);

                    setMatchOpponents(opponentPlayers);
                    setMatches(playerMatches);
                    setIsLoadingMatches(false);
                    clearInterval(loadingMatchesTimeout);
                }
            })();
        }
    }, [user]);

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
        // TODO: The idea here is totally reset the game creation modal whenever it is closed. There may be a more elegant way to handle this.
        setIsOpenMatch(false);
        setOpenMatchLink('');
        setIsGenerateLinkReady(false);
        setIsGeneratingLink(false);
        setWordleValidationErrors([]);
        setWordle('');
        setIsNewMatchModalOpen(true);
        handleValidateWordle();
    }

    const handleValidateWordle = (wordle: string  = ''): void => {
        // TODO: this 'message' property can be refactored away when we stop using 'password-validator.js'
        const validationErrors: ValidationError[] = validateWordle(wordle).map(error => ({ message: error } as ValidationError));

        // @ts-ignore
        setWordleValidationErrors(validationErrors); 

        if (!validationErrors.length) {
            setWordle(wordle);
            setIsGenerateLinkReady(true);
        } else {
            setIsGenerateLinkReady(false);
        }
    }

    const handleNewMatchModalClose = () => {
        setIsNewMatchModalOpen(false);
    }

    const handleGenerateLink = async () => {
        setIsGeneratingLink(true);

        // TODO: Schemas need to be permanently stored and reused
        const generatedUri = generateMatchUri(3);
        const newMatch: Match = {
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

    // TODO: When a new match is made, it should probably load in the first card slot (i.e. it should appear in the top left of the match box on large devices, and at the very top on mobile devices)
    const renderMatches = (matches: Match[]) => {
        return matches.map((match) => <MatchCard match={match} isLobbyMatchModalOpen={isLobbyMatchModalOpen} setIsLobbyMatchModalOpen={setIsLobbyMatchModalOpen} />);
    }

    const handleMatchBox = () => {
        // TODO: There is some kind of over-rendering nonsense going on here
        if (isLoadingMatches) return <Loading enableCentering={false} />;

        return matches.length ? 
        <Fragment>
            {renderMatches(matches)}
        </Fragment> :
        <div className="mx-auto max-w-lg">
            <h2 className="mb-2 text-2xl font-bold tracking-tight text-[#F1F1F9] dark:text-white">You have no currently active matches.</h2>

            <Button color="green" copy="Start a New Match" onClick={handleStartNewMatch}></Button>
        </div>
    }

    const handleLobbyMatchModalClose = () => {
        setIsLobbyMatchModalOpen(false);
    }

    // TODO: Bring back once you figure out why tooltips prevent the click-copy library from working
    // const handleShortTooltip = (e: any) => {
    //     const { tip }  = e.target.dataset;

    //     // TODO: Kludge way to ensure only the 'copied' tooltips go away automatically
    //     if (tip.toLowerCase().includes('copied')) {
    //         setTimeout(ReactTooltip.hide, 2000);
    //     }
    // }

	return (
        <Fragment>
            <div className="max-w-7xl flex flex-col gap-y-3 h-full md:gap-x-6 md:flex-row mx-auto py-6 px-4 sm:px-6 lg:px-8">
                <div className="flex flex-col gap-y-2 h-max p-4 rounded-lg border border-gray-200 shadow-md bg-[#3C2A34] md:basis-2/12">
                    <div>
                        <h3 className="text-1xl font-bold tracking-tight text-[#F1F1F9]">Welcome back,</h3>
                        {/* TODO: If email is super long, it'll stretch the page */}
                        <h2 className="text-2xl font-bold tracking-tight text-[#15B097]">{user?.email}</h2>
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

                    <Button color="green" copy="Start a New Match" onClick={handleStartNewMatch} />
                </div>

                {/* TODO: This basis-[46rem] business is a kludge fix to ensure the layout looks right on moble */}
                <div className={`grid grid-cols-1 overflow-y-scroll auto-rows-max p-6 basis-[46rem] bg-[#3C2A34] rounded-lg border border-gray-200 shadow-md gap-y-4 ${matches.length ? '' : 'grid grid-cols-1'} md:basis-10/12 md:grid-cols-1 md:gap-x-4 md:grid-flow-row lg:grid-cols-2`}>
                    {handleMatchBox()}
                </div>
            </div>

            <Modal isOpen={isNewMatchModalOpen} onRequestClose={handleNewMatchModalClose}>
                {(!isSpecificPlayer && !isOpenMatch) && 
                    <Fragment>
                        <h2 className="text-xl text-center font-bold tracking-tight text-[#F1F1F9] md:text-2xl">Start a New Match</h2>    

                        <p>blah blah blah basic rules/instructions.</p>
                        
                        {/* TODO: Ensure data-tip works with this new component */}
                        <Button data-tip="This mode is not yet available. Check back soon!" color="yellow" disabled={true} copy="Invite Specific Player" onClick={(e: any) => {
                            e.preventDefault();
                            return;
                            //  handleModalButtonClick('specific') 
                            }}></Button>

                        <Button color="green" copy="Create Open Match" onClick={() => { handleModalButtonClick('open') }}></Button>

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
                                <button className="yellow hover:yellow-hover text-black font-bold py-2 px-4 rounded w-full" onClick={() => {
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
                            
                            <WordleInput validationErrors={wordleValidationErrors} handleValidationErrors={(e: any) => { handleValidateWordle(e.target.value)}} />
                        </div>

                        <div className={`flex justify-center flex-col ${openMatchLink ? 'gap-y-6' : 'gap-y-3'}`}>
                            {openMatchLink ? 
                                <div className="flex flex-col gap-y-2">
                                    <CopyInput copyText={openMatchLink} />
                                </div>
                                :                                     
                                <LoadingButton disabled={!isGenerateLinkReady} onClick={handleGenerateLink} color="green" isLoading={isGeneratingLink} isLoadingCopy={'Generating...'} copy="Generate Link" />
                            }
                            <Button color="yellow" copy="Go Back" onClick={handleStartNewMatch} />
                        </div>
                    </Fragment>
                }
            </Modal>
            
            <PendingModalMatch isOpen={isLobbyMatchModalOpen} onRequestClose={handleLobbyMatchModalClose} />    
        </Fragment>
	)
}

export default Lobby;
