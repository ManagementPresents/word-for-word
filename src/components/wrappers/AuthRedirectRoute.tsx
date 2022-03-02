import { useEffect, useState, } from 'react';
import { useNavigate } from 'react-router-dom';

import { TIMEOUT_DURATION } from '../../utils/constants';
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
                console.log('timed out auth redirect');
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


    if (isLoading) return <Loading enableCentering={true} />;

    if (user) return authRedirectTarget;

    if ((!user && setHasCheckedUser) || (!user && isTimedOut)) return noAuthRedirectTarget;

    // TODO: A little silly, but it prevents the "no elements returned" error
    return <div></div>
};

export default AuthRedirectRoute;