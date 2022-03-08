import { ReactComponent as Close } from '../data/Close.svg'
import Modal from 'react-modal'
import Fail from '../data/Cross.png'

//adding Firebase imports
import { collection, doc, setDoc, getDoc } from "firebase/firestore"; 

if (process.env.NODE_ENV !== 'test') Modal.setAppElement('#root')

interface Props {
  isOpen: boolean
  handleClose: () => void
  styles: any
  darkMode?: boolean
  gameState: string
  state: any
  currentStreak: number
  longestStreak: number
  answer: string
  playAgain: () => void
  avgGuessesPerGame: number
}

const avgGuessesPerGameGreatThreshold = 2.8
const avgGuessesPerGameGoodThreshold = 3.0
const avgGuessesPerGameOkayThreshold = 3.2

const streakOkayThreshold = 5
const streakGoodThreshold = 20
const streakGreatThreshold = 50

function avgGuessesClass(avgGuessesPerGame: number): string {
  if (avgGuessesPerGame <= avgGuessesPerGameGreatThreshold) {
    return 'text-red-600'
  } else if (avgGuessesPerGame <= avgGuessesPerGameGoodThreshold) {
    return 'text-orange-500'
  } else if (avgGuessesPerGame <= avgGuessesPerGameOkayThreshold) {
    return 'text-yellow-500'
  } else {
    return ''
  }
}

function currentStreakClass(currentStreak: number): string {
  if (currentStreak >= streakGreatThreshold) {
    return 'text-red-600'
  } else if (currentStreak >= streakGoodThreshold) {
    return 'text-orange-500'
  } else if (currentStreak >= streakOkayThreshold) {
    return 'text-yellow-500'
  } else {
    return ''
  }
}

export const EndGameModal = ({
  isOpen,
  handleClose,
  styles,
  darkMode,
  gameState,
  state,
  currentStreak,
  longestStreak,
  answer,
  playAgain,
  avgGuessesPerGame,
}: Props) => {
  const PlayAgainButton = () => {
    return (
      <div className={darkMode ? 'dark' : ''}>
        <button
          autoFocus
          type="button"
          className="gray-button"
          onClick={playAgain}
        >
          Play Again
        </button>
      </div>
    )
  }
  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={handleClose}
      style={styles}
      contentLabel="Game End Modal"
    >
      <div className={darkMode ? 'dark' : ''}>
        <div className="big-modal-style">
          <button
            className="close-button"
            onClick={handleClose}
          >
            <Close />
          </button>
          {gameState === state.won && (
            <>
              <h1 className="modal-header">Congrats! 🎉</h1>
              <dl className="mt-5 grid grid-cols-1 gap-5">
               
              </dl>
            </>
          )}
          {gameState === state.lost && (
            <>
              <img src={Fail} alt="success" height="auto" width="80%" />
              <div className="text-primary text-4xl text-center">
                <p>Oops!</p>
                <p className="mt-3 text-2xl">
                  The word was <strong>{answer}</strong>
                </p>
              </div>
            </>
          )}
          <PlayAgainButton />
        </div>
      </div>
    </Modal>
  )
}
