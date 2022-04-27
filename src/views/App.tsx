import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

// @ts-ignore
import initializeFirebase from '../utils/firebase';
import { getAuth, onAuthStateChanged } from 'firebase/auth';

import MatchView from './MatchView';
import Login from './Login';
import Register from './Register';
import Lobby from './Lobby';
import Logout from './Logout';
import MakeUpADude from './MakeUpADude';

import useStore from '../utils/store';

import AuthRedirectRoute from '../components/wrappers/AuthRedirectRoute';
import AuthMatchRoute from '../components/wrappers/AuthMatchRoute';

interface Props {}

// This initialization happens outside the App component because it MUST run before anything else
const { app, db } = initializeFirebase();
useStore.setState({ app, db });

const App = ({}: Props) => {
	useEffect(() => {
		const auth = getAuth();

		// @ts-ignore
		useStore.setState({ app, db });

		onAuthStateChanged(auth, (user) => {
			if (user) {
				console.log('sensing a user', { user });

				useStore.setState({ user });
			} else {
				console.log('no user, for some reason');
			}
		});
	}, []);

	return (
		<BrowserRouter>
			<Routes>
				<Route
					path="/"
					element={
						<AuthRedirectRoute
							authRedirectTarget={<Navigate to="/lobby" />}
							noAuthRedirectTarget={<Login />}
						/>
					}
				/>

				{/* TODO: For some reason, when this redirects back to Login, the url remains as '/lobby' */}
				<Route
					path="/lobby"
					element={
						<AuthRedirectRoute
							authRedirectTarget={<Lobby />}
							noAuthRedirectTarget={<Login />}
						/>
					}
				/>

				<Route
					path="/match/:matchId"
					element={
						<AuthMatchRoute redirectTo="/">
							<MatchView />
						</AuthMatchRoute>
					}
				/>

				<Route path="/register" element={<Register />} />

				<Route path="/logout" element={<Logout />} />

				<Route path="/makeupadude" element={<MakeUpADude />} />
			</Routes>
		</BrowserRouter>
	);
};

export default App;
