import { Fragment, useEffect, useCallback, useState } from 'react'
import { getAuth, createUserWithEmailAndPassword, } from "firebase/auth";
import { Default } from 'react-spinners-css';
// TODO: Should probably replace this with the other 'validator.js' library
import passwordValidator from 'password-validator';
import * as EmailValidator from 'email-validator';
import { useNavigate } from "react-router-dom";

import { renderErrors } from '../utils/misc';
import useStore from '../utils/store';

import { generateMatchUri, makeUpADude } from '../utils/wordUtils';

const passwordRequirements = new passwordValidator();

passwordRequirements
	.is().min(8, 'Password must have a minimum of 8 characters.')
	.is().max(25, 'Password can only have a maximum of 25 characters.')
	.has().not('', 'Password cannot have spaces').spaces();

type Props = {
//   letterStatuses: { [key: string]: string }
//   gameDisabled: boolean
//   onDeletePress: () => void
//   onEnterPress: () => void
//   addLetter: any
}

type EmailError = {
	message: string,
	isEmailError: boolean,
}

// TODO: Need to add logic for if the email already exists
const MakeUpADude = ({}: Props) => {
	const [madeUpDude, setMadeUpDude] = useState('');

	const navigate = useNavigate();

	return (
        <div className="h-full flex align-center justify-center p-[10rem]">
            {/* <button className="bg-[#DF2A2A] hover:bg-[#A41818] text-[#F1F1F9] font-bold py-2 px-4 rounded w-full" onClick={() => { alert(`YOUR MakeUpADudeION AFFIRMATION OF THE DAY IS`); alert(generateMatchUri(3, ' ')); }}>Disrupt!</button> */}

            <button className="bg-[#FFCE47] hover:bg-[#CBA82A] text-black font-bold py-2 px-4 rounded w-full" onClick={() => { setMadeUpDude(makeUpADude()) }}>Make Up a Dude!</button>
			
			<div className="text-8xl">{madeUpDude}</div>
        </div>
    );
}

export default MakeUpADude;