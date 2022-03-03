import { FC, Fragment } from "react";
import { Default } from 'react-spinners-css';

interface Props {
  onClick: any,
  color: string,
  copy: string,
  disabled?: boolean,
  isLoading: boolean,
  isLoadingCopy: string,
}

const LoadingButton: FC<Props> = ({ onClick, color, copy, disabled, isLoading, isLoadingCopy }: Props) => {
  const generateClassName = () => {
    if (color === 'green') return 'green-button-style';

    if (color === 'gray') return 'gray-button-style';

    if (color === 'yellow') return 'yellow-button-style';

    if (color === 'yellowHollow') return 'yellow-button-style--hollow';
  }

    // TODO: Should not have a hover state when disabled
    return <button onClick={onClick} className={`${generateClassName()} py-2 px-4 rounded flex items-center justify-center gap-x-1.5 ${disabled || isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}>
        {isLoading ? <Fragment><span>{isLoadingCopy}</span> <Default color="#fff" size={20}/></Fragment> : <span>{copy}</span>}
    </button>
}

export default LoadingButton;
  