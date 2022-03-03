//Adding Firebase imports
import { doc, setDoc, getDoc, arrayUnion } from "firebase/firestore"; 
import { useEffect, useState } from 'react'
import { useNavigate, useParams } from "react-router-dom";

import { Keyboard } from '../components/Keyboard'
import Modal from '../components/Modal';
import Loading from '../components/Loading';
import Button from '../components/buttons/Button';
import WordleInput from "../components/WordleInput";
import LoadingButton from "../components/buttons/LoadingButton";

import useStore from '../utils/store';
import { arrayToNumericalObj, numericalObjToArray, } from "../utils/misc";
import { validateWordle } from "../utils/validation";
import { letters, status } from '../constants'
import { renderWordleSquares } from "../utils/wordUtils";
import Turn from "../interfaces/Turn";
import Match from '../interfaces/Match';
import Player from '../interfaces/Player';
import ValidationError from "../interfaces/ValidationError";
import Cell from '../interfaces/match/Cell';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCircleUser } from "@fortawesome/free-solid-svg-icons";
import { ReactComponent as Lobby } from '../data/Lobby.svg'

const words = require('../data/words').default as { [key: string]: boolean }

const state = {
  playing: 'playing',
  won: 'won',
  lost: 'lost',
}

export const difficulty = {
  easy: 'easy',
  normal: 'normal',
  hard: 'hard',
}

interface State {
  answer: '',
  gameState: string
  board: Cell[][]
  cellStatuses: string[][]
  currentRow: number
  currentCol: number
  letterStatuses: () => { [key: string]: string }
  submittedInvalidWord: boolean
}

