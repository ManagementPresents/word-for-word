import { doc, getDoc } from 'firebase/firestore';

import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import Loading from '../Loading';

import { TIMEOUT_DURATION } from '../../utils/constants';
import useStore from '../../utils/store';
import Match from '../../interfaces/Match';
import { isPlayerCurrentTurn } from '../../utils/misc';

const AuthRoute = ({ children, redirectTo, predicate }: any) => {
	const { isLoading, setIsLoading, user, db, setCurrentMatch } = useStore();

	const navigate = useNavigate();
	const params = useParams();

	const [hasMatchId, setHasMatchId] = useState();

	useEffect(() => {
		setTimeout(() => {
			setIsLoading(false);

			if (!useStore.getState().user) {
				console.log('redirect is triggering');
				navigate(redirectTo);
			} else {
				console.log('there was a user, and a miracle!', useStore.getState().user);
			}
		}, TIMEOUT_DURATION);
		// eslint-disable-next-line
	}, []);

	useEffect(() => {
		(async () => {
			if (user) {
				const { matchId } = params;

				const docRef = doc(db, 'matches', matchId as string);
				const match = await getDoc(docRef);

				if (match.exists()) {
					const matchData: Match = match.data() as Match;
					const isUserTurn: boolean = isPlayerCurrentTurn(matchData, user.uid);
					const { players, isMatchEnded } = matchData;

					setIsLoading(false);
					// @ts-ignore
					setHasMatchId(true);

					if (isMatchEnded) {
						console.log('this match is over and cannot be entered');
						navigate('/');
					} else if (isUserTurn || (user.uid !== players.hostId && !players.guestId)) {
						console.log('whoever you are, it is your turn, and your time to enter');
						setCurrentMatch(matchData);
					} else {
						console.log('for some reason, you cannot enter this match');
						navigate('/');
					}
				} else {
					console.log('no such match');
					navigate(redirectTo);
				}
			}
		})();
	}, [user, setIsLoading]);

	return isLoading && !user && hasMatchId ? <Loading /> : children;
};

export default AuthRoute;
