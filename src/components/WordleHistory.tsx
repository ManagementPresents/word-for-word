import { FC, useState, } from 'react';

import {  
    renderWordleSquaresComplete,
} from "../utils/wordUtils";
import Turn from '../interfaces/Turn';
import Cell from '../interfaces/match/Cell';
import Player from '../interfaces/Player';

interface Props {
    guesses: Cell[][];
    turn: Turn;
    matchOpponent: Player;
}

const WordleHistory: FC<Props> = ({ guesses, turn, matchOpponent, }: Props) => {
    const [isExpanded, setIsExpanded] = useState(false);

    console.log({ guesses });
    let guessesAllButLast: Cell[][] = guesses.slice(0, -1) as Cell[][];
    let lastGuess: Cell[] = guesses.slice(-1)[0] as Cell[];

    if (!lastGuess ) lastGuess = Array(5).fill({ letter: '?', status: 'unguessed' }) as Cell[];
    if (!guessesAllButLast) guessesAllButLast = [Array(5).fill({ letter: '?', status: 'unguessed' }) as Cell[]];
    
    return turn?.activePlayer === matchOpponent?.id ?
        <div className="flex flex-col">
            {
                isExpanded && <div className="flex flex-col gap-y-2 mx-auto">
                    {guessesAllButLast.map((guess: Cell[]) => {
                        return (
                            <div className="flex flex-row gap-x-2"> 
                                {renderWordleSquaresComplete(guess)}
                            </div>
                        );
                    })}
                </div>
            }

            <div className="flex flex-row max-h-[30px] sm:max-h-[40px]">
                <div className="flex bg-[#775568] text-[12px] p-2.5 items-center justify-center w-[76px] sm:w-[86px]">
                    <span>Your Word</span>
                </div>

                <div className="flex flex-row gap-x-2" onClick={ () => setIsExpanded(!isExpanded) }>
                    {renderWordleSquaresComplete(lastGuess)}
                </div>

                <div className="flex bg-[#775568] text-[12px] p-2.5 items-center justify-center w-[76px] sm:w-[86px]">
                    {guesses.length ? `Score: ${guesses.length}` : '?'}/6
                </div>
            </div>
        </div> : 
        <div className="flex flex-col">
            {
                isExpanded && <div className="flex flex-col gap-y-2 mx-auto">
                    {guessesAllButLast.map((guess: Cell[]) => {
                        return (
                            <div className="flex flex-row gap-x-2"> 
                                {renderWordleSquaresComplete(guess)}
                            </div>
                        );
                    })}
                </div>
            }

            <div className="flex flex-row max-h-[30px] sm:max-h-[40px]">
                <div className="flex bg-[#775568] text-[12px] p-2.5 items-center justify-center w-[76px] sm:w-[86px]">
                    {guesses.length ? `Score: ${guesses.length}` : '?'}/6
                </div>

                <div className="flex flex-row gap-x-2" onClick={ () => setIsExpanded(!isExpanded) }>
                    {renderWordleSquaresComplete(lastGuess)}
                </div>

                <div className="flex bg-[#775568] text-[12px] p-2.5 items-center justify-center w-[76px] sm:w-[86px]">
                    <span>Your Word</span>
                </div>
            </div>
        </div>
}

export default WordleHistory;