import { FC } from "react";

interface Props {
  onClick: any,
  color: string,
  copy: string,
  disabled?: boolean,
}

const Button: FC<Props> = ({ onClick, color, copy, disabled }: Props) => {
  const generateClassName = () => {
    if (color === 'green') return 'green-button-style';

    if (color === 'gray') return 'gray-button-style';

    if (color === 'yellow') return 'yellow-button-style';

    if (color === 'yellowHollow') return 'yellow-button-style--hollow';
  }

  return <button className={`${generateClassName() } ${disabled ? 'opacity-50 cursor-not-allowed' : ''} font-bold py-2 px-4 rounded w-full`} onClick={onClick}>{copy}</button>;
}

export default Button;
  