function MatchView() {
    const initialStates: State = {
        answer: '',
        gameState: state.playing,
        /* 
            TODO: Probably a better way to do this. May not even be necessary once the board logic is properly figured out
        */
        board: [
            Array(5).fill(0).map((emptyCell) => { return { letter: '', status: 'unguessed' }}),
            Array(5).fill(0).map((emptyCell) => ({ letter: '', status: 'unguessed' } as Cell)),
            Array(5).fill(0).map((emptyCell) => ({ letter: '', status: 'unguessed' } as Cell)),
            Array(5).fill(0).map((emptyCell) => ({ letter: '', status: 'unguessed' } as Cell)),
            Array(5).fill(0).map((emptyCell) => ({ letter: '', status: 'unguessed' } as Cell)),
        ],
        cellStatuses: Array(6).fill(Array(5).fill(status.unguessed)),
        currentRow: 0,
        currentCol: 0,
        letterStatuses: () => {
            const letterStatuses: { [key: string]: string } = {};

            letters.forEach((letter) => {
                letterStatuses[letter] = status.unguessed
            });

            return letterStatuses;
        },
        submittedInvalidWord: false,
    }

    const [gameState, setGameState] = useState('playing');
    const [cellStatuses, setCellStatuses] = useState(initialStates.cellStatuses);
    const [currentRow, setCurrentRow] = useState(initialStates.currentRow);
    const [currentCol, setCurrentCol] = useState(initialStates.currentCol);
    const [letterStatuses, setLetterStatuses] = useState(initialStates.letterStatuses());
    const [submittedInvalidWord, setSubmittedInvalidWord] = useState(initialStates.submittedInvalidWord);
    const [nextWordle, setNextWordle] = useState('');
    const [isNextWordleReady, setIsNextWordleReady] = useState(false);

    // TODO: Remove Streaks
    const [currentStreak, setCurrentStreak] = useState(0)
    const [longestStreak, setLongestStreak] = useState(0);

    // TODO: Change Local Storage to Firebase Storage for "first time" guest identification purposes
    const [firstTime, setFirstTime] = useState(true);

    // TODO: Kill streaks
    const [guessesInStreak, setGuessesInStreak] = useState(firstTime ? 0 : -1);

    const eg: { [key: number]: string } = {}
    const [exactGuesses, setExactGuesses] = useState(eg);

    const navigate = useNavigate();

    const isLoading = useStore((state) => state.isLoading);
    const { setIsLoading } = useStore();
    const { user } = useStore();

    //To-Do: Check this later if it pops up whatever modal, if that's a problem for our changes
    useEffect(() => {
        if (gameState !== state.playing) {
            setTimeout(() => {
                setIsEndTurnModalOpen(true);
            }, 500)
        }
    }, [gameState])

    const getCellStyles = (rowNumber: number, colNumber: number, status: string) => {
        if (rowNumber === currentRow) {
            if (status) {
                return `guesses-style-default border ${
                    submittedInvalidWord ? 'border guesses-border-wrong' : ''
                }`
            }

            return 'guesses-style-default border'
        }

        const currentCell: Cell = board[rowNumber][colNumber] as Cell;

        // TODO: Make an enum or something for these statuses
        switch (currentCell.status) {
            case 'correct':
                return 'green'
            case 'misplaced':
                return 'yellow'
            case 'incorrect':
                return 'gray'
            default:
                return 'border guesses-style-default'
        }
    }

    const addLetter = (letter: string) => {
        setSubmittedInvalidWord(false);

        setBoard((prev: Cell[][]) => {
            if (currentCol > 4) {
                return prev
            }

            const newBoard = [...prev]
            const newCell: Cell = {
                letter,
                status: 'unguessed'
            }

            newBoard[currentRow][currentCol] = newCell
            return newBoard
        })
        
        if (currentCol < 5) {
            setCurrentCol((prev: number) => prev + 1)
        }
    }

  // returns an array with a boolean of if the word is valid and an error message if it is not
  const isValidWord = (word: string): [boolean] | [boolean, string] => {
    if (word.length < 5) return [false, `please enter a 5 letter word`]

    if (!words[word.toLowerCase()]) return [false, `${word} is not a valid word. Please try again.`]
    
    return [true]

    // const guessedLetters = Object.entries(letterStatuses).filter(([letter, letterStatus]) =>
    //   [status.yellow, status.green].includes(letterStatus)
    // )


    // const yellowsUsed = guessedLetters.every(([letter, _]) => { return word.includes(letter) })
    // const greensUsed = Object.entries(exactGuesses).every(
    //   ([position, letter]) => word[parseInt(position)] === letter
    // )

    // if (!yellowsUsed || !greensUsed)
    //   return [false, `In hard mode, you must use all the hints you've been given.`]
  }

    const onEnterPress = async () => {
        const currentGuess: Cell[] = board[currentRow];
        const word = currentGuess.map((cell: Cell) => cell.letter).join('')
        const [valid, _err] = isValidWord(word)

        if (!valid) {
            setSubmittedInvalidWord(true);
            console.log({ _err });
            return;
        }

        if (currentRow === 6) return

        /* 
            TODO: Right now, in order to update the 'guesses' property of the current turn,
            we make our adjustments to 'guesses' locally then rewrite the entire 'turns' object of the current match in firestore. There may be a way to more intelligently 'push' a new turn in, rather than a total overwrite
        */
        const updatedTurns: Turn[] = currentMatch.turns.map((turn: Turn): Turn => {
            if (!turn.currentTurn) return turn;

            const guessArray: Cell[][] = numericalObjToArray(turn.guesses);
            const updatedGuessArray = guessArray.concat([currentGuess]);

            turn.guesses = arrayToNumericalObj(updatedGuessArray);

            return turn;
            
        }) as Turn[];
        const currentMatchRef = doc(db, 'matches', currentMatch.id);


        await setDoc(currentMatchRef, {
            turns: updatedTurns,
        }, { merge: true });

        updateCells(word, currentRow)
        updateLetterStatuses(word)
        setCurrentRow((prev: number) => prev + 1)
        setCurrentCol(0)

        //to-do: remove streaks
        // Only calculate guesses in streak if they've
        // started a new streak since this feature was added.
        if (guessesInStreak >= 0) {
            setGuessesInStreak((prev: number) => prev + 1)
        }
    }

  const onDeletePress = () => {
    setSubmittedInvalidWord(false)
    if (currentCol === 0) return

    setBoard((prev: any) => {
      const newBoard = [...prev]
      newBoard[currentRow][currentCol - 1] = ''
      return newBoard
    })

    setCurrentCol((prev: number) => prev - 1)
  }

const updateCells = (word: string, rowNumber: number) => {
    // TODO: Kludge, need to ensure capitalization (or lack thereof) for answers and guesses is standardized
    word = word.toUpperCase();

    const fixedLetters: { [key: number]: string } = {}

    const generateNewBoard = (prev: any): Cell[][] => {
        const newBoard = [...prev];
        newBoard[rowNumber] = [...prev[rowNumber]];

        const wordLength = word.length;
        const answerLetters: string[] = answer.split('');

        // Set all to gray
        for (let i = 0; i < wordLength; i++) {
            newBoard[rowNumber][i].status = 'incorrect';
        }

        // Check greens
        for (let i = wordLength - 1; i >= 0; i--) {
            if (word[i] === answer[i]) {
                newBoard[rowNumber][i].status = 'correct';
                answerLetters.splice(i, 1)
                fixedLetters[i] = answer[i]
            }
        }

        // check yellows
        for (let i = 0; i < wordLength; i++) {
            if (answerLetters.includes(word[i]) && newBoard[rowNumber][i] !== status.green) {
                newBoard[rowNumber][i].status = 'misplaced';
                answerLetters.splice(answerLetters.indexOf(word[i]), 1)
            }
        }

        return newBoard;
    };

    setBoard(generateNewBoard);

    setExactGuesses((prev: { [key: number]: string }) => ({ ...prev, ...fixedLetters }))
}

    const isRowAllGreen = (row: Cell[]) => {
        return row.every((cell: Cell) => cell.status ===  'correct')
    }

    const updateLetterStatuses = (word: string) => {
        word = word.toUpperCase();

        setLetterStatuses((prev: { [key: string]: string }) => {
            const newLetterStatuses = { ...prev }
            const wordLength = word.length

            for (let i = 0; i < wordLength; i++) {
                if (newLetterStatuses[word[i]] === status.green) continue

                if (word[i] === answer[i]) {
                    newLetterStatuses[word[i]] = status.green
                } else if (answer.includes(word[i])) {
                    newLetterStatuses[word[i]] = status.yellow
                } else {
                    newLetterStatuses[word[i]] = status.gray
                }
            }

            return newLetterStatuses
        })
    }

    const playAgain = () => {
        if (gameState === state.lost) {
            setGuessesInStreak(0)
        }

        // setAnswer(initialStates.answer())
        //to-do: change "set answer" to grab the wordle from firebase
        setAnswer('');
        setGameState(initialStates.gameState)
        setBoard(initialStates.board)
        setCellStatuses(initialStates.cellStatuses)
        setCurrentRow(initialStates.currentRow)
        setCurrentCol(initialStates.currentCol)
        setLetterStatuses(initialStates.letterStatuses())
        setSubmittedInvalidWord(initialStates.submittedInvalidWord)
        setExactGuesses({})

        // closeModal()
    }

    /* --- */
    const params = useParams();

    const { 
        db, 
        setOpponentPlayer, 
        opponentPlayer, 
        currentMatch, 
        currentTurn,
        setCurrentMatch, 
        setCurrentTurn, 
    } = useStore();
    
    const [isLandingModalOpen, setIsLandingModalOpen] = useState(false);
    const [isHowToPlayModalOpen, setIsHowToPlayModalOpen] = useState(false);
    const [answer, setAnswer] = useState('');
    const [board, setBoard] = useState(initialStates.board);
    const [isEndTurnModalOpen, setIsEndTurnModalOpen] = useState(false);
    const [wordleValidationErrors, setWordleValidationErrors] = useState([]);

    const handleCloseEndTurnModal = () => {
        setIsEndTurnModalOpen(false);
    }

    const handleOpenHowToPlay = () => {
        setIsLandingModalOpen(false);
        setIsHowToPlayModalOpen(true);
    }

    const handleGoBackFromHowToPlay = () => {
        setIsHowToPlayModalOpen(false);
        setIsLandingModalOpen(true);
    }

    const handleAcceptMatch = async () => {
        const docRef = doc(db, 'matches', currentMatch.id as string);

        /*
            TODO: This feels stupid. We shouldn't have to follow this with a 'get' just to update the localStore. consider bringing in a firebase listener that, well, listens to changes to the 'matches' collection and automatically updates the store accordingly
        */
        await setDoc(docRef, { players: { guestId: user.uid }}, { merge: true });
        const updatedCurrentMatchSnap = await getDoc(docRef);

        if (updatedCurrentMatchSnap.exists()) {
            const updatedCurrentMatchData: Match = updatedCurrentMatchSnap.data() as Match;
            const currentTurn: Turn = updatedCurrentMatchData.turns.find((turn: Turn): boolean => turn.currentTurn) as Turn;

            setCurrentMatch(updatedCurrentMatchData);
            setCurrentTurn(currentTurn);

            setIsHowToPlayModalOpen(false);
            setIsLandingModalOpen(false);
        }
    }

    const handleValidateWordle = (wordle: string  = ''): void => {
        // TODO: this 'message' property can be refactored away when we stop using 'password-validator.js'
        const validationErrors: ValidationError[] = validateWordle(wordle).map(error => ({ message: error } as ValidationError));

        // @ts-ignore
        setWordleValidationErrors(validationErrors); 

        if (!validationErrors.length) {
            setNextWordle(wordle);
            setIsNextWordleReady(true);
        } else {
            setIsNextWordleReady(false);
        }
    }

    useEffect(() => {
        const reversedBoard = board.slice().reverse();
        const lastFilledRow = reversedBoard.find((row) => {
            return row.every((cell) => cell.status !== 'unguessed');
        });

        if (gameState === state.playing && lastFilledRow && isRowAllGreen(lastFilledRow)) {
            setGameState(state.won)

            var streak = currentStreak + 1
            setCurrentStreak(streak)
            setLongestStreak((prev: number) => (streak > prev ? streak : prev))
        } else if (gameState === state.playing && currentRow === 6) {
            setGameState(state.lost)
            setCurrentStreak(0)
        }
    }, [
        board,
        currentRow,
        gameState,
        setGameState,
        currentStreak,
        setCurrentStreak,
        setLongestStreak,
    ]);

    useEffect(() => {
        console.log({ board });
    }, [board]);

    useEffect(() => {
        // TODO: Clunky way to ensure we see the validatione errors the first time the wordle input renders
        handleValidateWordle();

        (async () => {
            if (user) {
                const matchDocRef = doc(db, 'matches', params.matchId || '');
                const matchDocSnap = await getDoc(matchDocRef);

                /*
                    TODO: There's probably a neater way to handle multiple, sequential,
                    doc retrievals. Something like 'async.parallel', but for awaits
                */
                if (matchDocSnap.exists()) {
                    const matchData: Match = matchDocSnap.data() as Match;

                    const currentTurn = matchData.turns.find((turn: Turn) => turn.currentTurn);

                    if (currentTurn) {
                        // TODO: The capitalization for the wordle needs to be standardized universally, at some point
                        setAnswer(currentTurn.wordle.toUpperCase());

                        const opponentPlayerDocRef = doc(db, 'players', matchData.players.hostId);
                        const opponentPlayerSnap = await getDoc(opponentPlayerDocRef);

                        if (opponentPlayerSnap.exists()) {
                            const opponentPlayerData: Player = opponentPlayerSnap.data() as Player;

                            setOpponentPlayer(opponentPlayerData);

                            if (!Object.keys(currentTurn.guesses).length) {
                                // TODO: Need a loading throbber or something for the landing modal
                                setIsLandingModalOpen(true);
                            }
                        }
                    }
                }
            }
        })();
    }, [user]);

  if (isLoading) {
    return <Loading />
  } else {
    return (
      <div>
        <div className={`flex flex-col justify-between h-fill bg-background`}>
          <header className="flex items-center py-2 px-3 text-primary">
             {/* <button
              type="button"
              onClick={() => setSettingsModalIsOpen(true)}
              className="p-1 rounded-full"
            >
              <Settings />
            </button>  */}
            <button
              type="button"
              onClick={() => navigate("/lobby")}
              className="p-1 rounded-full"
            >
              <Lobby />
            </button> 
            <h1 className="flex-1 text-center text-xl xxs:text-2xl sm:text-4xl tracking-wide font-bold font-righteous">
              War of the Wordles
            </h1>
            {/* <button
              type="button"
              onClick={() => setInfoModalIsOpen(true)}
              className="p-1 rounded-full"
            >
              <Info />
            </button>  */}
          </header>
            <div className="flex items-center flex-col py-3 flex-1 justify-center relative">
                <div className="relative">
                    <div className="grid grid-cols-5 grid-flow-row gap-4">
                        {
                            board.map((row: Cell[], rowNumber: number) => {
                                return row.map((cell: Cell, colNumber: number) => {
                                    return <span
                                        key={colNumber}
                                        className={`${getCellStyles(
                                            rowNumber,
                                            colNumber,
                                            cell.status
                                        )} inline-flex items-center font-medium justify-center text-lg w-[13vw] h-[13vw] xs:w-14 xs:h-14 sm:w-20 sm:h-20`}
                                        >
                                        {cell.letter}
                                    </span>
                                });
                            })
                        }
                    </div>
              <div
                className={`absolute -bottom-24 left-1/2 transform -translate-x-1/2 ${
                  gameState === state.playing ? 'hidden' : ''
                }`}
              >
                <div>
                  <button
                    autoFocus
                    type="button"
                    className="rounded-lg z-10 px-6 py-2 text-lg nm-flat-background dark:nm-flat-background-dark hover:nm-inset-background dark:hover:nm-inset-background-dark text-primary dark:text-primary-dark"
                    onClick={playAgain}
                  >
                    Play Again
                  </button>
                </div>
              </div>
            </div>
          </div>

            <Modal isOpen={isHowToPlayModalOpen} onRequestClose={() => { setIsHowToPlayModalOpen(false) }}>
                <div className="flex flex-col gap-y-3">
                    <h1 className="text-center sm:text-3xl text-2xl">How to Play</h1>

                    <ul className="block sm:text-base text-sm">
                        <li className="mb-2">You have 6 guesses to guess the correct word.</li>

                        <li className="mb-2">You can guess any valid word.</li>

                        <li className="mb-2">
                            After each guess, each letter will turn green, yellow, or gray.
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
                      Alternately, you can just have fun generating 3-word urls and making up stories about them. We definitely spent a late night in development doing that. Highly recommend.
                    </div>

                    {/* TODO: Should be a LoadingButton */}
                    <Button color="green" copy="Let's Play!" onClick={handleAcceptMatch} />
                    <Button color="yellow" copy="Go Back" onClick={handleGoBackFromHowToPlay} />
                </div>
            </Modal>

            <Modal isOpen={isLandingModalOpen} onRequestClose={() => { setIsLandingModalOpen(false) }}>
                {/* TODO: Think about using a random "fighting words" generator here */}
                <h1 className="text-2xl text-center">
                    <span className="text-[#15B097] block">{opponentPlayer.email}</span> is spoiling for a donnybrook!
                </h1>

                <div className="flex flex-col gap-y-3">
                    {/* TODO: Should be a LoadingButton */}
                    <Button onClick={ handleAcceptMatch } copy="Accept" color="green" />
                    <Button onClick={() => { setIsLandingModalOpen(false) }} copy="Rudely Decline" color="gray" />
                    <Button onClick={() => { setIsLandingModalOpen(false) }} copy="Politely Decline" color="yellowHollow" />
                </div>

                <div className="flex flex-row gap-x-1 justify-center">
                    Not sure what this is? <span className="yellow-link" onClick={handleOpenHowToPlay}>Check out how to play.</span>
                </div>
            </Modal>

            <Modal isOpen={isEndTurnModalOpen} onRequestClose={handleCloseEndTurnModal}>
                {/* TODO: Think about using a random "fighting words" generator here */}
                <div className="flex flex-col gap-y-2">
                    <h1 className="text-4xl text-center">
                        Turn 1
                    </h1>

                    <div className="flex flex-row items-center justify-center gap-x-3">
                        <div className="flex flex-col gap-y-2">
                            <FontAwesomeIcon icon={faCircleUser} size='4x' />
                            <span>{opponentPlayer.email}</span>
                        </div>

                        <span>vs</span>

                        <div className="flex flex-col gap-y-2">
                            <FontAwesomeIcon icon={faCircleUser} size='4x' />
                            <span>{user.email}</span>
                        </div>
                    </div>
                </div>

                <span className="yellow-font uppercase text-center text-[24px] md:text-[42px]">You guessed their word!</span>

                <div className="flex flex-row gap-x-2 justify-center">
                    {renderWordleSquares(answer)}
                </div>

                <div className="flex flex-col gap-y-2 text-center mx-auto md:min-w-[250px]">
                    <span className="text-[20px] md:text-[28px] mt-8">Now it's your turn!</span>

                    <span className="text-[12px] md:text-[16px]">Send them a word right back!</span>
                    <WordleInput validationErrors={wordleValidationErrors} handleValidationErrors={(e: React.ChangeEvent<HTMLInputElement>) => { handleValidateWordle(e.target.value) }} />
                </div>

                {/* TODO: Hook up isLoading and onClick props */}
                <LoadingButton copy={'Send Word'} isLoadingCopy={'Sending Word...'} color='green' isLoading={false} disabled={!!wordleValidationErrors.length} onClick={() => console.log('submit wordle')} />

                <div className="flex flex-row gap-x-1 justify-center items-center">
                    <span className="basis-full">Tired of this chicanery? </span>
                    
                    <Button copy="Forfeit Game" color="gray" onClick={() => { console.log('forfeit game')}} />
                </div>
            </Modal>

            <div className={`h-auto relative ${gameState === state.playing ? '' : 'invisible'}`}>
                <Keyboard
                    letterStatuses={letterStatuses}
                    addLetter={addLetter}
                    onEnterPress={onEnterPress}
                    onDeletePress={onDeletePress}
                    gameDisabled={gameState !== state.playing || isLandingModalOpen || isHowToPlayModalOpen}
                />
            </div>
        </div>
    </div>
    ) 
  }
}

export default MatchView;
