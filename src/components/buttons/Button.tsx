import { FC } from "react";

interface Props {
  onClick: any,
  color: string,
  copy: string,
}

const Button: FC<Props> = ({ onClick, color, copy }: Props) => {
  const generateClassName = () => {
    if (color === 'green') return 'green-button-style';

    if (color === 'gray') return 'gray-button-style';

    if (color === 'yellowHollow') return 'yellow-button-style--hollow';
  }

  return <button className={`${generateClassName() } font-bold py-2 px-4 rounded w-full`} onClick={onClick}>{copy}</button>;
}

export default Button;
  