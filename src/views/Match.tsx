//Adding Firebase imports
import { collection, doc, setDoc, getDoc } from "firebase/firestore"; 

import { letters, status } from '../constants'
import { useEffect, useState } from 'react'
import { useNavigate, useParams } from "react-router-dom";

import { EndGameModal } from '../components/EndGameModal'
import { Keyboard } from '../components/Keyboard'
import { SettingsModal } from '../components/SettingsModal'
import Modal from '../components/Modal';
import Loading from '../components/Loading';
import Button from '../components/buttons/Button';

import { useLocalStorage } from '../hooks/useLocalStorage'
import { ReactComponent as Info } from '../data/Info.svg'
import { ReactComponent as Settings } from '../data/Settings.svg'
import useStore from '../utils/store';
import { ReactComponent as Lobby } from '../data/Lobby.svg'
import Turn from "../types/Turn";

/* --- */
import Match from '../types/Match';
import Player from '../types/Player';

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

// const getRandomAnswer = () => {
//   const randomIndex = Math.floor(Math.random() * answers.length)
//   return answers[randomIndex].toUpperCase()
// }

type State = {
  answer: '',
  gameState: string
  board: string[][]
  cellStatuses: string[][]
  currentRow: number
  currentCol: number
  letterStatuses: () => { [key: string]: string }
  submittedInvalidWord: boolean
}

