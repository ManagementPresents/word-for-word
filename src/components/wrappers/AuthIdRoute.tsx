import { useEffect, useState, } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { TIMEOUT_DURATION } from '../../utils/constants';
import useStore from '../../utils/store';
import Loading from '../Loading';

const AuthRoute = ({ children, redirectTo, predicate, }: any) => {
    const isLoading = useStore((state) => state.isLoading);
    const { setIsLoading } = useStore();
    const { user } = useStore();

    const navigate = useNavigate();
    const params = useParams();
    
    useEffect(() => {
        console.log({ params });
        setTimeout(() => {
            setIsLoading(false);

            if (!useStore.getState().user) {
                // console.log('redirect is triggering');
                navigate(redirectTo);
            } else {
                // console.log('there was a user, and a miracle!', useStore.getState().user);
            }

        }, TIMEOUT_DURATION);
    // eslint-disable-next-line
    }, []);

    useEffect(() => {
        if (user) setIsLoading(false);
    }, [user, setIsLoading]);

    // console.log({ userId: user });
    return isLoading && !user ? <Loading /> : children;
};

export default AuthRoute;