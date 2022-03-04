import { useEffect, } from 'react'
import { getAuth, signOut } from "firebase/auth";
import { useNavigate } from 'react-router-dom';

import useStore from '../utils/store';

interface Props {
//   keyboardStatus: { [key: string]: string }
//   gameDisabled: boolean
//   onDeletePress: () => void
//   onEnterPress: () => void
//   addLetter: any
}

const Logout = ({}: Props) => {
    const { user, setUser } = useStore();
    const navigate = useNavigate();

    useEffect(() => {
        if (user) {
            const auth = getAuth();

            signOut(auth).then(() => {
                alert('signed out');
                setUser(null);
                navigate('/');
            }).catch((error) => {
                alert('error signing out');
                console.log({ error })
                navigate('/');
            });
        }
    }, [user]);

	return (
		<div className="min-h-full flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
            lobby
		</div>
	)
}

export default Logout;
