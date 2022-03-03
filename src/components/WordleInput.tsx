import { FC } from "react";

import { renderErrors } from '../utils/misc';
import ValidationError from '../types/ValidationError';

interface Props {
    validationErrors: ValidationError[],
    handleValidationErrors: any,
}

const WordleInput: FC<Props> = ({ validationErrors, handleValidationErrors }: Props) => {
    return  <>
        <input type="text" className={`text-black ${validationErrors.length ? 'border-red-500 focus:border-red-500 focus:ring-red-500': 'border-[#15B097] focus:border-[#15B097] focus:ring-[#15B097]'}`} placeholder="Enter a word" onChange={handleValidationErrors}></input>
        {renderErrors(validationErrors, 'text-red-500 text-sm')}
    </>
}

export default WordleInput;
  