function Game() {
  const initialStates: State = {
    answer: '',
    gameState: state.playing,
    board: [
      ['', '', '', '', ''],
      ['', '', '', '', ''],
      ['', '', '', '', ''],
      ['', '', '', '', ''],
      ['', '', '', '', ''],
      ['', '', '', '', ''],
    ],
    cellStatuses: Array(6).fill(Array(5).fill(status.unguessed)),
    currentRow: 0,
    currentCol: 0,
    letterStatuses: () => {
      const letterStatuses: { [key: string]: string } = {}
      letters.forEach((letter) => {
        letterStatuses[letter] = status.unguessed
      })
      return letterStatuses
    },
    submittedInvalidWord: false,
  }

  // const [gameState, setGameState] = useLocalStorage('stateGameState', initialStates.gameState)
  const [gameState, setGameState] = useState('playing');
  //TO-DO: replace Local Storage with the string that exists in Firebase
//   const [board, setBoard] = useLocalStorage('stateBoard', initialStates.board)
//   const [cellStatuses, setCellStatuses] = useLocalStorage(
//     'stateCellStatuses',
//     initialStates.cellStatuses
//   )
const [cellStatuses, setCellStatuses] = useState(initialStates.cellStatuses);

  //TO-DO: Replace Local Storage
  const [currentRow, setCurrentRow] = useLocalStorage('stateCurrentRow', initialStates.currentRow)
  const [currentCol, setCurrentCol] = useLocalStorage('stateCurrentCol', initialStates.currentCol)
  const [letterStatuses, setLetterStatuses] = useLocalStorage(
    'stateLetterStatuses',
    initialStates.letterStatuses()
  )
  const [submittedInvalidWord, setSubmittedInvalidWord] = useLocalStorage(
    'stateSubmittedInvalidWord',
    initialStates.submittedInvalidWord
  )
//To-Do: Remove Streaks
  const [currentStreak, setCurrentStreak] = useLocalStorage('current-streak', 0)
  const [longestStreak, setLongestStreak] = useLocalStorage('longest-streak', 0)
  const [modalIsOpen, setIsOpen] = useState(false)
  //To-Do: Change Local Storage to Firebase Storage for "first time" guest identification purposes
  const [firstTime, setFirstTime] = useLocalStorage('first-time', true)
  //To-Do: Kill streaks
  const [guessesInStreak, setGuessesInStreak] = useLocalStorage(
    'guesses-in-streak',
    firstTime ? 0 : -1
  )
//   const [infoModalIsOpen, setInfoModalIsOpen] = useState(firstTime)
  const [inputModalIsOpen, setInputModalIsOpen] = useState(true);
  const [settingsModalIsOpen, setSettingsModalIsOpen] = useState(false)
  //To-Do: Remove "Difficulty"
  const [difficultyLevel, setDifficultyLevel] = useLocalStorage('difficulty', difficulty.normal)
  const getDifficultyLevelInstructions = () => {
    if (difficultyLevel === difficulty.easy) {
      return 'Guess any 5 letters'
    } else if (difficultyLevel === difficulty.hard) {
      return "Guess any valid word using all the hints you've been given"
    } else {
      return 'Guess any valid word'
    }
  }
  const eg: { [key: number]: string } = {}
  //To-Do: Remove Localstorage
  const [exactGuesses, setExactGuesses] = useLocalStorage('exact-guesses', eg)
  const openModal = () => setIsOpen(true)
  const closeModal = () => setIsOpen(false)

  const navigate = useNavigate();

  const isLoading = useStore((state) => state.isLoading);
  //To-Do: Probably code we should repurpose for userID
  const { setIsLoading } = useStore();
  const { user } = useStore();

  //To-Do: Strip out Dark Mode
  const [darkMode, setDarkMode] = useLocalStorage('dark-mode', false)
  const toggleDarkMode = () => setDarkMode((prev: boolean) => !prev)

  useEffect(
    () => document.documentElement.classList[darkMode ? 'add' : 'remove']('dark'),
    [darkMode]
  )

//To-Do: Check this later if it pops up whatever modal, if that's a problem for our changes
  useEffect(() => {
    if (gameState !== state.playing) {
      setTimeout(() => {
        openModal()
      }, 500)
    }
  }, [gameState])

  const getCellStyles = (rowNumber: number, colNumber: number, letter: string) => {
    if (rowNumber === currentRow) {
      if (letter) {
        return `guesses-style-default border ${
          submittedInvalidWord ? 'border guesses-border-wrong' : ''
        }`
      }
      return 'guesses-style-default border'
    }

    switch (cellStatuses[rowNumber][colNumber]) {
      case status.green:
        return 'green-style'
      case status.yellow:
        return 'yellow-style'
      case status.gray:
        return 'grey-style'
      default:
        return 'border guesses-style-default'
    }
  }

  const addLetter = (letter: string) => {
    setSubmittedInvalidWord(false)
    setBoard((prev: string[][]) => {
      if (currentCol > 4) {
        return prev
      }
      const newBoard = [...prev]
      newBoard[currentRow][currentCol] = letter
      return newBoard
    })
    if (currentCol < 5) {
      setCurrentCol((prev: number) => prev + 1)
    }
  }

  // returns an array with a boolean of if the word is valid and an error message if it is not
  const isValidWord = (word: string): [boolean] | [boolean, string] => {
    if (word.length < 5) return [false, `please enter a 5 letter word`]
    if (difficultyLevel === difficulty.easy) return [true]
    if (!words[word.toLowerCase()]) return [false, `${word} is not a valid word. Please try again.`]
    if (difficultyLevel === difficulty.normal) return [true]
    const guessedLetters = Object.entries(letterStatuses).filter(([letter, letterStatus]) =>
      [status.yellow, status.green].includes(letterStatus)
    )
    const yellowsUsed = guessedLetters.every(([letter, _]) => word.includes(letter))
    const greensUsed = Object.entries(exactGuesses).every(
      ([position, letter]) => word[parseInt(position)] === letter
    )
    if (!yellowsUsed || !greensUsed)
      return [false, `In hard mode, you must use all the hints you've been given.`]
    return [true]
  }

  const onEnterPress = () => {
    const word = board[currentRow].join('')
    const [valid, _err] = isValidWord(word)
    if (!valid) {
      console.log({ valid, _err })
      setSubmittedInvalidWord(true)
      // alert(_err)
      return
    }

    if (currentRow === 6) return

    updateCellStatuses(word, currentRow)
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

  const updateCellStatuses = (word: string, rowNumber: number) => {
      // TODO: Kludge, need to ensure capitalization (or lack thereof) for answers and guesses is standardized
      word = word.toLowerCase();

      console.log({ word, answer});

    const fixedLetters: { [key: number]: string } = {}
    setCellStatuses((prev: any) => {
      const newCellStatuses = [...prev]
      newCellStatuses[rowNumber] = [...prev[rowNumber]]
      const wordLength = word.length
      const answerLetters: string[] = answer.split('')

      // set all to gray
      for (let i = 0; i < wordLength; i++) {
        newCellStatuses[rowNumber][i] = status.gray
      }

      // check greens
      for (let i = wordLength - 1; i >= 0; i--) {
        if (word[i] === answer[i]) {
          newCellStatuses[rowNumber][i] = status.green
          answerLetters.splice(i, 1)
          fixedLetters[i] = answer[i]
        }
      }

      // check yellows
      for (let i = 0; i < wordLength; i++) {
        if (answerLetters.includes(word[i]) && newCellStatuses[rowNumber][i] !== status.green) {
          newCellStatuses[rowNumber][i] = status.yellow
          answerLetters.splice(answerLetters.indexOf(word[i]), 1)
        }
      }

      return newCellStatuses
    })
    setExactGuesses((prev: { [key: number]: string }) => ({ ...prev, ...fixedLetters }))
  }

  const isRowAllGreen = (row: string[]) => {
    return row.every((cell: string) => cell === status.green)
  }

  //To-do: remove streaks
  const avgGuessesPerGame = (): number => {
    if (currentStreak > 0) {
      return guessesInStreak / currentStreak
    } else {
      return 0
    }
  }

  // every time cellStatuses updates, check if the game is won or lost
  useEffect(() => {
    const cellStatusesCopy = [...cellStatuses]
    const reversedStatuses = cellStatusesCopy.reverse()
    const lastFilledRow = reversedStatuses.find((r) => {
      return r[0] !== status.unguessed
    })

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
    cellStatuses,
    currentRow,
    gameState,
    setGameState,
    currentStreak,
    setCurrentStreak,
    setLongestStreak,
  ])

  const updateLetterStatuses = (word: string) => {
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

    closeModal()
  }

  const modalStyles = {
    overlay: {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: '#24191f',
      zIndex: 99,
    },
    content: {
      top: '50%',
      left: '50%',
      right: 'auto',
      bottom: 'auto',
      transform: 'translate(-50%, -50%)',
      height: 'calc(100% - 2rem)',
      width: 'calc(100% - 2rem)',
      backgroundColor: '#3c2a34',
      boxShadow: `${
        darkMode
          ? '0.2em 0.2em calc(0.2em * 2) #3c2a34, calc(0.2em * -1) calc(0.2em * -1) calc(0.2em * 2) #3c2a34'
          : '0.2em 0.2em calc(0.2em * 2) #3c2a34, calc(0.2em * -1) calc(0.2em * -1) calc(0.2em * 2) #3c2a34'
      }`,
      border: 'none',
      borderRadius: '1rem',
      maxWidth: '475px',
      maxHeight: '650px',
      position: 'relative',
    },
  }

    /* --- */
    const params = useParams();

    const { db, setOpponentPlayer, opponentPlayer } = useStore();

    const [isLandingModalOpen, setIsLandingModalOpen] = useState(true);
    const [isHowToPlayModalOpen, setIsHowToPlayModalOpen] = useState(false);
    const [answer, setAnswer] = useState('');
    const [board, setBoard] = useState(initialStates.board);

    useEffect(() => {
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
                        setAnswer(currentTurn.wordle);
                    }

                    const opponentPlayerDocRef = doc(db, 'players', matchData.players.hostId);
                    const opponentPlayerSnap = await getDoc(opponentPlayerDocRef);

                    if (opponentPlayerSnap.exists()) {
                        const opponentPlayerData: Player = opponentPlayerSnap.data() as Player;

                        setOpponentPlayer(opponentPlayerData);
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
              Wordles with Friendles
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
                {board.map((row: string[], rowNumber: number) =>
                  row.map((letter: string, colNumber: number) => (
                    <span
                      key={colNumber}
                      className={`${getCellStyles(
                        rowNumber,
                        colNumber,
                        letter
                      )} inline-flex items-center font-medium justify-center text-lg w-[13vw] h-[13vw] xs:w-14 xs:h-14 sm:w-20 sm:h-20`}
                    >
                      {letter}
                    </span>
                  ))
                )}
              </div>
              <div
                className={`absolute -bottom-24 left-1/2 transform -translate-x-1/2 ${
                  gameState === state.playing ? 'hidden' : ''
                }`}
              >
                <div className={darkMode ? 'dark' : ''}>
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

                    <ul className="list-disc pl-5 block sm:text-base text-sm">
                        <li className="mt-6 mb-2">You have 6 guesses to guess the correct word.</li>
                        <li className="mb-2">You can guess any valid word.</li>
                        <li className="mb-2">Alternately, you can just have fun generating 3-word urls and making up stories about them. We definitely spent a late night in development doing that. Highly reccomend.</li>
                        <li className="mb-2">
                        After each guess, each letter will turn green, yellow, or gray.
                        </li>
                    </ul>

                    <div className="mb-3 mt-5 flex items-center">
                        <span className="nm-inset-n-green text-gray-50 inline-flex items-center justify-center text-3x w-10 h-10 rounded-full">
                        W
                        </span>

                        <span className="mx-2">=</span>
                        <span>Correct letter, correct spot</span>
                    </div>

                    <div className="mb-3">
                        <span className="nm-inset-yellow-500 text-gray-50 inline-flex items-center justify-center text-3x w-10 h-10 rounded-full">
                        W
                        </span>
                        
                        <span className="mx-2">=</span>
                        <span>Correct letter, wrong spot</span>
                    </div>

                    <div className="mb-3">
                        <span className="nm-inset-n-gray text-gray-50 inline-flex items-center justify-center text-3x w-10 h-10 rounded-full">
                            W
                        </span>

                        <span className="mx-2">=</span>
                        <span>Wrong letter</span>
                    </div>

                    <button className="green-style hover:green-hover font-bold py-2 px-4 rounded w-full" onClick={() => setIsLandingModalOpen(false)}>Got It!</button>
                </div>
            </Modal>

            <Modal isOpen={isLandingModalOpen} onRequestClose={() => { setIsLandingModalOpen(false) }}>
                {/* TODO: Think about using a random "fighting words" generator here */}
                <h1 className="text-2xl text-center">
                    <span className="text-[#15B097] block">{opponentPlayer.email}</span> is spoiling for a donnybrook!
                </h1>

                <div className="flex flex-col gap-y-3">
                    <Button onClick={() => { setIsLandingModalOpen(false) }} copy="Accept" color="green" />
                    <Button onClick={() => { setIsLandingModalOpen(false) }} copy="Rudely Decline" color="gray" />
                    <Button onClick={() => { setIsLandingModalOpen(false) }} copy="Politely Decline" color="yellowHollow" />
                </div>

                <div className="flex flex-row gap-x-1 justify-center">
                    Not sure what this is? <span className="yellow-link">Check out how to play.</span>
                </div>
            </Modal>

          <EndGameModal
            isOpen={modalIsOpen}
            handleClose={closeModal}
            styles={modalStyles}
            darkMode={darkMode}
            gameState={gameState}
            state={state}
            currentStreak={currentStreak}
            longestStreak={longestStreak}
            answer={answer}
            playAgain={playAgain}
            avgGuessesPerGame={avgGuessesPerGame()}
          />
          <SettingsModal
            isOpen={settingsModalIsOpen}
            handleClose={() => setSettingsModalIsOpen(false)}
            styles={modalStyles}
            darkMode={darkMode}
            toggleDarkMode={toggleDarkMode}
            difficultyLevel={difficultyLevel}
            setDifficultyLevel={setDifficultyLevel}
            levelInstructions={getDifficultyLevelInstructions()}
          />
          <div className={`h-auto relative ${gameState === state.playing ? '' : 'invisible'}`}>
            <Keyboard
              letterStatuses={letterStatuses}
              addLetter={addLetter}
              onEnterPress={onEnterPress}
              onDeletePress={onDeletePress}
              gameDisabled={gameState !== state.playing || isLandingModalOpen}
            />
          </div>
        </div>
      </div>
    ) 
  }
}

export default Game;
