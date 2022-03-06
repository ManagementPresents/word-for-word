import { doc, collection, getDoc, setDoc } from "firebase/firestore"; 

import { useEffect, useState, } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import Loading from '../Loading';

import { TIMEOUT_DURATION } from '../../utils/constants';
import useStore from '../../utils/store';
import Match from '../../interfaces/Match';


const AuthRoute = ({ children, redirectTo, predicate, }: any) => {
    const isLoading = useStore((state) => state.isLoading);
    const { setIsLoading } = useStore();
    const { user, db, setCurrentMatch, } = useStore();

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
                    const matchData: Match = match.data() as Match;

                    if (user.uid === matchData.players.hostId) {
                        console.log('host tried to enter when it was not their time');
                        navigate('/');
                    }

                    if (matchData.players.guestId && user.uid !== matchData.players.guestId) {
                        console.log(`a potential guest player, but there's already a guest player in here`);
                        navigate('/');
                    } 

                    if (!matchData.players.guestId) {
                        console.log(`not the host, and there's no guest already in here. come on in!`)
                        setCurrentMatch(matchData);
                    }

                    setIsLoading(false);
                    // @ts-ignore
                    setHasMatchId(true);
                } else {
                    console.log('no such route');
                    navigate(redirectTo);
                }

                // console.log({ docSnap });
                // setIsLoading(false);
            }
        })();
    }, [user, setIsLoading]);

    return isLoading && !user && hasMatchId ? <Loading /> : children;
};

export default AuthRoute;