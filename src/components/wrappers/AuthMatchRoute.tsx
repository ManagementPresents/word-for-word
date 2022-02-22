import { doc, collection, getDoc } from "firebase/firestore"; 

import { useEffect, useState, } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { TIMEOUT_DURATION } from '../../utils/constants';
import useStore from '../../utils/store';
import Loading from '../Loading';

const AuthRoute = ({ children, redirectTo, predicate, }: any) => {
    const isLoading = useStore((state) => state.isLoading);
    const { setIsLoading } = useStore();
    const { user, db } = useStore();

    const navigate = useNavigate();
    const params = useParams();

    const [hasMatchId, setHasMatchId] = useState();
    
    useEffect(() => {
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
        (async () => {
            if (user) {
                const { matchId } = params;

                const docRef = doc(db, 'matches', matchId as string);
                const match = await getDoc(docRef);

                if (match.exists()) {
                    console.log('match existed and has room for people');
                    console.log({ match: match.data() });

                    setIsLoading(false);
                    // @ts-ignore
                    setHasMatchId(true);
                } else {
                    console.log('no such route');
                    navigate(redirectTo);
                // doc.data() will be undefined in this case
                    console.log("No such document!");
                }

                // console.log({ docSnap });
                // setIsLoading(false);
            }
        })();
    }, [user, setIsLoading]);

    return isLoading && !user && hasMatchId ? <Loading /> : children;
};

export default AuthRoute;