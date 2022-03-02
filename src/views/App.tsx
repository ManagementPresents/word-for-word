import { useEffect } from "react";
import { 
    BrowserRouter,
    Routes,
    Route, 
    Navigate,
} from "react-router-dom";

// @ts-ignore
import initializeFirebase from '../utils/firebase';
import { getAuth, onAuthStateChanged } from "firebase/auth";

import Match from './Match';
import Login from './Login';
import Register from './Register';
import Lobby from './Lobby';
import Logout from './Logout';

import useStore from '../utils/store';

import AuthRedirectRoute from '../components/wrappers/AuthRedirectRoute';
import AuthMatchRoute from '../components/wrappers/AuthMatchRoute';

type Props = {};

const App = ({}: Props) => {
    useEffect(() => {        
        const { app, db } = initializeFirebase();
        const auth = getAuth();

        // @ts-ignore
        useStore.setState({ app, db });

        onAuthStateChanged(auth, (user) => {
            if (user) {
                console.log('sensing a user', { user });
                // User is signed in, see docs for a list of available properties
                // https://firebase.google.com/docs/reference/js/firebase.User
                const uid = user.uid;
                
                useStore.setState({ user });
            } else {
                console.log('no user, for some reason');
                // User is signed out
                // ...
                // console.log('no user. signed out. something like that');
            }
        });
    }, []);
	
	return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={
                    <AuthRedirectRoute authRedirectTarget={<Navigate to="/lobby" />} noAuthRedirectTarget={< Login />} />
                } />

                <Route path="/lobby" element={
                    <AuthRedirectRoute authRedirectTarget={<Lobby />} noAuthRedirectTarget={< Login />} />
                } />

                <Route path="/match/:matchId" element={
                    <AuthMatchRoute redirectTo='/'>
                        <Match />
                    </AuthMatchRoute>
                } />

                <Route path="/register" element={<Register />} />

                <Route path="/logout" element={<Logout />} />
            </Routes>
        </BrowserRouter>
	)
}

export default App;