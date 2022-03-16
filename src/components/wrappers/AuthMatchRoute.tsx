import { doc, getDoc } from 'firebase/firestore';

import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import Loading from '../Loading';

import { TIMEOUT_DURATION } from '../../utils/constants';
import useStore from '../../utils/store';
import Match from '../../interfaces/Match';
import { isPlayerCurrentTurn } from '../../utils/misc';

const AuthRoute = ({ children, redirectTo }: any) => {
	const { isLoading, setIsLoading, user, db, setCurrentMatch } = useStore();

	const navigate = useNavigate();
	const params = useParams();

	const [hasMatchId, setHasMatchId] = useState();

	useEffect(() => {
		setTimeout(() => {
			setIsLoading(false);

			if (!useStore.getState().user) {
				navigate(redirectTo);
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
					const { players, outcome } = matchData;

					setIsLoading(false);
					// @ts-ignore
					setHasMatchId(true);

					if (outcome) {
						navigate('/');
					} else if (isUserTurn || (user.uid !== players.hostId && !players.guestId)) {
						setCurrentMatch(matchData);
					} else {
						navigate('/');
					}
				} else {
					navigate(redirectTo);
				}
			}
		})();
	}, [user, setIsLoading]);

	return isLoading && !user && hasMatchId ? <Loading /> : children;
};

export default AuthRoute;
