import { doc, getDoc } from 'firebase/firestore';

import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import Loading from '../Loading';

import { TIMEOUT_DURATION } from '../../data/constants';
import useStore from '../../utils/store';
import Match from '../../interfaces/Match';
import { isPlayerCurrentTurn } from '../../utils/misc';

const AuthRoute = ({ children, redirectTo }: any) => {
	const { 
		isLoading, 
		setIsLoading, 
		user, 
		db, 
		setCurrentMatch,
		setInviteMatchId, 
	} = useStore();

	const navigate = useNavigate();
	const params = useParams();

	const [hasMatchId, setHasMatchId] = useState();

	const { matchId } = params;

	useEffect(() => {
		setTimeout(() => {
			setIsLoading(false);

			if (!useStore.getState().user) {
				if (matchId) {
					setInviteMatchId(matchId);
					navigate(`/match/${matchId}`);
					return;
				}

				navigate(redirectTo);
			}
		}, TIMEOUT_DURATION);
		// eslint-disable-next-line
	}, []);

	useEffect(() => {
		(async () => {
			if (user) {
				const docRef = doc(db, 'matches', matchId as string);
				const match = await getDoc(docRef);

				if (match.exists()) {
					const matchData: Match = match.data() as Match;

					setIsLoading(false);
					// @ts-ignore
					setHasMatchId(true);

					setCurrentMatch(matchData);
				} else {
					navigate(redirectTo);
				}
			}
		})();
	}, [user, setIsLoading, db, navigate, params, redirectTo, setCurrentMatch, matchId]);

	return isLoading && !user && hasMatchId ? <Loading fullHeight={true} enableCentering={true}/> : children;
};

export default AuthRoute;
