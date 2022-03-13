import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import useEventListener from '@use-it/event-listener';

import { renderErrors } from '../utils/misc';
import useStore from '../utils/store';

import Button from '../components/buttons/Button';

const Login = () => {
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [serverErrors, setServerErrors] = useState([]);

	// https://atomizedobjects.com/blog/react/how-to-use-useref-with-typescript/
	const emailInputRef = useRef<null | HTMLInputElement>(null);
	const passwordInputRef = useRef<null | HTMLInputElement>(null);

	const navigate = useNavigate();

	useEventListener('keydown', (e: KeyboardEvent) => {
		if (e.code === 'Enter') {
			if (
				document.activeElement === emailInputRef.current ||
				document.activeElement === passwordInputRef.current
			) {
				handleSignIn();
			}
		}
	});

	const handleSignIn = () => {
		const auth = getAuth();

		signInWithEmailAndPassword(auth, email, password)
			.then((userCredential) => {
				// Signed in
				const user = userCredential.user;
				useStore.setState({ user });
				// console.log('successfully logged in');
			})
			.catch((error) => {
				const { code } = error;

				// console.log({ code })
				let serverErrors = [];

				switch (code) {
					case 'auth/invalid-email':
						serverErrors.push({ message: 'Not a valid email account.' });
						break;
					case 'auth/user-not-found':
						serverErrors.push({ message: 'No accounts with that email.' });
						break;
					case 'auth/too-many-requests':
						serverErrors.push({
							message: 'Too many attempts. Try again n a few minutes.',
						});
						break;
					case 'auth/wrong-password':
						serverErrors.push({ message: 'Incorrect login.' });
						break;
					case 'auth/internal-error':
						serverErrors.push({ message: 'Error while logging in. Please try again.' });
						break;
					default:
						break;
				}

				// @ts-ignore
				setServerErrors(serverErrors);
			});
	};

	return (
		<div className="min-h-full flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
			<div className="flex flex-col items-center justify-center max-w-lg w-full gap-y-4">
				<h1 className="text-center text-6xl">Word for Word</h1>

				<div className="rounded-md shadow-sm w-[inherit]">
					<div>
						{/* 
							TODO: This needs to turn red when there are validation errors 
							Also need to ensure the focus colors are correct
						*/}
						<label htmlFor="email-address" className="sr-only">
							Email address
						</label>
						<input
							ref={emailInputRef}
							id="email-address"
							name="email"
							type="email"
							autoComplete="email"
							required
							className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-grey-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
							placeholder="Email address"
							value={email}
							onChange={(e) => setEmail(e.target.value)}
						/>
					</div>

					<div>
						<label htmlFor="password" className="sr-only">
							Password
						</label>
						<input
							ref={passwordInputRef}
							id="password"
							name="password"
							type="password"
							autoComplete="current-password"
							required
							className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-grey-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
							placeholder="Password"
							value={password}
							onChange={(e) => setPassword(e.target.value)}
						/>
					</div>

					{
						serverErrors.length ? 
							<div className="flex flex-col">
								{renderErrors(serverErrors, 'text-blue-600 text-sm')}
							</div> : 
							<></>
					}

					<a href="/" className="text-sm font-medium yellow-link mt-2">
						{' '}
						Forgot your password?{' '}
					</a>
				</div>

				{/* TODO: Need to make sure this works when hitting 'Enter' */}
				<div className="flex flex-col gap-y-4 w-[inherit] items-center">
					{/* TODO: Should be a LoadingButton */}
					<Button onClick={handleSignIn} customStyle="green-match-button" copy="Sign In" />
					<Button
						onClick={() => {
							navigate('/register');
						}}
						customStyle="yellow-match-button"
						copy="Register (It's Free!)"
					/>
				</div>
			</div>
		</div>
	);
};

export default Login;
