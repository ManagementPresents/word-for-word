import { FC, useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { doc, setDoc } from 'firebase/firestore';
import { faCircleUser } from '@fortawesome/free-solid-svg-icons';
import { faUserClock } from '@fortawesome/free-solid-svg-icons';

import Button from './buttons/Button';

import Match from '../interfaces/Match';
import { renderWordleSquares } from '../utils/wordUtils';
import {
	getMatchOpponentId,
	isPlayerCurrentTurn,
	getLastPlayedWordByPlayerId,
	hasPlayerWonCurrentTurn,
	getCurrentTurn,
	hasUserWonMatch,
} from '../utils/misc';
import useStore from '../utils/store';
import Turn from '../interfaces/Turn';
import MatchOutcome from '../enums/MatchOutcome';

interface Props {
	match: Match;
	isLobbyMatchModalOpen: boolean;
	setIsLobbyMatchModalOpen: any;
	setIsEndTurnModalOpen?: any;
}

const MatchCard: FC<Props> = ({ 
	match, 
	setIsLobbyMatchModalOpen,
	setIsEndTurnModalOpen, 
}: Props) => {
	const { 
		setCurrentMatch, 
		user, 
		matchOpponents,
		db,
	} = useStore();

	const [isUserTurn, setIsUserTurn] = useState(false);
	const [matchOpponent] = useState(matchOpponents[getMatchOpponentId(user, match)]);
	const [isArchived, setIsArchived] = useState(false);
	const [isPending, setIsPending] = useState(false);
	// TODO: This name feels unclear
	const [isWaiting, setIsWaiting] = useState(false);

	// TODO: I'm sure there's room for even more abstraction for the repetition across these functions

	// Hello gabriel. As you'll see way after this, I sweatily cobbled together something that piggybacks off the other good stuff you did and kinda extends the yellow match functionality and all that. Hope that's cool. Like you. A cool guy. Cool guys love to sing about poop and pee. They must. Otherwise, what am I....?

	const renderCardDetails = () => {
		const { players } = match;
		let cardDetailsColor = '';

		if (isArchived) {
			cardDetailsColor = 'grey';
		} else if (isPending) {
			cardDetailsColor = 'yellow';
		} else if (isWaiting) {
			cardDetailsColor = 'green';
		} 
		
		if (!players.guestId) {
			return (
				<div className="green-match-opponent">
					<span className="green-match-title">Awaiting a Challenger</span>
					<FontAwesomeIcon icon={faUserClock} size="4x" className="green-match-avatar" />
					<span className="green-match-user">Who will it be?</span>
				</div>
			);
		}

		return (
			<div className={`${cardDetailsColor}-match-opponent`}>
				<span className={`${cardDetailsColor}-match-title`}>Match With</span>
				<FontAwesomeIcon icon={faCircleUser} size="4x" className={`${cardDetailsColor}-match-avatar`} />
				<span className={`${cardDetailsColor}-match-user`}>{matchOpponent?.email}</span>
			</div>
		);
	};

	const renderMatchButton = () => {
		const { players } = match;
		const currentTurn: Turn = getCurrentTurn(match.turns) as Turn;

		// TODO: These states can probably be simplified
		if (isArchived) {
			return <Button copy="See Results" customStyle="grey-match-button" />;
		}

		if (match.outcome) {
			if (!match.isWinnerNotified) {
				return <Button copy="The results are in ..." customStyle="yellow-match-button" />;
			}
		}
		
		if (isUserTurn) {
			if (hasPlayerWonCurrentTurn(match, user.uid)) {
				return <Button copy="Send Back a Wordle!" customStyle="yellow-match-button" />;
			}	

			if (!currentTurn?.hasActivePlayerStartedTurn) {
				return <Button copy="The results are in ..." customStyle="yellow-match-button" />
			}

			return <Button copy="It's your turn!" customStyle="yellow-match-button" />;
		}
		

		if (!isUserTurn && players.guestId) {
			return <Button copy="Opponent is taking their turn" customStyle="green-match-button" />;
		}

		if (!players.guestId) {
			return <Button copy="Waiting for an Opponent" customStyle="green-match-button" />;
		}
	};

	const handleCardClick = async () => {
		setCurrentMatch(match);

		// if (hasPlayerWonCurrentTurn(match, user.uid)) {
		// 	setIsEndTurnModalOpen(true);
		// } else {
		// 	if (match.outcome) {
		// 		console.log('uh', hasUserWonMatch(match, user.uid))
		// 		if (hasUserWonMatch(match, user.uid) && !match.isWinnerNotified) {
		// 			// TODO: Some kind of throbber will be necessary here
		// 			const currentMatchRef = doc(db, 'matches', match.id);

		// 			console.log('not right!')
		// 			// await setDoc(
		// 			// 	currentMatchRef,
		// 			// 	{
		// 			// 		isWinnerNotified: true,
		// 			// 	},
		// 			// 	{ merge: true },
		// 			// );
		// 		}
		// 	}

		// 	setIsLobbyMatchModalOpen(true);
		// }
		if (match.outcome) {
			if (hasUserWonMatch(match, user.uid) && !match.isWinnerNotified) {
				// TODO: Some kind of throbber will be necessary here
				const currentMatchRef = doc(db, 'matches', match.id);

				await setDoc(
					currentMatchRef,
					{
						isWinnerNotified: true,
					},
					{ merge: true },
				);
			}

			setIsLobbyMatchModalOpen(true);
		} else if (hasPlayerWonCurrentTurn(match, user.uid)) {
			setIsEndTurnModalOpen(true);
		} else {
			setIsLobbyMatchModalOpen(true);
		}
	};

	/* Hello Gabriel. It's me again. The sleepy dipshit. I changed stuff below here to return just the color instead of the full "[color]-match-style" it was before, and in the section after that, I copied over the handleCardColor use I saw in the next class name, but for all the other now super modular class names in lieu of bugging you to write a whole thing about it. I think this works for now, but I am a sleepy sweaty dumb dumb who lost the ability to read when I gained massive boobies. So. Yknow. Grain of salt.*/

	const handleCardColor = () => {
		if (isArchived) return 'grey';
		if (isPending) return 'yellow';
		if (isWaiting) return 'green';
	};

	const handleWordleSquareRender = () => {
		if (match.outcome) {
			const currentTurn = getCurrentTurn(match.turns);

			return renderWordleSquares(currentTurn.wordle);
		} else {
			return renderWordleSquares(getLastPlayedWordByPlayerId(user.uid, match.turns));
		}
	}

	useEffect(() => {
		console.log({ match })
		setIsUserTurn(isPlayerCurrentTurn(match, user.uid));
	}, [match, user.uid]);

	useEffect(() => {
		if (hasUserWonMatch(match, user.uid) && match.isWinnerNotified) {
			setIsArchived(true);
		} else if (!hasUserWonMatch(match, user.uid) && match.outcome) {
			setIsArchived(true);
		} else if (match.outcome) {
			const userIsHost = user.uid === match.players.hostId;

			if (userIsHost && match.outcome === MatchOutcome.HOST_FORFEIT) {
				setIsArchived(true);
			} else if (!userIsHost && match.outcome === MatchOutcome.GUEST_FORFEIT) {
				setIsArchived(true);
			}
		}
	}, [match, user.uid]);

	useEffect(() => {
		setIsPending(isUserTurn || (!!match.outcome && !match.isWinnerNotified));
	}, [isUserTurn, match.outcome, match.isWinnerNotified]);

	useEffect(() => {
		setIsWaiting(!matchOpponent || (matchOpponent && !isUserTurn));
	}, [matchOpponent, isUserTurn]);

	return (
		<div
			onClick={handleCardClick}
			className={`${handleCardColor()}-match-card ${handleCardColor()}-match-lastplay`}
		>
			<div className="card-label">
				{renderCardDetails()}
				<span className={`${handleCardColor()}-match-text`}>{match.outcome ? 'Final Word' : 'You last played'}</span>
			</div>

			{/* TODO: investigate repsonsiveness at REALLY small screen sizes ( < 360px) */}
			<div className={`${handleCardColor()}-match-playbox`}>
				{handleWordleSquareRender()}
			</div>

			{/* 
                TODO: Consider making it so that when a host clicks on a match card for a match that hasn't been accepted yet, it shows the match's shareable url 
            */}
			{renderMatchButton()}
		</div>
	);
};

export default MatchCard;
