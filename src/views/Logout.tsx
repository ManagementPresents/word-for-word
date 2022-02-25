import { useEffect, } from 'react'
import { getAuth, signOut } from "firebase/auth";

import useStore from '../utils/store';

type Props = {
//   letterStatuses: { [key: string]: string }
//   gameDisabled: boolean
//   onDeletePress: () => void
//   onEnterPress: () => void
//   addLetter: any
}

const Logout = ({}: Props) => {
    const { user } = useStore();
    
    useEffect(() => {
        if (user) {
            const auth = getAuth();

            signOut(auth).then(() => {
                alert('signed out');
            }).catch((error) => {
                alert('error signing out');
                console.log({ error })
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
