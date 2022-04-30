// TODO: There seems to be a memory leak here, caused by commit bd9aa92b58d084226eefd8f38da114b0746552dd (implement "logged out, accept match invite" flow). Seems innocuous, but is worth investigating
import { useEffect, useState } from 'react';

import { TIMEOUT_DURATION } from '../../data/constants';
import useStore from '../../utils/store';
import Loading from '../Loading';

const AuthRedirectRoute = ({ authRedirectTarget, noAuthRedirectTarget }: any) => {
	const isLoading = useStore((state) => state.isLoading);
	const { setIsLoading } = useStore();
	const { user, setHasCheckedUser } = useStore();

	const [isTimedOut, setIsTimedOut] = useState(false);

	useEffect(() => {
		setTimeout(() => {
			setIsLoading(false);

			if (!useStore.getState().user) {
				setIsTimedOut(true);
				/*
                    TODO: This is an attempt to reduce the amount of times we see the loading throbber.
                    There's probably a less fragile way to handle
                */
				setHasCheckedUser(true);
			}
		}, TIMEOUT_DURATION);
		// eslint-disable-next-line
	}, []);

	useEffect(() => {
		if (user) setIsLoading(false);
	}, [user, setIsLoading]);

	if (isLoading) return <Loading fullHeight={true} enableCentering={true} />;

	if (user) return authRedirectTarget;

	if ((!user && setHasCheckedUser) || (!user && isTimedOut)) return noAuthRedirectTarget;

	// TODO: A little silly, but it prevents the "no elements returned" error
	return <div></div>;
};

export default AuthRedirectRoute;
