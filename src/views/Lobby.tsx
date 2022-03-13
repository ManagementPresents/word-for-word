import { useState, useEffect, Fragment } from 'react';
import { doc, getDoc } from 'firebase/firestore';

import MatchCard from '../components/MatchCard';
import Loading from '../components/Loading';
import Button from '../components/buttons/Button';
import LobbyMatchModal from '../components/modals/LobbyMatchModal';
import NewMatchModal from '../components/modals/NewMatchModal';
import EndTurnModal from '../components/modals/EndTurnModal';

import { 
	getMatchOpponentId, 
	hasPlayerWonCurrentTurn,
} from '../utils/misc';
import useStore from '../utils/store';
import { TIMEOUT_DURATION } from '../utils/constants';
import Match from '../interfaces/Match';
import Player from '../interfaces/Player';
import Players from '../interfaces/Players';
import GameState from '../interfaces/GameState';

const Lobby = () => {
	const { 
		user, 
		db, 
		matches, 
		setMatches, 
		setMatchOpponents, 
		selectedMatch 
	} = useStore();

	const [isNewMatchModalOpen, setIsNewMatchModalOpen] = useState(false);
	const [isLoadingMatches, setIsLoadingMatches] = useState(true);
	const [isLobbyMatchModalOpen, setIsLobbyMatchModalOpen] = useState(false);
	const [isEndTurnModalOpen, setIsEndTurnModalOpen] = useState(false);
	const [nextWordle, setNextWordle] = useState('');

	const determineGameState = () => {
		console.log({ selectedMatch}, 'fuck', user.uid)
		return hasPlayerWonCurrentTurn(selectedMatch, user.uid) ? GameState.WON : '';
	};

	useEffect(() => {
		if (user) {
			setIsLoadingMatches(true);

			const loadingMatchesTimeout = setTimeout(() => {
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
					const playerMatches: Match[] = await Promise.all(
						matchIds?.map(async (matchId: string): Promise<Match> => {
							const matchRef = doc(db, 'matches', matchId);
							const matchSnap = await getDoc(matchRef);

							return matchSnap.data() as Match;
						}),
					);

					const opponentPlayersArray: Player[] = await Promise.all(
						playerMatches.map(async (match: Match): Promise<Player> => {
							const matchOpponentId = getMatchOpponentId(user, match);

							if (matchOpponentId) {
								const playerRef = doc(db, 'players', matchOpponentId);
								const playerSnap = await getDoc(playerRef);

								return {
									id: matchOpponentId,
									...playerSnap.data(),
								} as Player;
							}

							return {} as Player;
						}),
					);

					// Transform (or, i guess, reduce) the opponentPlayersArray into an object, for easier data access
					const opponentPlayers: Players = opponentPlayersArray.reduce(
						(accum: Players, player: Player): Players => {
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
								};
							}

							return accum;
						},
						{} as Players,
					);

					setMatchOpponents(opponentPlayers);
					setMatches(playerMatches);
					setIsLoadingMatches(false);
					clearInterval(loadingMatchesTimeout);
				}
			})();
		}
	}, [user]);

	const handleStartNewMatch = () => {
		// TODO: The idea here is totally reset the game creation modal whenever it is closed. There may be a more elegant way to handle this.
		// setIsOpenMatch(false);
		// setOpenMatchLink('');
		// setIsGenerateLinkReady(false);
		// setIsGeneratingLink(false);
		// setWordleValidationErrors([]);
		// setWordle('');
		setIsNewMatchModalOpen(true);
		// handleValidateWordle();
	};

	const handleNewMatchModalClose = () => {
		setIsNewMatchModalOpen(false);
	};

	// TODO: When a new match is made, it should probably load in the first card slot (i.e. it should appear in the top left of the match box on large devices, and at the very top on mobile devices)
	const renderMatches = (matches: Match[]) => {
		return matches.map((match) => (
			<MatchCard
				match={match}
				isLobbyMatchModalOpen={isLobbyMatchModalOpen}
				setIsLobbyMatchModalOpen={setIsLobbyMatchModalOpen}
				setIsEndTurnModalOpen={setIsEndTurnModalOpen}
			/>
		));
	};

	const handleMatchBox = () => {
		// TODO: There is some kind of over-rendering nonsense going on here
		if (isLoadingMatches) return <Loading enableCentering={false} />;

		return matches.length ? (
			<Fragment>{renderMatches(matches)}</Fragment>
		) : (
			<div className="flex flex-col gap-y-2 mx-auto max-w-lg">
				<h2 className="lobby-messages">You have no currently active matches.</h2>

				<Button
					customStyle="green-button"
					copy="Start a New Match"
					onClick={handleStartNewMatch}
				></Button>
			</div>
		);
	};

	const handleLobbyMatchModalClose = () => {
		setIsLobbyMatchModalOpen(false);
	};

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
				{/* TODO: This basis-[46rem] business is a kludge fix to ensure the layout looks right on moble */}
				{/* Hi gabriel, I added "lobby-matchbox-style here to control some colors and such from index.css in case you're wondering wtf this is. Also, you lookin fine as hell over there just fyi. ;) */}
				<div
					className={`lobby-matchbox-style ${matches.length ? '' : 'grid grid-cols-1'} `}
				>
					{handleMatchBox()}
				</div>
			</div>

			<NewMatchModal
				isOpen={isNewMatchModalOpen}
				onRequestClose={handleNewMatchModalClose}
				returnCopy={'Go Back'}
				returnAction={handleNewMatchModalClose}
			/>

			<LobbyMatchModal
				isOpen={isLobbyMatchModalOpen}
				onRequestClose={handleLobbyMatchModalClose}
			/>

			<EndTurnModal
				isOpen={isEndTurnModalOpen}
				onRequestClose={() => setIsEndTurnModalOpen(false)}
				nextWordle={nextWordle}
				setNextWordle={setNextWordle}
				gameState={determineGameState()}
			/>
		</Fragment>
	);
};

export default Lobby;
