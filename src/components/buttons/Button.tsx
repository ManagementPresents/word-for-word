import { FC } from "react";

interface Props {
  color: string,
  copy: string,
  customStyle?: string,
  disabled?: boolean,
  onClick?: any,
}

const Button: FC<Props> = ({ onClick, color, copy, disabled, customStyle }: Props) => {
  const generateClassName = () => {
    if (color === 'green') return 'green-button-style';

    if (color === 'gray') return 'gray-button-style';

    if (color === 'yellow') return 'yellow-button-style';

    if (color === 'yellowHollow') return 'yellow-button-style--hollow';
  }

  return <button className={`${generateClassName() } ${disabled ? 'opacity-50 cursor-not-allowed' : ''} font-bold py-2 px-4 rounded w-full ${customStyle}`} onClick={onClick}>{copy}</button>;
}

export default Button;
  