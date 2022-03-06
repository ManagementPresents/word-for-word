import { FC } from "react";

import { renderErrors } from '../utils/misc';
import ValidationError from '../interfaces/ValidationError';

interface Props {
    validationErrors: ValidationError[],
    handleValidationErrors: any,
}

const WordleInput: FC<Props> = ({ validationErrors, handleValidationErrors }: Props) => {
    return  <>
        <input type="text" className={`text-black text-center py-1 px-2 text-[12px] md:py-2.5 md:px-3.5 md:text-[20px] ${validationErrors.length ? 'border-red-500 focus:border-red-500 focus:ring-red-500': 'border-[#15B097] focus:border-[#15B097] focus:ring-[#15B097]'}`} placeholder="Enter a word" onChange={handleValidationErrors}></input>
        {renderErrors(validationErrors, 'text-red-500 text-[12px] md:text-sm')}
    </>
}

export default WordleInput;
  
