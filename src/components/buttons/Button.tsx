import { FC } from 'react';

interface Props {
	copy: string;
	customStyle?: string;
	disabled?: boolean;
	onClick?: any;
}

const Button: FC<Props> = ({ onClick, copy, disabled, customStyle = '' }: Props) => {
	// TODO: 'disabled' states should not have a hover effect
	return (
		<button
			className={`${customStyle} ${
				disabled ? 'opacity-50 cursor-not-allowed' : ''
			}font-bold py-2 px-4 rounded w-full`}
			onClick={onClick}
		>
			{copy}
		</button>
	);
};

export default Button;
