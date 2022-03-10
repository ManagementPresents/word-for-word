import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { makeUpADude } from '../utils/wordUtils';

// TODO: Need to add logic for if the email already exists
const MakeUpADude = () => {
	const [madeUpDude, setMadeUpDude] = useState('');

	return (
		<div className="h-full flex flex-col gap-y-3 align-center justify-center p-[10rem]">
			<button
				className="bg-[#FFCE47] hover:bg-[#CBA82A] text-black font-bold py-2 px-4 rounded w-full"
				onClick={() => {
					setMadeUpDude(makeUpADude());
				}}
			>
				Make Up a Dude!
			</button>

			<div className="text-8xl">{madeUpDude}</div>
		</div>
	);
};

export default MakeUpADude;
