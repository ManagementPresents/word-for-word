
import { FC, useState, } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCircleUser } from "@fortawesome/free-solid-svg-icons";
import { faUserClock } from "@fortawesome/free-solid-svg-icons";

import Match from '../interfaces/Match';
import { renderWordleSquares } from '../utils/wordUtils';
import { 
    getMatchOpponentId,
    isPlayerCurrentTurn,
    getLastPlayedWordByPlayerId
} from '../utils/misc';
import useStore from '../utils/store';


interface Props {
    match: Match,
    isLobbyMatchModalOpen: boolean,
    setIsLobbyMatchModalOpen: any,
}

const MatchCard: FC<Props> = ({ match, setIsLobbyMatchModalOpen }: Props) => {
    const { 
        setSelectedMatch, 
        user, 
        matchOpponents,
    } = useStore();

    const [isUserTurn] = useState(isPlayerCurrentTurn(match, user.uid));
    const [matchOpponent] = useState(matchOpponents[getMatchOpponentId(user, match)]);
 
    // TODO: I'm sure there's room for even more abstraction for the repetition across these functions

    // Hello gabriel. As you'll see way after this, I sweatily cobbled together something that piggybacks off the other good stuff you did and kinda extends the yellow match functionality and all that. Hope that's cool. Like you. A cool guy. Cool guys love to sing about poop and pee. They must. Otherwise, what am I....? 

    const renderCardDetails = () => {
        const { players } = match;

        if (!players.guestId) {
            return ( 
                <div className="yellow-match-opponent">
                    <span className="yellow-match-title">Awaiting a Challenger</span>
                    <FontAwesomeIcon icon={faUserClock} size='4x' className="yellow-match-avatar" />
                    <span className="yellow-match-user">Who will it be?</span>
                </div>
            );
        }

        if (isUserTurn) {
            return (
                <div className="green-match-opponent">
                    <span className="green-match-title">Match With</span>
                    <FontAwesomeIcon icon={faCircleUser} size='4x' className="green-match-avatar" />
                    <span className="green-match-user">{matchOpponent?.email}</span>
                </div>
            );
        }

        if (matchOpponent) {
            return (
                <div className="yellow-match-opponent">
                    <span className="yellow-match-title">Match With</span>
                    <FontAwesomeIcon icon={faCircleUser} size='4x' className="yellow-match-avatar" />
                    <span className="yellow-match-user">{matchOpponent?.email}</span>
                </div>
            );
        }
    };

    const renderMatchButton = () => {
        const { players } = match;

        if (isUserTurn) {
            return <button className="green-match-button">The results are in...</button>;
        }

        if (!players.guestId) {
            // TODO: is this language "fun" enough to justify being both twee and potentially a touch unclear?
            // took another pass at it
            return <button className="yellow-match-button">{`Waiting for an Opponent to Accept`}</button>;
        }

        if (matchOpponent) {
            // TODO: Copy?
            // hey, here's another bad version of it!
            return <button className="yellow-match-button-hollow">Your opponent is taking their turn.</button>
        }
    }

    const handleCardClick = () => {
        setSelectedMatch(match);
        setIsLobbyMatchModalOpen(true);
    }

    /* Hello Gabriel. It's me again. The sleepy dipshit. I changed stuff below here to return just the color instead of the full "[color]-match-style" it was before, and in the section after that, I copied over the handleCardColor use I saw in the next class name, but for all the other now super modular class names in lieu of bugging you to write a whole thing about it. I think this works for now, but I am a sleepy sweaty dumb dumb who lost the ability to read when I gained massive boobies. So. Yknow. Grain of salt.*/

    const handleCardColor = () => {
        if (isUserTurn) return 'green';
        if (!matchOpponent || (matchOpponent && !isUserTurn)) return 'yellow';
    }

    return (
        <div onClick={handleCardClick} className={`${handleCardColor()}-match-card ${handleCardColor()}-match-lastplay`}>
            <div className="card-label">
                { renderCardDetails() }
                <span className={`${handleCardColor()}-match-text`}>You entered the word:</span>
            </div>

            {/* TODO: investigate repsonsiveness at REALLY small screen sizes ( < 360px) */}
            <div className={`${handleCardColor()}-match-playbox`}>
                {renderWordleSquares(getLastPlayedWordByPlayerId(user.uid, match.turns))}
            </div>

            {/* 
                TODO: Consider making it so that when a host clicks on a match card for a match that hasn't been accepted yet, it shows the match's shareable url 
            */}
            {renderMatchButton()}
        </div>
    );
};

export default MatchCard;
