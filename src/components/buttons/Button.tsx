import { FC } from 'react';

interface Props {
	color: string;
	copy: string;
	customStyle?: string;
	disabled?: boolean;
	onClick?: any;
}

const Button: FC<Props> = ({ onClick, color, copy, disabled, customStyle = '' }: Props) => {
	const generateClassName = () => {
		if (color === 'green') return 'green-button';

		if (color === 'grey') return 'grey-button';

		if (color === 'yellow') return 'yellow-button';

		if (color === 'yellowHollow') return 'yellow-button-hollow';

		if (color === 'greenHollow') return 'green-button-hollow';

		if (color === 'grayHollow') return 'grey-button-hollow';
	};

	// TODO: 'disabled' states should not have a hover effect
	return (
		<button
			className={`${generateClassName()} ${
				disabled ? 'opacity-50 cursor-not-allowed' : ''
			}font-bold py-2 px-4 rounded w-full ${customStyle}`}
			onClick={onClick}
		>
			{copy}
		</button>
	);
};

export default Button;
