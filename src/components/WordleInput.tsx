import { FC } from 'react';

import { renderErrors } from '../utils/misc';
import ValidationError from '../interfaces/ValidationError';

interface Props {
	validationErrors: ValidationError[];
	handleInputChange: any;
	value: string;
}

const WordleInput: FC<Props> = ({ validationErrors, handleInputChange, value }: Props) => {
	return (
		<>
			<input
				type="text"
				className={`text-black text-center py-1 px-2 text-[12px] w-full md:py-2.5 md:px-3.5 md:text-[16px] ${
					validationErrors.length
						? 'border-[#F8E797] focus:border-[#F8E797] focus:ring-[#F8E797]'
						: 'border-[#609B94] focus:border-[#609B94] focus:ring-[#609B94]'
				}`}
				placeholder="Choose your Wordle carefully ..."
				onChange={handleInputChange}
				value={value}
			/>
			{renderErrors(validationErrors, 'text-[#F8E797] text-[12px] md:text-sm')}
		</>
	);
};

export default WordleInput;
